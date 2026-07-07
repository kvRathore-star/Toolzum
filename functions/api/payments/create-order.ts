import Razorpay from "razorpay";
import DodoPayments from "dodopayments";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../src/db/schema";

export async function onRequestPost(context: any) {
  const { request } = context;
  
  try {
    let plan = "";
    let gateway = "";
    let userId = "guest_user";

    // Support both JSON and Form Data payloads
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      plan = body.plan || "";
      gateway = body.gateway || "";
    } else {
      const formData = await request.formData();
      plan = formData.get("plan")?.toString() || "";
      gateway = formData.get("gateway")?.toString() || "";
    }

    // Derive userId from session token, never from client-provided body
    try {
      const authHeader = request.headers.get("Authorization") || "";
      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        if (!context.env.JWT_SECRET) {
          return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const { jwtVerify } = await import("jose");
        const jwtSecret = new TextEncoder().encode(context.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, jwtSecret);
        if (payload?.sub) {
          userId = payload.sub as string;
        }
      }
    } catch {
      // Fall through with guest_user if token is invalid
    }

    // Validation
    if (!["pass", "monthly", "yearly"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan selection" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!["razorpay", "dodo"].includes(gateway)) {
      return new Response(JSON.stringify({ error: "Invalid gateway specified" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Non-blocking Turnstile check
    const turnstileToken = request.headers.get("x-turnstile-token");
    if (turnstileToken && context.env.TURNSTILE_SECRET_KEY) {
      try {
        const turnstileBody = new FormData();
        turnstileBody.append("secret", context.env.TURNSTILE_SECRET_KEY);
        turnstileBody.append("response", turnstileToken);
        const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          body: turnstileBody,
        });
        const turnstileResult: any = await turnstileRes.json();
        if (!turnstileResult.success) {
          console.warn("Turnstile verification failed for create-order");
        }
      } catch (tsErr) {
        console.warn("Turnstile verification error:", tsErr);
      }
    }

    const RAZORPAY_KEY_ID = context.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = context.env.RAZORPAY_KEY_SECRET;
    const DODO_API_KEY = context.env.DODO_API_KEY;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!DODO_API_KEY) {
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Setup Drizzle if DB binding is available
    let db: any = null;
    if (context.env.DB) {
      try {
        db = drizzle(context.env.DB, { schema });
      } catch (dbErr) {
        console.error("Drizzle initialization failed:", dbErr);
      }
    }

    // --- RAZORPAY CHECKOUT (INDIA - INR) ---
    if (gateway === "razorpay") {
      // Pricing in INR (paise)
      let amountInPaise = 24900; // Default Monthly: ₹249
      if (plan === "pass") amountInPaise = 9900; // ₹99
      if (plan === "yearly") amountInPaise = 299900; // ₹2999

      let orderId: string;
      try {
        const razorpay = new Razorpay({
          key_id: RAZORPAY_KEY_ID,
          key_secret: RAZORPAY_KEY_SECRET,
        });
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_${crypto.randomUUID().slice(0, 8)}`,
        });
        orderId = order.id;
      } catch (error: any) {
        console.error("Razorpay order creation failed:", error.message);
        return new Response(JSON.stringify({ error: "Payment gateway error" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Record payment intent in database if available
      if (db) {
        try {
          await db.insert(schema.payments).values({
            id: crypto.randomUUID(),
            userId,
            gateway: "razorpay",
            orderId: orderId,
            amount: amountInPaise / 100,
            currency: "INR",
            status: "created",
            createdAt: new Date(),
          });
        } catch (dbInsertErr) {
          console.error("Failed to log payment intent to Drizzle:", dbInsertErr);
        }
      }

      return new Response(
        JSON.stringify({
          gateway: "razorpay",
          key: RAZORPAY_KEY_ID,
          orderId: orderId,
          amount: amountInPaise,
          currency: "INR",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --- DODO PAYMENTS CHECKOUT (GLOBAL - USD) ---
    if (gateway === "dodo") {
      // Map plans to Dodo product/price IDs
      let productId = "prod_monthly_pro";
      let amount = 14.99;
      if (plan === "pass") {
        productId = "prod_weekly_pro";
        amount = 3.99;
      }
      if (plan === "yearly") {
        productId = "prod_yearly_pro";
        amount = 149.99;
      }

      let checkoutUrl: string;
      let paymentId: string;
      try {
        const client = new DodoPayments({
          bearerToken: DODO_API_KEY,
          environment: "live_mode",
        });

        const paymentInfo = await client.payments.create({
          billing: {
            city: "City",
            country: "US",
            state: "State",
            street: "123 Main St",
            zipcode: "00000",
          },
          customer: {
            email: "customer@example.com",
            name: "ToolHub User",
          },
          product_cart: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
        });
        
        paymentId = paymentInfo.payment_id;
        checkoutUrl = (paymentInfo as any).checkout_url || `https://checkout.dodopayments.com/${paymentId}`;
      } catch (error: any) {
        console.error("DodoPayments session creation failed:", error.message);
        return new Response(JSON.stringify({ error: "Payment gateway error" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Record payment intent in database if available
      if (db) {
        try {
          await db.insert(schema.payments).values({
            id: crypto.randomUUID(),
            userId,
            gateway: "dodo",
            orderId: paymentId,
            amount: amount,
            currency: "USD",
            status: "created",
            createdAt: new Date(),
          });
        } catch (dbInsertErr) {
          console.error("Failed to log payment intent to Drizzle:", dbInsertErr);
        }
      }

      return new Response(
        JSON.stringify({
          gateway: "dodo",
          paymentId: paymentId,
          checkoutUrl: checkoutUrl,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid configuration state" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Checkout route internal error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
