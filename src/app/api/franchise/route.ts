import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth-config";
import { connectToMongoDB } from "../../../../lib/db/connect";
import { Franchise } from "../../../../lib/db/models/franchise-model";

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Option 1: Remove populate if you don't need it
    const franchises = await Franchise.find();

    // OR Option 2: Only populate if manager exists in schema
    // const franchises = await Franchise.find().populate({
    //   path: 'manager',
    //   select: 'name email phone',
    //   options: { strictPopulate: false }
    // });

    return NextResponse.json(franchises);
  } catch (error) {
    console.error("Error fetching franchises:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "address",
      "city",
      "state",
      "contact.phone",
      "contact.email",
      "contactNumber", // Add this
      "location.coordinates",
      "deliveryZones",
    ];

    const missingFields = requiredFields.filter((field) => {
      const parts = field.split(".");
      let value = body;
      for (const part of parts) {
        value = value[part];
        if (value === undefined) return true;
      }
      return false;
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate delivery zones
    for (const zone of body.deliveryZones) {
      if (
        !zone.area ||
        !zone.area.coordinates ||
        zone.area.coordinates.length === 0 ||
        zone.area.type !== "Polygon"
      ) {
        return NextResponse.json(
          { error: "Invalid delivery zone coordinates or type" },
          { status: 400 }
        );
      }
      if (!zone.zoneType || !["free", "paid"].includes(zone.zoneType)) {
        return NextResponse.json(
          { error: "Invalid zone type" },
          { status: 400 }
        );
      }
      if (zone.zoneType === "paid" && typeof zone.deliveryFee !== "number") {
        return NextResponse.json(
          { error: "Paid zones require a delivery fee" },
          { status: 400 }
        );
      }
    }

    const newFranchise = new Franchise({
      ...body,
      isActive: true,
    });

    await newFranchise.save();
    return NextResponse.json(newFranchise, { status: 201 });
  } catch (error) {
    console.error("Error creating franchise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
