import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

type TransactionForDeletion = {
  id: string;
  payment_status: string;
  flutterwave_reference: string | null;
};

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const ids = Array.isArray(body.ids)
      ? body.ids.filter(
          (id: unknown): id is string =>
            typeof id === "string" && id.trim().length > 0
        )
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No transactions selected." },
        { status: 400 }
      );
    }

    const transactionResult = await db.query<TransactionForDeletion>(
      `
        SELECT
          id,
          payment_status,
          flutterwave_reference
        FROM public.payment_transactions
        WHERE id = ANY($1::uuid[])
      `,
      [ids]
    );

    const protectedTransactions = transactionResult.rows.filter(
      (transaction) => {
        const isSuccessful =
          transaction.payment_status === "successful";

        const isTestTransaction =
          transaction.flutterwave_reference?.startsWith("FLW-MOCK-");

        return isSuccessful && !isTestTransaction;
      }
    );

    if (protectedTransactions.length > 0) {
      return NextResponse.json(
        {
          error:
            "One or more successful Live payment records are protected and cannot be deleted.",
          protectedCount: protectedTransactions.length,
        },
        { status: 403 }
      );
    }

    const result = await db.query(
      `
        DELETE FROM public.payment_transactions
        WHERE id = ANY($1::uuid[])
        RETURNING id
      `,
      [ids]
    );

    return NextResponse.json({
      success: true,
      deletedCount: result.rowCount ?? 0,
    });
  } catch (error) {
    console.error("DELETE TRANSACTIONS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete transactions." },
      { status: 500 }
    );
  }
}