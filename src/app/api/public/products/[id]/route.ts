// app/api/public/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../lib/db/connect";
import { Product } from "../../../../../../lib/db/models/product-model";

// Get a specific product - public endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Only return active products
    if (!product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
