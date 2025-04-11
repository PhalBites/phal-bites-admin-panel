import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  type: "veg" | "non-veg";
  category: "meal" | "plan";
  orderType: "one-time" | "subscription";
  subscriptionDetails?: {
    duration: "weekly" | "monthly";
    daysIncluded: (
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday"
    )[];
  };
  timeOfDay: "morning" | "afternoon" | "evening" | "all-day";
  pricing: {
    basePrice: number;
    franchisePricing: {
      franchiseId: mongoose.Types.ObjectId;
      price: number;
      discount: number; // Percentage discount
    }[];
  };
  availableAt: {
    allFranchises: boolean;
    specificFranchises: mongoose.Types.ObjectId[];
  };
  images: string[];
  isActive: boolean;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["veg", "non-veg"],
      required: true,
    },
    category: {
      type: String,
      enum: ["meal", "plan"],
      required: true,
    },
    orderType: {
      type: String,
      enum: ["one-time", "subscription"],
      required: true,
    },
    subscriptionDetails: {
      duration: {
        type: String,
        enum: ["weekly", "monthly"],
        required: function () {
          return this.orderType === "subscription";
        },
      },
      daysIncluded: [
        {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      ],
    },
    timeOfDay: {
      type: String,
      enum: ["morning", "afternoon", "evening", "all-day"],
      required: true,
    },
    pricing: {
      basePrice: { type: Number, required: true },
      franchisePricing: [
        {
          franchiseId: { type: Schema.Types.ObjectId, ref: "Franchise" },
          price: { type: Number, required: true },
          discount: { type: Number, default: 0 },
        },
      ],
    },
    availableAt: {
      allFranchises: { type: Boolean, default: true },
      specificFranchises: [{ type: Schema.Types.ObjectId, ref: "Franchise" }],
    },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    ingredients: [{ type: String }],
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
