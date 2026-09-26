import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = request.headers.get("verif-hash");

    if (!secretHash) {
      console.error("FLW_SECRET_HASH is not configured.");

      return NextResponse.json(
        {
          message: "Webhook secret is not configured.",
        },
        { status: 500 }
      );
    }

    if (!signature || signature !== secretHash) {
      return NextResponse.json(
        {
          message: "Unauthorized webhook request.",
        },
        { status: 401 }
      );
    }

    const payload = await request.json();

    const transactionId = payload?.data?.id;
    const webhookTxRef = payload?.data?.tx_ref;

    if (!transactionId) {
      console.error("Webhook did not contain a transaction ID.");

      return NextResponse.json(
        {
          message: "Transaction ID is missing.",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      console.error("FLW_SECRET_KEY is not configured.");

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

    const verification = await response.json();

    if (
      !response.ok ||
      verification.status !== "success" ||
      !verification.data
    ) {
      console.error("Flutterwave webhook verification failed:", {
        transactionId,
        verification,
      });

      return NextResponse.json(
        {
          message: "Unable to verify Flutterwave transaction.",
        },
        { status: 400 }
      );
    }

    const transaction = verification.data;

    const transactionSuccessful =
      transaction.status === "successful";

    const referenceMatches =
      !webhookTxRef ||
      transaction.tx_ref === webhookTxRef;

    if (!transactionSuccessful || !referenceMatches) {
      console.error("Webhook transaction verification failed:", {
        transactionId,
        transactionStatus: transaction.status,
        webhookTxRef,
        verifiedTxRef: transaction.tx_ref,
        transactionSuccessful,
        referenceMatches,
      });

      return NextResponse.json(
        {
          message: "Transaction verification failed.",
        },
        { status: 400 }
      );
    }

    console.log("Verified Flutterwave webhook transaction:", {
      id: transaction.id,
      tx_ref: transaction.tx_ref,
      flw_ref: transaction.flw_ref,
      amount: transaction.amount,
      charged_amount: transaction.charged_amount,
      currency: transaction.currency,
      status: transaction.status,
      payment_type: transaction.payment_type,
      customer: transaction.customer,
    });

    return NextResponse.json(
      {
        received: true,
        verified: true,
      },
      { status: 200 }
    );
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