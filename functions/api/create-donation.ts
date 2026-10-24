import Stripe from "stripe";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

const MIN_USD = 1;
const MAX_USD = 10000;

export const onRequest = async ({
  request,
  env,
}: {
  request: Request;
  env: { STRIPE_SECRET_KEY: string };
}): Promise<Response> => {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const stripeKey = env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const body = await request.json().catch(() => ({}));
    const rawAmount = Number((body as { amount?: unknown })?.amount);
    if (!Number.isFinite(rawAmount) || rawAmount < MIN_USD || rawAmount > MAX_USD) {
      return new Response(
        JSON.stringify({ error: `Amount must be between $${MIN_USD} and $${MAX_USD}.` }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }
    const amountCents = Math.round(rawAmount * 100);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" as any });
    const origin = request.headers.get("origin") || "https://binsirin.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Support BinSirin — a free Islamic khidma",
              description: "Your sadaqah keeps this free dream interpretation service running for the ummah.",
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
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[create-donation]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
};
