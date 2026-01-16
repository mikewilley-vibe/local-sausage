import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat") ?? "");
  const lng = Number(searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Valid lat and lng parameters required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    lat,
    lng,
    timezone: "UTC",
    country: "US",
  });
}
