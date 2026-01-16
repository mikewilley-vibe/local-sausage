import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat") ?? "");
  const lng = Number(searchParams.get("lng") ?? "");
  const radius = Number(searchParams.get("radius") ?? "5");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Valid lat and lng parameters required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    markets: [
      {
        name: "Local Farmers Market",
        lat,
        lng,
        distance: 0.5,
        hours: "Wed, Sat 8AM-2PM",
      },
    ],
  });
}
