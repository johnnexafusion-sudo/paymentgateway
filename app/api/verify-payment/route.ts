import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const transactionId = searchParams.get("transaction_id");
    const expectedTxRef = searchParams.get("tx_ref");

    if (!transactionId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Transaction ID is required.",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          status: "error",
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
      return NextResponse.json(
        {
          status: "error",
          message: data.message || "Unable to verify transaction.",
        },
        { status: 400 }
      );
    }

    const transaction = data.data;

    const referenceMatches =
      !expectedTxRef || transaction.tx_ref === expectedTxRef;

    const transactionSuccessful =
      transaction.status === "successful";

    const verificationPassed =
      transactionSuccessful && referenceMatches;

    return NextResponse.json({
      status: "success",
      verified: verificationPassed,

      transaction: {
        id: transaction.id,
        tx_ref: transaction.tx_ref,
        flw_ref: transaction.flw_ref,
        amount: transaction.amount,
        charged_amount: transaction.charged_amount,
        currency: transaction.currency,
        status: transaction.status,
        payment_type: transaction.payment_type,
        created_at: transaction.created_at,
        customer: transaction.customer,
        meta: transaction.meta || null,
      },

      checks: {
        transactionSuccessful,
        referenceMatches,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Something went wrong while verifying the payment.",
      },
      { status: 500 }
    );
  }
}