import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const response = await serverApiFetch("/trips", {
      method: "POST",
      body,
    });
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de viajes." },
      { status: 502 },
    );
  }
}
