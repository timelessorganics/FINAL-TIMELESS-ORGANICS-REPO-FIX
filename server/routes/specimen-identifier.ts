
import { Router } from "express";
import multer from "multer";
import { isAuthenticated } from "../supabaseAuth";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Specimen identification endpoint
router.post("/identify", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // TODO: Integrate with Google Vision API or similar for actual identification
    // For now, return mock data based on common Cape Fynbos patterns

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock identification result
    const mockResults = [
      {
        species: "Protea cynaroides",
        commonName: "King Protea",
        castingSuitability: "excellent" as const,
        suitabilityReason: "Large, structurally robust flower head with excellent detail retention. Ideal for lost-wax casting.",
        estimatedPrice: 2500000, // R25,000
        recommendedStyle: "Protea Head",
        seasonalNotes: "Best collected in winter-spring (June-September) when flowers are fully formed.",
      },
      {
        species: "Leucospermum cordifolium",
        commonName: "Pincushion Protea",
        castingSuitability: "good" as const,
        suitabilityReason: "Delicate pin-like structures require careful handling but create stunning bronzes with unique texture.",
        estimatedPrice: 2000000, // R20,000
        recommendedStyle: "Pincushion Bloom",
        seasonalNotes: "Peak season: Spring (September-November). Flowers must be fresh for best detail.",
      },
      {
        species: "Aloe ferox",
        commonName: "Bitter Aloe",
        castingSuitability: "excellent" as const,
        suitabilityReason: "Succulent rosettes and flowering spikes both cast beautifully. Very forgiving material.",
        estimatedPrice: 1800000, // R18,000
        recommendedStyle: "Aloe Inflorescence",
        seasonalNotes: "Rosettes available year-round. Flowering spikes best in winter (May-August).",
      },
    ];

    // Return random result for demo
    const result = mockResults[Math.floor(Math.random() * mockResults.length)];

    res.json(result);
  } catch (error: any) {
    console.error("Specimen identification error:", error);
    res.status(500).json({ message: "Failed to identify specimen" });
  }
});

export default router;
