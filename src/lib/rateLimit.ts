import { connectToDatabase } from "@/lib/mongodb";
import RateLimit from "@/models/RateLimit";

export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowMinutes: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    // Check existing record
    const record = await RateLimit.findOne({ identifier, action });

    if (record) {
      if (record.count >= limit) {
        return { 
          success: false, 
          error: `Too many requests. Please try again later.` 
        };
      }
      
      // Increment count
      record.count += 1;
      await record.save();
    } else {
      // Create new record
      await RateLimit.create({
        identifier,
        action,
        count: 1,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open in case of DB error so we don't lock everyone out
    return { success: true }; 
  }
}
