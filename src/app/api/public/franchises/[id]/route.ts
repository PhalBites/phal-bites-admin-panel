// app/api/public/franchises/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../lib/db/connect";
import { Franchise } from "../../../../../../lib/db/models/franchise-model";
import { Product } from "../../../../../../lib/db/models/product-model";

// Get a specific franchise
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const franchise = await Franchise.findById(params.id);

    if (!franchise) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    // Only return active franchises
    if (!franchise.isActive) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(franchise);
  } catch (error) {
    console.error("Error fetching franchise:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Get products available at a specific franchise
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const { category, type, orderType } = body;

    const franchise = await Franchise.findById(params.id);

    if (!franchise || !franchise.isActive) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    // Build query for products
    const query: Record<string, unknown> = { isActive: true };

    if (category) query.category = category;
    if (type) query.type = type;
    if (orderType) query.orderType = orderType;

    // Find products available at this franchise
    query.$or = [
      { "availableAt.allFranchises": true },
      { "availableAt.specificFranchises": params.id },
    ];

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching franchise products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
