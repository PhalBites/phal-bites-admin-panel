import mongoose, { Schema, Document } from "mongoose";

// interface IGeoZone {
//   type: "Polygon";
//   coordinates: number[][][]; // Array of coordinate arrays
// }

interface IDeliveryZone {
  name: string;
  zoneType: "free" | "paid";
  deliveryFee?: number;
  area: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface IFranchise extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  deliveryZones: IDeliveryZone[];
  contact: {
    phone: string;
    email: string;
  };
  manager?: mongoose.Types.ObjectId; // Add this line
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// lib/db/models/franchise-model.ts

const deliveryZoneSchema = new Schema<IDeliveryZone>({
  name: { type: String, required: true },
  zoneType: {
    type: String,
    enum: ["free", "paid"],
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: function () {
      return this.zoneType === "paid";
    },
  },
  area: {
    type: {
      type: String,
      enum: ["Polygon"],
      required: true,
      default: "Polygon",
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  },
});

const franchiseSchema = new Schema<IFranchise>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    contactNumber: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    deliveryZones: [deliveryZoneSchema],
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to your User model
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create 2dsphere index for location
franchiseSchema.index({ location: "2dsphere" });

export const Franchise =
  mongoose.models.Franchise ||
  mongoose.model<IFranchise>("Franchise", franchiseSchema);
