import { db } from "./db";
import { sculptures } from "@shared/schema";

async function seedSculptures() {
  console.log("Seeding sculptures database...");

  try {
    // Sample sculpture data for the Timeless Organics launch
    const sculptureData = [
      {
        name: "Aloe Aristata",
        description: "Torch Aloe with distinctive spotted leaves and vibrant orange flowers. A hardy specimen perfect for bronze casting.",
        imageUrl: "/images/sculptures/aloe-aristata.jpg",
        availableFor: null, // Available for both founder and patron
        isBronze: true,
        displayOrder: 1,
      },
      {
        name: "Aloe Arborescens",
        description: "Tree Aloe with dramatic branching structure. Creates stunning architectural bronze pieces.",
        imageUrl: "/images/sculptures/aloe-arborescens.jpg",
        availableFor: null,
        isBronze: true,
        displayOrder: 2,
      },
      {
        name: "Aloe Vera Cutting - Small",
        description: "Classic medicinal aloe with smooth, plump leaves. Perfect for first-time casting.",
        imageUrl: "/images/sculptures/aloe-vera-small.jpg",
        availableFor: "founder" as const,
        isBronze: false,
        displayOrder: 3,
      },
      {
        name: "Aloe Vera Cutting - Large",
        description: "Mature aloe specimen with prominent gel-filled leaves. Premium bronze casting option.",
        imageUrl: "/images/sculptures/aloe-vera-large.jpg",
        availableFor: "patron" as const,
        isBronze: true,
        displayOrder: 4,
      },
      {
        name: "Aloe Ferox",
        description: "Bitter Aloe with distinctive red-tipped leaves. Creates dramatic shadow play in bronze.",
        imageUrl: "/images/sculptures/aloe-ferox.jpg",
        availableFor: "patron" as const,
        isBronze: true,
        displayOrder: 5,
      },
      {
        name: "Aloe Polyphylla",
        description: "Spiral Aloe - the crown jewel of our collection. Sacred geometric form perfect for meditation spaces.",
        imageUrl: "/images/sculptures/aloe-polyphylla.jpg",
        availableFor: "patron" as const,
        isBronze: true,
        displayOrder: 6,
      },
      {
        name: "Aloe Marlothii",
        description: "Mountain Aloe with robust, spiny leaves. Creates powerful, protective bronze sculptures.",
        imageUrl: "/images/sculptures/aloe-marlothii.jpg",
        availableFor: null,
        isBronze: true,
        displayOrder: 7,
      },
      {
        name: "Aloe Dichotoma",
        description: "Quiver Tree cutting with distinctive branching pattern. Limited edition bronze casting.",
        imageUrl: "/images/sculptures/aloe-dichotoma.jpg",
        availableFor: "patron" as const,
        isBronze: true,
        displayOrder: 8,
      },
      {
        name: "Aloe Striata",
        description: "Coral Aloe with smooth, striped leaves in blue-green hues. Elegant bronze statement piece.",
        imageUrl: "/images/sculptures/aloe-striata.jpg",
        availableFor: null,
        isBronze: false,
        displayOrder: 9,
      },
      {
        name: "Aloe Microstigma",
        description: "Spotted aloe with delicate texture. Creates intricate detail in lost-wax casting.",
        imageUrl: "/images/sculptures/aloe-microstigma.jpg",
        availableFor: "founder" as const,
        isBronze: false,
        displayOrder: 10,
      },
    ];

    // Insert sculptures
    for (const sculpture of sculptureData) {
      await db.insert(sculptures).values(sculpture);
      console.log(`✓ Added sculpture: ${sculpture.name}`);
    }

    console.log(`\n✓ Successfully seeded ${sculptureData.length} sculptures`);
  } catch (error) {
    console.error("Error seeding sculptures:", error);
    throw error;
  }
}

seedSculptures()
  .then(() => {
    console.log("Sculpture seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Sculpture seeding failed:", error);
    process.exit(1);
  });
