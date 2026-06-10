import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/server-api";

export async function GET() {
  try {
    const response = await serverApiFetch("/media/hero-image", { method: "GET" });
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { imageUrl: "/images/hero-nyc.svg" },
      { status: 200 },
    );
  }
}
