import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10">
          <Link
            href="/"
            className="mb-6 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            ← Back to Payment
          </Link>

          <h1 className="text-4xl font-semibold tracking-tight">
            Terms & Conditions
          </h1>

          <p className="mt-3 text-slate-400">
            Please review these terms before completing your payment.
          </p>
        </header>

        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-10">
          <div className="space-y-8 text-sm leading-7 text-slate-300">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                1. Payment Authorization
              </h2>

              <p>
                By submitting a payment through this payment portal, you
                confirm that the information provided is accurate and that you
                are authorized to use the selected payment method.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                2. Services
              </h2>

              <p>
                Payments are made for the products or professional services
                agreed upon between the client and the applicable business or
                service provider. The scope of services, deliverables,
                timelines, and applicable requirements may be communicated
                separately through email, written agreement, proposal, or
                other documented communication.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                3. Payment Processing
              </h2>

              <p>
                Payments are securely processed through Flutterwave. Payment
                card details and other sensitive payment information are
                processed by the payment provider and are not stored directly
                by this website.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                4. Payment Confirmation
              </h2>

              <p>
                A payment is considered received only after the payment
                processor confirms the transaction successfully. A client
                reaching a payment confirmation page alone does not constitute
                proof that payment was successfully completed.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                5. Refunds and Cancellations
              </h2>

              <p>
                Refunds and cancellations are handled according to the
                applicable service agreement, proposal, or refund policy
                provided to the client before or during the purchase process.
                Where a service has already commenced or been delivered,
                eligibility for a refund may be affected.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                6. Client Information
              </h2>

              <p>
                Clients are responsible for providing accurate names, email
                addresses, payment amounts, and any information required to
                deliver the purchased service. Incorrect information may delay
                processing or delivery.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                7. Service Delivery
              </h2>

              <p>
                Where the payment relates to a digital or professional
                service, delivery may be provided electronically through email,
                file transfer, client portal, or another agreed communication
                method.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                8. Payment Disputes
              </h2>

              <p>
                Clients are encouraged to contact the applicable service
                provider directly regarding questions about a payment,
                cancellation, refund, or service delivery before initiating a
                payment dispute. Transaction records, payment confirmations,
                communications, and service-delivery records may be retained
                to document the transaction.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                9. Electronic Acceptance
              </h2>

              <p>
                By checking the agreement box and proceeding with payment, you
                acknowledge that you have reviewed and accepted these Terms &
                Conditions and authorize the payment for the stated amount.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">
                10. Changes to These Terms
              </h2>

              <p>
                These Terms & Conditions may be updated when necessary. The
                version presented to a client at the time of payment may be
                retained as part of the transaction record.
              </p>
            </section>

            <section className="border-t border-slate-800 pt-6">
              <p className="text-xs leading-6 text-slate-500">
                These terms are intended as general payment and service terms
                and should be reviewed for compliance with the laws applicable
                to your business and clients before being used as your final
                legal terms.
              </p>
            </section>
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Return to Payment
          </Link>
        </div>
      </div>
    </main>
  );
}