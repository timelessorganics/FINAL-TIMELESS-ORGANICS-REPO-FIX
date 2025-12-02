import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  console.log("Setting up admin user...");

  try {
    // Get the admin email from environment or use a default
    const adminEmail = process.env.ADMIN_EMAIL || "studio@timeless.organic";

    console.log(`Looking for user with email: ${adminEmail}`);

    // Find user by email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (!existingUser) {
      console.log(`No user found with email ${adminEmail}`);
      console.log(
        "Please log in with this email first, then run this script again.",
      );
      return;
    }

    // Update user to be admin
    await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.email, adminEmail));

    console.log(`✓ User ${adminEmail} is now an admin`);
    console.log(`  User ID: ${existingUser.id}`);
  } catch (error) {
    console.error("Error setting up admin:", error);
    throw error;
  }
}

seedAdmin()
  .then(() => {
    console.log("Admin setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Admin setup failed:", error);
    process.exit(1);
  });
