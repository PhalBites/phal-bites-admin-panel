import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cachedConnection: typeof mongoose | null = null;

export async function connectToMongoDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    console.log("Connection Successful");
    const connection = await mongoose.connect(MONGODB_URI);
    cachedConnection = connection;
    return connection.connection.getClient();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
