import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = request.headers.get("verif-hash");

    if (!secretHash) {
      console.error("Webhook secret is not configured.");

      return NextResponse.json(
        {
          message: "Webhook secret is not configured.",
        },
        { status: 500 }
      );
    }

    if (!signature || signature !== secretHash) {
      console.warn("Unauthorized webhook request.");

      return NextResponse.json(
        {
          message: "Unauthorized webhook request.",
        },
        { status: 401 }
      );
    }

    const payload = await request.json();

    const transactionId = payload?.id;
    const txRef = payload?.txRef;
    const transactionStatus = payload?.status;
    const amount = payload?.amount;
    const currency = payload?.currency;

    if (!transactionId) {
      console.error("Webhook did not contain a transaction ID.");

      return NextResponse.json(
        {
          message: "Webhook did not contain a transaction ID.",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      console.error("Flutterwave Secret Key is not configured.");

      return NextResponse.json(
        {
          message: "Flutterwave Secret Key is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
        transactionId
      )}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success" || !data.data) {
      console.error("Webhook transaction verification failed:", data);

      return NextResponse.json(
        {
          message: "Unable to verify webhook transaction.",
        },
        { status: 400 }
      );
    }

    const transaction = data.data;

    const referenceMatches =
      !txRef || transaction.tx_ref === txRef;

    const statusMatches =
      transaction.status === "successful";

    const amountMatches =
      Number(transaction.amount) === Number(amount);

    const currencyMatches =
      String(transaction.currency).toUpperCase() ===
      String(currency).toUpperCase();

    const verificationPassed =
      statusMatches &&
      referenceMatches &&
      amountMatches &&
      currencyMatches;

    console.log("WEBHOOK VERIFIED:", {
      transactionId,
      txRef,
      transactionStatus,
      verifiedStatus: transaction.status,
      amount,
      verifiedAmount: transaction.amount,
      currency,
      verifiedCurrency: transaction.currency,
      referenceMatches,
      statusMatches,
      amountMatches,
      currencyMatches,
      verificationPassed,
    });

    if (!verificationPassed) {
      return NextResponse.json(
        {
          received: true,
          verified: false,
          message: "Webhook transaction verification failed.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      received: true,
      verified: true,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      {
        message: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}