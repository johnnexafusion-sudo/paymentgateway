"use client";

import { useState } from "react";

export default function Home() {
  const [brand, setBrand] = useState("Inkwell Career Path");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand,
          name,
          email,
          amount,
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create payment."
        );
      }

      if (!data.link) {
        throw new Error("Flutterwave payment link was not returned.");
      }

      window.location.href = data.link;
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  const currencySymbols: Record<string, string> = {
    USD: "$",
    CAD: "C$",
    GBP: "£",
    EUR: "€",
    NGN: "₦",
  };

  const selectedSymbol = currencySymbols[currency] || "";

  const brandDescription =
    brand === "Inkwell Career Path"
      ? "Career coaching, resume strategy and professional career services."
      : "Professional resume strategy, career branding and career development services.";

  const brandInitial =
    brand === "Inkwell Career Path" ? "I" : "N";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              PG
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">
                PaymentGateway
              </p>

              <p className="text-xs text-slate-500">
                Secure payment portal
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              ✓
            </span>
            Secure checkout
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_460px] lg:items-start">
          {/* Left information */}
          <div className="hidden lg:block lg:pt-10">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                Secure international payments
              </span>

              <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-slate-950">
                Complete your payment with confidence.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
                Make a secure payment to your selected service provider
                through our protected payment portal.
              </p>

              {/* Selected business preview */}
              <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Paying to
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
                    {brandInitial}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {brand}
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {brandDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    1
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      Enter your details
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Provide your name, email and payment amount.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    2
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      Review your payment
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Confirm the selected business and payment currency.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    3
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      Pay securely
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Complete checkout through our secure payment
                      processor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-3 border-t border-slate-200 pt-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Protected checkout
                  </p>

                  <p className="text-xs text-slate-500">
                    Payments securely processed through Flutterwave.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment card */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            {/* Card header */}
            <div className="border-b border-slate-100 px-7 py-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Checkout
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    Make a payment
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  $
                </div>
              </div>

              {/* Selected brand */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  {brandInitial}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Payment to
                  </p>

                  <p className="truncate text-sm font-bold text-slate-900">
                    {brand}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Enter your information below to continue to secure
                checkout.
              </p>
            </div>

            <div className="p-7">
              {/* Brand */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Payment Brand
                </label>

                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                >
                  <option>Inkwell Career Path</option>
                  <option>Nexa Career Solutions</option>
                </select>
              </div>

              {/* Name */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                />
              </div>

              {/* Currency + amount */}
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Currency
                  </label>

                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="CAD">CAD — Canadian Dollar</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="NGN">NGN — Nigerian Naira</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Amount
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      {selectedSymbol}
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                    />
                  </div>
                </div>
              </div>

              {/* Payment summary */}
              {amount && Number(amount) > 0 && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        Payment total
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Paying to {brand}
                      </p>
                    </div>

                    <p className="text-right text-xl font-bold text-slate-950">
                      {selectedSymbol}
                      {Number(amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-sm font-semibold text-slate-500">
                        {currency}
                      </span>
                    </p>
                  </div>

                  <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-400">
                    You will be redirected to secure checkout to complete
                    your payment.
                  </p>
                </div>
              )}

              {/* Terms */}
              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-slate-900"
                  />

                  <p className="text-sm leading-6 text-slate-500">
                    I have read and agree to{" "}
                    <a
                      href="/terms"
                      className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-600"
                    >
                      the Terms & Conditions
                    </a>
                    . I confirm that the information provided is accurate
                    and that I authorize this payment.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              {/* Button */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={
                  !agreed ||
                  !amount ||
                  !name ||
                  !email ||
                  loading
                }
                className="w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "Creating Secure Payment..."
                  : "Continue to Secure Payment →"}
              </button>

              {/* Security */}
              <div className="mt-5 flex items-center justify-center gap-2 text-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                  ✓
                </span>

                <p className="text-xs text-slate-400">
                  Secure payment processing by Flutterwave
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Mobile brand information */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Paying to
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              {brandInitial}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {brand}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {brandDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          PaymentGateway • Secure International Payments
        </footer>
      </div>
    </main>
  );
}