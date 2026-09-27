import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    if (!transactionId || !txRef) {
      console.error(
        "Webhook did not contain the required transaction information."
      );

      return NextResponse.json(
        {
          message:
            "Webhook did not contain the required transaction information.",
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

    /*
     * Never trust the webhook payload by itself.
     * Retrieve the transaction directly from Flutterwave.
     */
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
      transaction.tx_ref === txRef;

    const amountMatches =
      Number(transaction.amount) === Number(amount);

    const currencyMatches =
      String(transaction.currency).toUpperCase() ===
      String(currency).toUpperCase();

    const verificationPassed =
      referenceMatches &&
      amountMatches &&
      currencyMatches;

    if (!verificationPassed) {
      console.error("Webhook verification checks failed:", {
        transactionId,
        txRef,
        referenceMatches,
        amountMatches,
        currencyMatches,
      });

      return NextResponse.json(
        {
          received: true,
          verified: false,
          message: "Webhook transaction verification failed.",
        },
        { status: 400 }
      );
    }

    /*
     * Flutterwave's verified transaction is now trusted.
     * Update the matching PaymentGateway database record.
     *
     * This uses transaction_ref as the idempotent lookup key.
     * Repeated webhook notifications update the same row
     * rather than creating duplicate payment records.
     */
    const paymentStatus =
      transaction.status === "successful"
        ? "successful"
        : String(transaction.status || "pending");

    const updateResult = await db.query(
      `
        UPDATE public.payment_transactions
        SET
          flutterwave_transaction_id = $1,
          flutterwave_reference = $2,
          charged_amount = $3,
          payment_status = $4,
          payment_method = $5,
          flutterwave_status = $6,
          metadata = $7,
          updated_at = now(),
          verified_at = CASE
            WHEN $4 = 'successful' THEN now()
            ELSE verified_at
          END
        WHERE transaction_ref = $8
        RETURNING id, transaction_ref, payment_status
      `,
      [
        String(transaction.id),
        transaction.flw_ref || null,
        Number(transaction.charged_amount),
        paymentStatus,
        transaction.payment_type || null,
        transaction.status || null,
        JSON.stringify(transaction.meta || null),
        transaction.tx_ref,
      ]
    );

    if (updateResult.rowCount === 0) {
      console.warn(
        "Verified webhook transaction has no matching database record:",
        transaction.tx_ref
      );

      return NextResponse.json({
        received: true,
        verified: true,
        databaseUpdated: false,
        message:
          "Webhook verified, but no matching payment record was found.",
      });
    }

    console.log("WEBHOOK DATABASE UPDATE:", {
      transactionId: transaction.id,
      txRef: transaction.tx_ref,
      status: paymentStatus,
      databaseRecordId: updateResult.rows[0].id,
    });

    return NextResponse.json({
      received: true,
      verified: true,
      databaseUpdated: true,
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