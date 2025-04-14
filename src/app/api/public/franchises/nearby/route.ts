// app/api/public/franchises/nearby/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../lib/db/connect";
import { Franchise } from "../../../../../../lib/db/models/franchise-model";

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const { latitude, longitude, maxDistance = 10000 } = body; // maxDistance in meters, default 10km

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Find franchises near the provided coordinates
    const nearbyFranchises = await Franchise.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance,
        },
      },
    }).select({
      name: 1,
      address: 1,
      city: 1,
      state: 1,
      location: 1,
      contact: 1,
      isActive: 1,
    });

    return NextResponse.json(nearbyFranchises);
  } catch (error) {
    console.error("Error finding nearby franchises:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
