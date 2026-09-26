import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = request.headers.get("verif-hash");

    if (!secretHash) {
      console.error("FLW_SECRET_HASH is not configured.");
      return NextResponse.json(
        { message: "Webhook secret is not configured." },
        { status: 500 }
      );
    }

    if (!signature || signature !== secretHash) {
      return NextResponse.json(
        { message: "Unauthorized webhook request." },
        { status: 401 }
      );
    }

    const payload = await request.json();

    console.log("Flutterwave webhook received:", payload);

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      { message: "Webhook processing failed." },
      { status: 500 }
    );
  }
}