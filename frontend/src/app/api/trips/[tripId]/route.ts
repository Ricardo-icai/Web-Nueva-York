import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{ tripId: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { tripId } = await context.params;

  try {
    const body = await request.text();
    const response = await serverApiFetch(`/trips/${tripId}`, {
      method: "PUT",
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
