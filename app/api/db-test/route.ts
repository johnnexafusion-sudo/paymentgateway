import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query("SELECT NOW() AS current_time");

    return NextResponse.json({
      success: true,
      message: "Vercel database connection is working.",
      currentTime: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Vercel database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Vercel database connection failed.",
      },
      { status: 500 }
    );
  }
}