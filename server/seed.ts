import { db } from "./db";
import { seats } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // Check if seats already exist
    const existingSeats = await db.select().from(seats);
    
    if (existingSeats.length > 0) {
      console.log("Seats already exist. Skipping seed.");
      return;
    }

    // Create Founder and Patron seats
    await db.insert(seats).values([
      {
        type: "founder",
        price: 300000, // R3,000 in cents
        totalAvailable: 50,
        sold: 0,
      },
      {
        type: "patron",
        price: 500000, // R5,000 in cents
        totalAvailable: 50,
        sold: 0,
      },
    ]);

    console.log("✓ Seats seeded successfully");
    console.log("  - 50 Founder seats at R3,000");
    console.log("  - 50 Patron seats at R5,000");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Seed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
