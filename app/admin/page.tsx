import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

type PaymentTransaction = {
  id: string;
  transaction_ref: string;
  flutterwave_transaction_id: string | null;
  flutterwave_reference: string | null;
  customer_name: string;
  customer_email: string;
  brand: string;
  amount: string;
  charged_amount: string | null;
  currency: string;
  payment_status: string;
  payment_method: string | null;
  flutterwave_status: string | null;
  created_at: string;
  verified_at: string | null;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const result = await db.query<PaymentTransaction>(`
    SELECT
      id,
      transaction_ref,
      flutterwave_transaction_id,
      flutterwave_reference,
      customer_name,
      customer_email,
      brand,
      amount,
      charged_amount,
      currency,
      payment_status,
      payment_method,
      flutterwave_status,
      created_at,
      verified_at
    FROM public.payment_transactions
    ORDER BY created_at DESC
  `);

  const transactions = result.rows;

  const successfulTransactions = transactions.filter(
    (transaction) => transaction.payment_status === "successful"
  );

  const pendingTransactions = transactions.filter(
    (transaction) => transaction.payment_status === "pending"
  );

  const successfulRevenueByCurrency = successfulTransactions.reduce<
    Record<string, number>
  >((totals, transaction) => {
    const currency = transaction.currency.toUpperCase();

    totals[currency] =
      (totals[currency] || 0) + Number(transaction.amount);

    return totals;
  }, {});

  const currencyEntries = Object.entries(successfulRevenueByCurrency);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            PaymentGateway Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Payment Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            View and monitor payment transactions.
          </p>
        </div>

        {/* Revenue Summary */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Successful Revenue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Successful Revenue
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                $
              </div>
            </div>

            {currencyEntries.length === 0 ? (
              <p className="mt-4 text-2xl font-bold text-slate-900">
                0.00
              </p>
            ) : (
              <div className="mt-4 space-y-1">
                {currencyEntries.map(([currency, total]) => (
                  <p
                    key={currency}
                    className="text-2xl font-bold text-slate-900"
                  >
                    {currency}{" "}
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-slate-400">
              Successful payments only
            </p>
          </div>

          {/* Total Transactions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Transactions
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                #
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {transactions.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              All recorded payments
            </p>
          </div>

          {/* Successful Payments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Successful Payments
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-emerald-600">
              {successfulTransactions.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Successfully verified
            </p>
          </div>

          {/* Pending Payments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Pending Payments
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                !
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-amber-600">
              {pendingTransactions.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Awaiting completion
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Transactions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Payment records stored in Supabase.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                No payment transactions found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Brand
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Method
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {transaction.customer_name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {transaction.customer_email}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          {transaction.brand}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {transaction.currency}{" "}
                          {Number(transaction.amount).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>

                        {transaction.charged_amount &&
                          Number(transaction.charged_amount) !==
                            Number(transaction.amount) && (
                            <p className="mt-1 text-xs text-slate-500">
                              Charged: {transaction.currency}{" "}
                              {Number(
                                transaction.charged_amount
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.payment_status === "successful"
                              ? "bg-emerald-100 text-emerald-700"
                              : transaction.payment_status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {transaction.payment_status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {transaction.payment_method || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Signed in as {user.email}
        </div>
      </div>
    </main>
  );
}