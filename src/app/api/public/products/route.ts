// app/api/public/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../lib/db/connect";
import { Product } from "../../../../../lib/db/models/product-model";

// Get all products - public endpoint (no auth required)
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const orderType = searchParams.get("orderType");
    const franchise = searchParams.get("franchise");
    const isActive = searchParams.get("isActive") !== "false";

    // Build query
    const query: Record<string, unknown> = { isActive };

    if (type) query.type = type;
    if (category) query.category = category;
    if (orderType) query.orderType = orderType;

    if (franchise) {
      query.$or = [
        { "availableAt.allFranchises": true },
        { "availableAt.specificFranchises": franchise },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
