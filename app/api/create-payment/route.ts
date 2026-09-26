import { NextResponse } from "next/server";

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
          amount: Number(amount),
          currency,
          redirect_url: `${origin}/payment-callback`,
          customer: {
            email,
            name,
          },
          customizations: {
            title: brand,
            description: `Secure payment to ${brand}`,
          },
          meta: {
            brand,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      console.error("Flutterwave error:", data);

      return NextResponse.json(
        {
          message: data.message || "Unable to create Flutterwave payment.",
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
        message: "Something went wrong while creating the payment.",
      },
      { status: 500 }
    );
  }
}