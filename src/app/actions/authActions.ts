"use server"

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    // Rate limiting check
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "unknown-ip";
    const ipRateLimit = await checkRateLimit(ip, "signup", 5, 60); // 5 signups per hour
    
    if (!ipRateLimit.success) {
      return { success: false, error: "Too many signup attempts. Try again later." };
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return { success: true };
  } catch (error: any) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message || "Failed to register user" };
  }
}
