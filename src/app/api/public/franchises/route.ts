// app/api/public/franchises/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../lib/db/connect";
import { Franchise } from "../../../../../lib/db/models/franchise-model";

// Get all franchises - public endpoint
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    // Only return active franchises by default
    const { searchParams } = new URL(request.url);
    const showInactive = searchParams.get("showInactive") === "true";

    const query = showInactive ? {} : { isActive: true };

    const franchises = await Franchise.find(query).select({
      name: 1,
      address: 1,
      city: 1,
      state: 1,
      location: 1,
      contact: 1,
      isActive: 1,
    });

    return NextResponse.json(franchises);
  } catch (error) {
    console.error("Error fetching franchises:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
