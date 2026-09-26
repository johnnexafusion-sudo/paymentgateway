import { NextResponse } from "next/server";

const ALLOWED_CURRENCIES = ["USD", "CAD", "GBP", "EUR", "NGN"] as const;

const ALLOWED_BRANDS = [
  "Inkwell Career Path",
  "Nexa Career Solutions",
] as const;

const MAX_AMOUNTS: Record<
  (typeof ALLOWED_CURRENCIES)[number],
  number
> = {
  USD: 100000,
  CAD: 100000,
  GBP: 100000,
  EUR: 100000,
  NGN: 100000000,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, amount, currency, brand } = body;

    if (!name || !email || !amount || !currency || !brand) {
      return NextResponse.json(
        {
          message: "Missing required payment information.",
        },
        { status: 400 }
      );
    }

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim();
    const normalizedCurrency = String(currency).trim().toUpperCase();
    const normalizedBrand = String(brand).trim();
    const numericAmount = Number(amount);

    if (!normalizedName || !normalizedEmail) {
      return NextResponse.json(
        {
          message: "Name and email are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        {
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        {
          message: "Payment amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_CURRENCIES.includes(
        normalizedCurrency as (typeof ALLOWED_CURRENCIES)[number]
      )
    ) {
      return NextResponse.json(
        {
          message: "Unsupported payment currency.",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_BRANDS.includes(
        normalizedBrand as (typeof ALLOWED_BRANDS)[number]
      )
    ) {
      return NextResponse.json(
        {
          message: "Unsupported payment brand.",
        },
        { status: 400 }
      );
    }

    const maxAmount =
      MAX_AMOUNTS[
        normalizedCurrency as (typeof ALLOWED_CURRENCIES)[number]
      ];

    if (numericAmount > maxAmount) {
      return NextResponse.json(
        {
          message: `Payment amount exceeds the maximum allowed for ${normalizedCurrency}.`,
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          message: "Flutterwave Secret Key is not configured.",
        },
        { status: 500 }
      );
    }

    const origin = new URL(request.url).origin;

    const txRef = `PG-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    const response = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: numericAmount,
          currency: normalizedCurrency,
          redirect_url: `${origin}/payment-callback`,
          customer: {
            email: normalizedEmail,
            name: normalizedName,
          },
          customizations: {
            title: normalizedBrand,
            description: `Secure payment to ${normalizedBrand}`,
          },
          meta: {
            brand: normalizedBrand,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      console.error("Flutterwave error:", data);

      return NextResponse.json(
        {
          message:
            data.message ||
            "Unable to create Flutterwave payment.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      link: data.data.link,
      tx_ref: txRef,
    });
  } catch (error) {
    console.error("Payment creation error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while creating the payment.",
      },
      { status: 500 }
    );
  }
}