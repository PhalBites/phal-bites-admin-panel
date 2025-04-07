require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  "mongodb+srv://PhalBites:Abbas111%40@cluster0.o0sccou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
    },
    // Additional fields
    phone: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "General",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = [
      {
        name: "Admin User",
        email: "admin@phalbites.com",
        password: await bcrypt.hash("AdminPassword123!", 10),
        role: "admin",
        phone: "+1234567890",
        department: "Administration",
        permissions: ["all"],
        isActive: true,
      },
      {
        name: "Manager User",
        email: "manager@phalbites.com",
        password: await bcrypt.hash("ManagerPass456!", 10),
        role: "manager",
        phone: "+1987654321",
        department: "Operations",
        permissions: ["view_orders", "edit_orders", "view_users"],
        isActive: true,
      },
      {
        name: "Staff Member",
        email: "staff@phalbites.com",
        password: await bcrypt.hash("StaffPass789!", 10),
        role: "staff",
        phone: "+1472583690",
        department: "Kitchen",
        permissions: ["view_orders"],
        isActive: true,
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User already exists: ${userData.email}`);

        // Optionally update existing user
        // Uncomment the following lines if you want to update existing users
        /*
        const updated = await User.findByIdAndUpdate(
          existingUser._id,
          { $set: { ...userData, password: existingUser.password } },
          { new: true }
        );
        console.log(`Updated user: ${updated.email}`);
        */
      } else {
        const newUser = await User.create(userData);
        console.log(
          `Created new user: ${newUser.email} with role: ${newUser.role}`
        );
      }
    }

    console.log("All users processed successfully");
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
