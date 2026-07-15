import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MIN_USD = 1;
const MAX_USD = 10000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const body = await req.json().catch(() => ({}));
    const rawAmount = Number(body?.amount);
    if (!Number.isFinite(rawAmount) || rawAmount < MIN_USD || rawAmount > MAX_USD) {
      return new Response(
        JSON.stringify({ error: `Amount must be between $${MIN_USD} and $${MAX_USD}.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const amountCents = Math.round(rawAmount * 100);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const origin = req.headers.get("origin") || "https://binsirin.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Support BinSirin — a free Islamic khidma",
              description:
                "Your sadaqah keeps this free dream interpretation service running for the ummah.",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      submit_type: "donate",
      success_url: `${origin}/support?donation=success`,
      cancel_url: `${origin}/support?donation=canceled`,
      metadata: { type: "donation", amount_usd: String(rawAmount) },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[create-donation] error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
