import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = request.headers.get("verif-hash");

    if (!secretHash) {
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

    const payloadKeys = Object.keys(payload || {});

    const dataKeys =
      payload?.data &&
      typeof payload.data === "object"
        ? Object.keys(payload.data)
        : [];

    return NextResponse.json({
      diagnostic: true,
      payloadKeys,
      dataKeys,
      hasData: Boolean(payload?.data),
      hasDataId: Boolean(payload?.data?.id),
      hasDataTxRef: Boolean(payload?.data?.tx_ref),
    });
  } catch (error) {
    console.error("Webhook diagnostic error:", error);

    return NextResponse.json(
      {
        message: "Webhook diagnostic failed.",
      },
      { status: 500 }
    );
  }
}