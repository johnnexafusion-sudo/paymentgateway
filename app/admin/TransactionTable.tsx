"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type TransactionTableProps = {
  transactions: PaymentTransaction[];
};

type TransactionGroup = {
  key: string;
  label: string;
  transactions: PaymentTransaction[];
};

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const groupedTransactions = useMemo<TransactionGroup[]>(() => {
    const groups = new Map<string, TransactionGroup>();

    for (const transaction of transactions) {
      const date = new Date(transaction.created_at);

      const year = date.getFullYear();
      const month = date.getMonth();

      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      const label = date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label,
          transactions: [],
        });
      }

      groups.get(key)!.transactions.push(transaction);
    }

    return Array.from(groups.values());
  }, [transactions]);

  const allSelected =
    transactions.length > 0 &&
    selectedIds.length === transactions.length;

  function toggleTransaction(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((transaction) => transaction.id));
    }
  }

  async function handleDelete() {
    if (selectedIds.length === 0) {
      return;
    }

    const selectedTransactions = transactions.filter((transaction) =>
      selectedIds.includes(transaction.id)
    );

    const hasSuccessfulPayments = selectedTransactions.some(
      (transaction) => transaction.payment_status === "successful"
    );

    const confirmationMessage = hasSuccessfulPayments
      ? `You selected ${selectedIds.length} transaction(s), including successful payment records.\n\nDeleting a record only removes it from your PaymentGateway database. It does NOT refund or reverse any Flutterwave payment.\n\nAre you sure you want to continue?`
      : `Delete ${selectedIds.length} selected transaction(s)?\n\nThis only removes the records from your PaymentGateway database.`;

    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch("/api/admin/transactions/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete transactions.");
      }

      setSelectedIds([]);

      router.refresh();
    } catch (error) {
      console.error("DELETE TRANSACTIONS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete transactions."
      );
    } finally {
      setDeleting(false);
    }
  }

  function formatAmount(transaction: PaymentTransaction) {
    return Number(transaction.amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  function calculateMonthlyTotal(
    monthTransactions: PaymentTransaction[]
  ) {
    const totals: Record<string, number> = {};

    for (const transaction of monthTransactions) {
      if (transaction.payment_status !== "successful") {
        continue;
      }

      const currency = transaction.currency.toUpperCase();

      totals[currency] =
        (totals[currency] || 0) + Number(transaction.amount);
    }

    return Object.entries(totals);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Payment records stored in Supabase, grouped by month.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={selectedIds.length === 0 || deleting}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {deleting
            ? "Deleting..."
            : selectedIds.length > 0
              ? `Delete Selected (${selectedIds.length})`
              : "Delete Selected"}
        </button>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            No payment transactions found.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              aria-label="Select all transactions"
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm font-medium text-slate-600">
              Select all transactions
            </span>

            {selectedIds.length > 0 && (
              <span className="text-sm text-slate-500">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          <div>
            {groupedTransactions.map((group) => {
              const monthlyTotals = calculateMonthlyTotal(
                group.transactions
              );

              return (
                <section key={group.key}>
                  <div className="border-b border-slate-200 bg-white px-6 py-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {group.label}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {group.transactions.length}{" "}
                          {group.transactions.length === 1
                            ? "transaction"
                            : "transactions"}
                        </p>
                      </div>

                      {monthlyTotals.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {monthlyTotals.map(([currency, total]) => (
                            <span
                              key={currency}
                              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700"
                            >
                              {currency}{" "}
                              {total.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="w-12 px-6 py-4"></th>

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
                        {group.transactions.map((transaction) => {
                          const isSelected = selectedIds.includes(
                            transaction.id
                          );

                          return (
                            <tr
                              key={transaction.id}
                              className={`transition ${
                                isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleTransaction(transaction.id)
                                  }
                                  aria-label={`Select transaction ${transaction.transaction_ref}`}
                                  className="h-4 w-4 rounded border-slate-300"
                                />
                              </td>

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
                                  {formatAmount(transaction)}
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
                                    transaction.payment_status ===
                                    "successful"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : transaction.payment_status ===
                                          "pending"
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
                                {formatDate(transaction.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}