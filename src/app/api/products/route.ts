import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../lib/db/connect";
import { Product } from "../../../../lib/db/models/product-model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";

// Get all products
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const orderType = searchParams.get("orderType");
    const franchise = searchParams.get("franchise");

    // Build query
    const query: Record<string, unknown> = {};

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

// Create a new product
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (
      !data.name ||
      !data.description ||
      !data.type ||
      !data.category ||
      !data.orderType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Additional validation for subscription products
    if (
      data.orderType === "subscription" &&
      (!data.subscriptionDetails || !data.subscriptionDetails.duration)
    ) {
      return NextResponse.json(
        {
          error: "Subscription details are required for subscription products",
        },
        { status: 400 }
      );
    }

    const newProduct = await Product.create(data);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
