// Shared usage-limit + subscription-gating helpers for BinSirin edge functions.
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

// Lifetime free-trial caps. Anonymous visitors get 1 taste; signing up
// unlocks 2 more (3 total lifetime). After that, Premium is required for
// new interpretations. Dictionary + journal browsing stay free forever.
export const FREE_TRIAL_LIMIT = 3;
export const ANON_TRIAL_LIMIT = 1;
export const RATE_LIMIT_SECONDS = 30;

export interface AccessContext {
  userId: string | null;
  email: string | null;
  ipHash: string;
  isAdmin: boolean;
  isPremium: boolean;
  service: SupabaseClient;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const first = fwd.split(",")[0].trim();
  return first || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function resolveAccess(req: Request): Promise<AccessContext> {
  const service = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const ipHash = await sha256Hex(clientIp(req));

  let userId: string | null = null;
  let email: string | null = null;
  let isAdmin = false;
  let isPremium = false;

  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await service.auth.getUser(token);
    if (userData.user) {
      userId = userData.user.id;
      email = userData.user.email ?? null;

      const { data: adminRow } = await service
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      isAdmin = !!adminRow;

      if (!isAdmin) {
        const { data: sub } = await service
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_id", userId)
          .maybeSingle();
        if (sub?.status === "active") {
          const end = sub.current_period_end ? new Date(sub.current_period_end).getTime() : 0;
          isPremium = !end || end > Date.now();
        }
      }
    }
  }

  return { userId, email, ipHash, isAdmin, isPremium, service };
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: "rate_limited" | "monthly_limit" | "anon_limit";
  used: number;
  limit: number;
  retryAfterSeconds?: number;
}

/**
 * Checks whether the caller may perform a paid AI action right now.
 * Does NOT increment; call `recordUsage` after the action succeeds.
 */
export async function checkLimit(ctx: AccessContext): Promise<LimitCheckResult> {
  if (ctx.isAdmin || ctx.isPremium) {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const { service, userId, ipHash } = ctx;

  // Lifetime total across ALL months (trial model, not monthly reset).
  const rowsQuery = userId
    ? service.from("usage_tracking").select("count, last_at").eq("user_id", userId)
    : service.from("usage_tracking").select("count, last_at").is("user_id", null).eq("ip_hash", ipHash);

  const { data: rows } = await rowsQuery;
  const used = (rows ?? []).reduce((sum, r: any) => sum + (r.count ?? 0), 0);
  const lastAt = (rows ?? [])
    .map((r: any) => (r.last_at ? new Date(r.last_at).getTime() : 0))
    .reduce((max, t) => (t > max ? t : max), 0);
  const limit = userId ? FREE_TRIAL_LIMIT : ANON_TRIAL_LIMIT;

  if (lastAt) {
    const elapsed = (Date.now() - lastAt) / 1000;
    if (elapsed < RATE_LIMIT_SECONDS) {
      return {
        allowed: false,
        reason: "rate_limited",
        used,
        limit,
        retryAfterSeconds: Math.ceil(RATE_LIMIT_SECONDS - elapsed),
      };
    }
  }

  if (used >= limit) {
    return {
      allowed: false,
      reason: userId ? "monthly_limit" : "anon_limit",
      used,
      limit,
    };
  }

  return { allowed: true, used, limit };
}

export async function recordUsage(ctx: AccessContext): Promise<void> {
  if (ctx.isAdmin || ctx.isPremium) return;

  const month = currentMonthKey();
  const { service, userId, ipHash } = ctx;

  const query = userId
    ? service.from("usage_tracking").select("id, count").eq("user_id", userId).eq("month", month).maybeSingle()
    : service.from("usage_tracking").select("id, count").is("user_id", null).eq("ip_hash", ipHash).eq("month", month).maybeSingle();

  const { data: existing } = await query;

  if (existing) {
    await service
      .from("usage_tracking")
      .update({ count: existing.count + 1, last_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await service.from("usage_tracking").insert({
      user_id: userId,
      ip_hash: userId ? null : ipHash,
      month,
      count: 1,
      last_at: new Date().toISOString(),
    });
  }
}

export function limitResponse(result: LimitCheckResult, corsHeaders: Record<string, string>): Response {
  const status = result.reason === "rate_limited" ? 429 : 402;
  const body = {
    error: result.reason,
    message:
      result.reason === "rate_limited"
        ? `Please wait ${result.retryAfterSeconds}s before your next dream.`
        : result.reason === "anon_limit"
        ? "You've used your free interpretation for this month. Create a free account to get 3 per month."
        : "You've reached your 3 free interpretations this month. Upgrade to Premium for unlimited access.",
    used: result.used,
    limit: result.limit,
    retry_after: result.retryAfterSeconds ?? null,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
