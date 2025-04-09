import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../lib/db/connect";
import { Franchise } from "../../../../../lib/db/models/franchise-model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth-config";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToMongoDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const franchise = await Franchise.findById(params.id);

    if (!franchise) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(franchise);
  } catch (error) {
    console.error("Error fetching franchise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToMongoDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updatedFranchise = await Franchise.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    if (!updatedFranchise) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFranchise);
  } catch (error) {
    console.error("Error updating franchise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToMongoDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedFranchise = await Franchise.findByIdAndDelete(params.id);

    if (!deletedFranchise) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Franchise deleted successfully" });
  } catch (error) {
    console.error("Error deleting franchise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
