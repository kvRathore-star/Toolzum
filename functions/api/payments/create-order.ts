import Razorpay from "razorpay";
import DodoPayments from "dodopayments";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../src/db/schema";
import { jsonResponse, errorResponse, rateLimitCheck, handleOptions } from "../../_shared";

export async function onRequestPost(context: any) {
  const { request } = context;

  const options = handleOptions(request);
  if (options) return options;

  if (!await rateLimitCheck(context, request)) {
    return errorResponse("Rate limit exceeded. Try again shortly.", 429, "RATE_LIMITED");
  }
  
  try {
    let plan = "";
    let gateway = "";
    let body: Record<string, unknown> = {};
    let userId = "guest_user";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await request.json();
      plan = (body.plan as string) || "";
      gateway = (body.gateway as string) || "";
      userId = (body.guestSessionId as string) || `guest_${crypto.randomUUID().slice(0, 12)}`;
    } else {
      const formData = await request.formData();
      plan = formData.get("plan")?.toString() || "";
      gateway = formData.get("gateway")?.toString() || "";
    }

    // Derive userId from session token
    try {
      const authHeader = request.headers.get("Authorization") || "";
      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        if (!context.env.JWT_SECRET) {
          return errorResponse("JWT secret not configured", 500, undefined, request);
        }
        const { jwtVerify } = await import("jose");
        const jwtSecret = new TextEncoder().encode(context.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, jwtSecret);
        if (payload?.sub) {
          userId = payload.sub as string;
        }
      }
    } catch (jwtErr) {
      console.warn("JWT verification failed for create-order request:", jwtErr);
    }

    if (!["pass", "monthly", "yearly"].includes(plan)) {
      return errorResponse("Invalid plan selection", 400);
    }

    if (!["razorpay", "dodo"].includes(gateway)) {
      return errorResponse("Invalid gateway specified", 400);
    }

    // CAPTCHA check
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

    // Validate only the selected gateway's config
    if (gateway === "razorpay") {
      if (!context.env.RAZORPAY_KEY_ID || !context.env.RAZORPAY_KEY_SECRET) {
        return errorResponse("Razorpay gateway not configured", 500);
      }
    } else if (gateway === "dodo") {
      if (!context.env.DODO_API_KEY) {
        return errorResponse("DodoPayments gateway not configured", 500);
      }
    }

    let db: any = null;
    if (context.env.DB) {
      try {
        db = drizzle(context.env.DB, { schema });
      } catch (dbErr) {
        console.error("Drizzle initialization failed:", dbErr);
      }
    }

    const RAZORPAY_KEY_ID = context.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = context.env.RAZORPAY_KEY_SECRET;
    const DODO_API_KEY = context.env.DODO_API_KEY;

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
        return errorResponse("Payment gateway error", 502);
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

      return jsonResponse({
        gateway: "razorpay",
        key: RAZORPAY_KEY_ID,
        orderId: orderId,
        amount: amountInPaise,
        currency: "INR",
      });
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

        const billingCity = (body.billingCity as string) || "City";
        const billingCountry = (body.billingCountry as string) || "US";
        const billingState = (body.billingState as string) || "State";
        const billingStreet = (body.billingStreet as string) || "";
        const billingZipcode = (body.billingZipcode as string) || "";
        const customerEmail = (body.email as string) || "";
        const customerName = (body.name as string) || "Toolzum User";

        const paymentInfo = await client.payments.create({
          billing: {
            city: billingCity,
            country: billingCountry as 'US',
            state: billingState,
            street: billingStreet,
            zipcode: billingZipcode,
          },
          customer: {
            email: customerEmail,
            name: customerName,
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
        return errorResponse("Payment gateway error", 502);
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

      return jsonResponse({
        gateway: "dodo",
        paymentId: paymentId,
        checkoutUrl: checkoutUrl,
      });
    }

    return errorResponse("Invalid configuration state", 500);

  } catch (err: any) {
    console.error("Checkout route internal error:", err);
    return errorResponse("Internal Server Error", 500);
  }
}
