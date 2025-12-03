// Cape Fynbos Specimen Availability Matrix
// Based on Cape Town's winter-rainfall ecosystem (Western Cape)
// Seasons: Winter (Jun-Aug), Spring (Sep-Nov), Summer (Dec-Feb), Autumn (Mar-May)
// Shift +/- 4-6 weeks by microclimate

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export type Availability = 'peak' | 'good' | 'limited';

export interface SpecimenStyle {
  id: string;
  name: string;
  description: string;
  winter: Availability;
  spring: Availability;
  summer: Availability;
  autumn: Availability;
}

// The 9 specimen STYLES customers choose from
// Availability: peak (●), good (◐), limited (○)
export const specimenStyles: SpecimenStyle[] = [
  {
    id: 'cones-bracts-seedpods',
    name: 'Cones / Bracts / Seedpods',
    description: 'Leucadendron cones, coloured bracts, dried seedpods. Best late summer-autumn when dried.',
    winter: 'good',      // ◐
    spring: 'good',      // ◐
    summer: 'good',      // ◐
    autumn: 'peak',      // ●
  },
  {
    id: 'protea-pincushion-blooms',
    name: 'Protea Heads / Pincushion Blooms',
    description: 'King Protea, Sugarbush, Pincushion Protea. Peak late winter through spring.',
    winter: 'good',      // ◐
    spring: 'peak',      // ●
    summer: 'good',      // ◐
    autumn: 'limited',   // ○
  },
  {
    id: 'bulb-spikes',
    name: 'Bulb Spikes',
    description: 'Watsonia, Ixia, Babiana, Moraea. Wild iris and bulb flower spikes.',
    winter: 'peak',      // ●
    spring: 'peak',      // ●
    summer: 'limited',   // ○
    autumn: 'limited',   // ○
  },
  {
    id: 'branches-leaves',
    name: 'Branches + Leaves',
    description: 'Sculptural twigs with foliage. Year-round, avoid soft new growth after spring flush.',
    winter: 'peak',      // ●
    spring: 'peak',      // ●
    summer: 'peak',      // ●
    autumn: 'peak',      // ●
  },
  {
    id: 'aloe-inflorescence',
    name: 'Aloe Inflorescence Heads',
    description: 'Striking aloe flower spikes. Peak winter flowering period.',
    winter: 'peak',      // ●
    spring: 'good',      // ◐
    summer: 'limited',   // ○
    autumn: 'good',      // ◐
  },
  {
    id: 'flower-heads',
    name: 'Flower Heads',
    description: 'Pelargonium, wild geraniums, and other delicate flower heads.',
    winter: 'good',      // ◐
    spring: 'peak',      // ●
    summer: 'good',      // ◐
    autumn: 'good',      // ◐
  },
  {
    id: 'erica-sprays',
    name: 'Erica Sprays',
    description: 'Cape Heath, Heather sprays. Many winter-spring, some autumn.',
    winter: 'peak',      // ●
    spring: 'peak',      // ●
    summer: 'limited',   // ○
    autumn: 'good',      // ◐
  },
  {
    id: 'restios-grasses',
    name: 'Restios / Seedheads / Grasses',
    description: 'Cape Reed, Thatching reed. Structural year-round.',
    winter: 'peak',      // ●
    spring: 'peak',      // ●
    summer: 'peak',      // ●
    autumn: 'peak',      // ●
  },
  {
    id: 'small-succulents',
    name: 'Small Succulents',
    description: 'Compact rosettes, Vygies. Structure year-round, many flower autumn-winter.',
    winter: 'peak',      // ●
    spring: 'good',      // ◐
    summer: 'limited',   // ○
    autumn: 'peak',      // ●
  },
];

// Legacy alias for backward compatibility
export const specimenAvailability = specimenStyles;

// Get current Cape Town season based on date
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1; // 1-12
  
  // Cape Town (Southern Hemisphere, winter-rainfall region)
  if (month >= 6 && month <= 8) return 'winter';     // Jun-Aug
  if (month >= 9 && month <= 11) return 'spring';    // Sep-Nov
  if (month === 12 || month <= 2) return 'summer';   // Dec-Feb
  return 'autumn';                                    // Mar-May
}

// Get season display name with months
export function getSeasonDisplay(season: Season): { name: string; months: string } {
  const seasons: Record<Season, { name: string; months: string }> = {
    winter: { name: 'Winter', months: 'Jun-Aug' },
    spring: { name: 'Spring', months: 'Sep-Nov' },
    summer: { name: 'Summer', months: 'Dec-Feb' },
    autumn: { name: 'Autumn', months: 'Mar-May' },
  };
  return seasons[season];
}

// Check if a specimen style is available for "Buy & Cast Now" in current season
// Returns true for peak (●) or good (◐), false for limited (○)
export function isAvailableForCastNow(styleId: string, season: Season = getCurrentSeason()): boolean {
  const style = specimenStyles.find(s => s.id === styleId);
  if (!style) return false;
  
  const availability = style[season];
  return availability === 'peak' || availability === 'good';
}

// Get availability status for a style in a season
export function getAvailability(styleId: string, season: Season): Availability | null {
  const style = specimenStyles.find(s => s.id === styleId);
  if (!style) return null;
  return style[season];
}

// Get specimen styles available for "Buy & Cast Now" in current season
export function getStylesAvailableNow(season: Season = getCurrentSeason()): SpecimenStyle[] {
  return specimenStyles.filter(s => {
    const availability = s[season];
    return availability === 'peak' || availability === 'good';
  });
}

// Get styles NOT available for casting now (limited)
export function getStylesNotAvailableNow(season: Season = getCurrentSeason()): SpecimenStyle[] {
  return specimenStyles.filter(s => s[season] === 'limited');
}

// Get next season when specimen will be available (peak or good)
export function getNextAvailableSeason(styleId: string, currentSeason: Season = getCurrentSeason()): Season | null {
  const style = specimenStyles.find(s => s.id === styleId);
  if (!style) return null;
  
  // Already available?
  if (isAvailableForCastNow(styleId, currentSeason)) return currentSeason;
  
  // Check next seasons in order
  const seasonOrder: Season[] = ['winter', 'spring', 'summer', 'autumn'];
  const currentIndex = seasonOrder.indexOf(currentSeason);
  
  for (let i = 1; i <= 4; i++) {
    const nextSeason = seasonOrder[(currentIndex + i) % 4];
    if (isAvailableForCastNow(styleId, nextSeason)) {
      return nextSeason;
    }
  }
  
  return null;
}

// Availability styling helpers
export function getAvailabilityColor(availability: Availability): string {
  switch (availability) {
    case 'peak': return 'bg-bronze';       // ● Full bronze dot
    case 'good': return 'bg-bronze/50';    // ◐ Half bronze dot  
    case 'limited': return 'bg-border';    // ○ Grey dot
  }
}

export function getAvailabilityLabel(availability: Availability): string {
  switch (availability) {
    case 'peak': return 'Peak Season';
    case 'good': return 'Available';
    case 'limited': return 'Not Available';
  }
}

export function getAvailabilitySymbol(availability: Availability): string {
  switch (availability) {
    case 'peak': return '●';
    case 'good': return '◐';
    case 'limited': return '○';
  }
}

// Get style by ID
export function getStyleById(styleId: string): SpecimenStyle | undefined {
  return specimenStyles.find(s => s.id === styleId);
}
