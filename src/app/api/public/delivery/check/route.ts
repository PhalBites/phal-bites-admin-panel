// app/api/public/delivery/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../lib/db/connect";
import { Franchise } from "../../../../../../lib/db/models/franchise-model";

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const { latitude, longitude, franchiseId } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Find the franchise
    const franchise = await Franchise.findById(franchiseId);

    if (!franchise || !franchise.isActive) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    // Check if the coordinates are within any delivery zone
    const point = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    let isDeliverable = false;
    let deliveryFee = 0;
    let zoneName = "";

    // Check each delivery zone
    for (const zone of franchise.deliveryZones) {
      console.log(zone);
      // Check if point is inside this polygon
      const isInZone = await Franchise.findOne({
        _id: franchiseId,
        "deliveryZones.area": {
          $geoIntersects: {
            $geometry: point,
          },
        },
      });

      if (isInZone) {
        // Find the specific zone that contains the point
        for (const z of franchise.deliveryZones) {
          const zoneContainsPoint = await Franchise.findOne({
            _id: franchiseId,
            "deliveryZones._id": z._id,
            "deliveryZones.area": {
              $geoIntersects: {
                $geometry: point,
              },
            },
          });

          if (zoneContainsPoint) {
            isDeliverable = true;
            zoneName = z.name;
            deliveryFee = z.zoneType === "paid" ? z.deliveryFee || 0 : 0;
            break;
          }
        }
        break;
      }
    }

    return NextResponse.json({
      isDeliverable,
      deliveryFee,
      zoneName,
      franchiseId: franchise._id,
      franchiseName: franchise.name,
    });
  } catch (error) {
    console.error("Error checking delivery availability:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
