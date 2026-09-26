"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerificationResult = {
  status: string;
  verified?: boolean;
  message?: string;
  transaction?: {
    id: number;
    tx_ref: string;
    flw_ref?: string;
    amount: number;
    charged_amount?: number;
    currency: string;
    status: string;
    payment_type?: string;
    created_at?: string;
    customer?: {
      email?: string;
      name?: string;
    };
    meta?: {
      brand?: string;
    } | null;
  };
  checks?: {
    transactionSuccessful?: boolean;
    referenceMatches?: boolean;
  };
};

function PaymentResult() {
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");

  const [verification, setVerification] =
    useState<VerificationResult | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyPayment() {
      if (!transactionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/verify-payment?transaction_id=${encodeURIComponent(
            transactionId
          )}&tx_ref=${encodeURIComponent(txRef || "")}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        setVerification(data);
      } catch (error) {
        console.error("Verification request failed:", error);

        setVerification({
          status: "error",
          message: "Unable to verify the transaction.",
        });
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [transactionId, txRef]);

  function handlePrintReceipt() {
    window.print();
  }

  function formatDate(dateString?: string) {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Verifying your payment
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please wait while we securely confirm your transaction.
          </p>
        </div>
      </main>
    );
  }

  const verified =
    verification?.status === "success" &&
    verification?.verified === true;

  const paymentWasCancelled =
    status === "cancelled" || status === "failed";

  const transaction = verification?.transaction;

  const customerName =
    transaction?.customer?.name || "Customer";

  const customerEmail =
    transaction?.customer?.email || "";

  const paymentBrand =
    transaction?.meta?.brand || "PaymentGateway";

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl items-center justify-center print:min-h-0">
          <section className="receipt-card w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
            <div
              className={`px-8 py-10 text-center print:border-b print:border-slate-200 print:bg-white ${
                verified
                  ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                  : "bg-gradient-to-br from-slate-700 to-slate-800"
              }`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg print:h-16 print:w-16 print:border print:border-slate-200 print:shadow-none">
                <span
                  className={`text-4xl font-bold print:text-slate-900 ${
                    verified
                      ? "text-emerald-600"
                      : "text-slate-600"
                  }`}
                >
                  {verified ? "✓" : "!"}
                </span>
              </div>

              <p className="mt-5 hidden text-xs font-bold uppercase tracking-[0.2em] text-slate-400 print:block">
                PaymentGateway
              </p>

              <h1 className="mt-6 text-3xl font-bold text-white print:text-slate-900">
                {verified
                  ? "Payment Successful"
                  : paymentWasCancelled
                    ? "Payment Cancelled"
                    : "Payment Not Verified"}
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/80 print:text-slate-500">
                {verified
                  ? "Your payment has been successfully verified and confirmed."
                  : paymentWasCancelled
                    ? "The payment was cancelled or did not complete successfully."
                    : verification?.message ||
                      "We could not confirm this payment. Please contact the service provider if you believe you completed the transaction."}
              </p>
            </div>

            <div className="px-8 py-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Payment to
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {paymentBrand}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                  {paymentBrand.charAt(0).toUpperCase()}
                </div>
              </div>

              {verified && transaction && (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Amount paid
                  </p>

                  <p className="mt-2 text-5xl font-bold tracking-tight text-slate-950">
                    {transaction.amount}
                  </p>

                  <p className="mt-1 text-lg font-semibold text-slate-500">
                    {transaction.currency}
                  </p>

                  {transaction.charged_amount !== undefined &&
                    transaction.charged_amount !== transaction.amount && (
                      <p className="mt-3 text-xs text-slate-400">
                        Charged amount:{" "}
                        {transaction.charged_amount}{" "}
                        {transaction.currency}
                      </p>
                    )}
                </div>
              )}

              {verified && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 print:bg-white">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Customer information
                  </h2>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-4">
                      <span className="text-sm text-slate-500">
                        Name
                      </span>

                      <span className="text-right text-sm font-semibold text-slate-900">
                        {customerName}
                      </span>
                    </div>

                    {customerEmail && (
                      <div className="flex items-start justify-between gap-6">
                        <span className="text-sm text-slate-500">
                          Email
                        </span>

                        <span className="break-all text-right text-sm font-semibold text-slate-900">
                          {customerEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transaction details
                </h2>

                <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {transaction?.status && (
                    <div className="flex items-center justify-between gap-6 px-5 py-4">
                      <span className="text-sm text-slate-500">
                        Status
                      </span>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                        {transaction.status}
                      </span>
                    </div>
                  )}

                  {transaction?.created_at && (
                    <div className="flex items-center justify-between gap-6 px-5 py-4">
                      <span className="text-sm text-slate-500">
                        Payment date
                      </span>

                      <span className="text-right text-sm font-medium text-slate-900">
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>
                  )}

                  {txRef && (
                    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-slate-500">
                        Transaction reference
                      </span>

                      <span className="break-all text-sm font-medium text-slate-900 sm:text-right">
                        {txRef}
                      </span>
                    </div>
                  )}

                  {transaction?.flw_ref && (
                    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-slate-500">
                        Flutterwave reference
                      </span>

                      <span className="break-all text-sm font-medium text-slate-900 sm:text-right">
                        {transaction.flw_ref}
                      </span>
                    </div>
                  )}

                  {transactionId && (
                    <div className="flex items-center justify-between gap-6 px-5 py-4">
                      <span className="text-sm text-slate-500">
                        Transaction ID
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {transactionId}
                      </span>
                    </div>
                  )}

                  {transaction?.payment_type && (
                    <div className="flex items-center justify-between gap-6 px-5 py-4">
                      <span className="text-sm text-slate-500">
                        Payment method
                      </span>

                      <span className="text-sm font-semibold capitalize text-slate-900">
                        {transaction.payment_type}
                      </span>
                    </div>
                  )}

                  {transaction?.currency && (
                    <div className="flex items-center justify-between gap-6 px-5 py-4">
                      <span className="text-sm text-slate-500">
                        Currency
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
                        {transaction.currency}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {verified && (
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 print:bg-white">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      ✓
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        Payment confirmed
                      </p>

                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        This transaction has been successfully verified
                        through Flutterwave.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
                {verified && (
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 sm:flex-1"
                  >
                    ↓ Save Receipt
                  </button>
                )}

                <a
                  href="/"
                  className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:flex-1"
                >
                  Return to Payment
                </a>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400 print:hidden">
                Payment securely processed and verified through
                Flutterwave.
              </p>

              <div className="mt-10 hidden border-t border-slate-200 pt-5 text-center print:block">
                <p className="text-xs font-semibold text-slate-500">
                  PaymentGateway
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Secure International Payments
                </p>

                <p className="mt-3 text-[10px] text-slate-400">
                  This receipt confirms the transaction details returned
                  by Flutterwave after payment verification.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 18mm;
          }

          body {
            background: white !important;
          }
        }
      `}</style>
    </>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading payment result...
          </p>
        </main>
      }
    >
      <PaymentResult />
    </Suspense>
  );
}