// Cape Fynbos Specimen Availability Matrix
// Based on Cape Town's winter-rainfall ecosystem
// Seasons: Winter (Jun-Aug), Spring (Sep-Nov), Summer (Dec-Feb), Autumn (Mar-May)

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export type Availability = 'peak' | 'good' | 'limited';

export interface SpecimenAvailability {
  id: string;
  name: string;
  description: string;
  winter: Availability;
  spring: Availability;
  summer: Availability;
  autumn: Availability;
  peakMonths: string;
}

// Correct availability matrix for Cape Town fynbos
export const specimenAvailability: SpecimenAvailability[] = [
  {
    id: 'protea',
    name: 'Protea (flowers)',
    description: 'Single flower heads including King Protea. Multiple flushes with spring-summer peak.',
    winter: 'good',
    spring: 'peak',
    summer: 'good',
    autumn: 'limited',
    peakMonths: 'Aug-Nov (King has spring-summer peak)',
  },
  {
    id: 'leucospermum',
    name: 'Leucospermum (pincushions)',
    description: 'Vibrant pincushion blooms. Strongest in spring, early ones start late winter.',
    winter: 'good',
    spring: 'peak',
    summer: 'limited',
    autumn: 'limited',
    peakMonths: 'Jul-Oct',
  },
  {
    id: 'leucadendron-bracts',
    name: 'Leucadendron (coloured bracts)',
    description: 'Female bracts colouring. Best in winter-spring.',
    winter: 'peak',
    spring: 'peak',
    summer: 'limited',
    autumn: 'limited',
    peakMonths: 'Jun-Nov',
  },
  {
    id: 'leucadendron-cones',
    name: 'Leucadendron (cones/seedpods)',
    description: 'Cones and seeds. Best late summer-autumn once dried but before shattering.',
    winter: 'limited',
    spring: 'limited',
    summer: 'good',
    autumn: 'peak',
    peakMonths: 'Feb-May',
  },
  {
    id: 'watsonia',
    name: 'Watsonia',
    description: 'Tall spike flowers. Mostly late spring to early summer.',
    winter: 'limited',
    spring: 'good',
    summer: 'peak',
    autumn: 'limited',
    peakMonths: 'Oct-Dec',
  },
  {
    id: 'bulb-spikes',
    name: 'Bulb Spikes (Ixia/Babiana/Moraea)',
    description: 'Geophyte flower spikes. Mainly late winter through spring.',
    winter: 'peak',
    spring: 'peak',
    summer: 'limited',
    autumn: 'limited',
    peakMonths: 'Aug-Oct',
  },
  {
    id: 'restios',
    name: 'Restios / Reeds / Grasses',
    description: 'Architectural reed panicles and seedheads. Structural year-round, harvest when firm and dry.',
    winter: 'peak',
    spring: 'peak',
    summer: 'peak',
    autumn: 'peak',
    peakMonths: 'Year-round (best late summer-autumn when dried)',
  },
  {
    id: 'erica',
    name: 'Erica (heaths)',
    description: 'Fine heather-like clusters. Many winter-spring, some autumn, few in high summer.',
    winter: 'peak',
    spring: 'peak',
    summer: 'limited',
    autumn: 'good',
    peakMonths: 'Jun-Nov (varies by species)',
  },
  {
    id: 'branches-leaves',
    name: 'Branches + Leaves',
    description: 'Sculptural twigs with foliage. Usable year-round, avoid soft new growth after spring flush.',
    winter: 'peak',
    spring: 'peak',
    summer: 'peak',
    autumn: 'peak',
    peakMonths: 'Year-round',
  },
  {
    id: 'small-succulents',
    name: 'Small Succulents',
    description: 'Compact rosettes and miniature forms. Structure year-round, many flower autumn-winter.',
    winter: 'peak',
    spring: 'good',
    summer: 'limited',
    autumn: 'peak',
    peakMonths: 'Mar-Aug (flowering); structure year-round',
  },
];

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

// Check if a specimen is available for "Cast Now" in current season
export function isAvailableForCastNow(specimenId: string, season: Season = getCurrentSeason()): boolean {
  const specimen = specimenAvailability.find(s => s.id === specimenId);
  if (!specimen) return false;
  
  const availability = specimen[season];
  return availability === 'peak' || availability === 'good';
}

// Get availability status for a specimen in a season
export function getAvailability(specimenId: string, season: Season): Availability | null {
  const specimen = specimenAvailability.find(s => s.id === specimenId);
  if (!specimen) return null;
  return specimen[season];
}

// Get specimens available for "Cast Now" in current season
export function getAvailableNow(season: Season = getCurrentSeason()): SpecimenAvailability[] {
  return specimenAvailability.filter(s => {
    const availability = s[season];
    return availability === 'peak' || availability === 'good';
  });
}

// Get next season when specimen will be available
export function getNextAvailableSeason(specimenId: string, currentSeason: Season = getCurrentSeason()): Season | null {
  const specimen = specimenAvailability.find(s => s.id === specimenId);
  if (!specimen) return null;
  
  // Already available?
  if (isAvailableForCastNow(specimenId, currentSeason)) return currentSeason;
  
  // Check next seasons in order
  const seasonOrder: Season[] = ['winter', 'spring', 'summer', 'autumn'];
  const currentIndex = seasonOrder.indexOf(currentSeason);
  
  for (let i = 1; i <= 4; i++) {
    const nextSeason = seasonOrder[(currentIndex + i) % 4];
    if (isAvailableForCastNow(specimenId, nextSeason)) {
      return nextSeason;
    }
  }
  
  return null;
}

// Availability styling helpers
export function getAvailabilityColor(availability: Availability): string {
  switch (availability) {
    case 'peak': return 'bg-bronze'; // Full bronze dot
    case 'good': return 'bg-bronze/50'; // Half bronze dot
    case 'limited': return 'bg-border'; // Grey dot
  }
}

export function getAvailabilityLabel(availability: Availability): string {
  switch (availability) {
    case 'peak': return 'Peak Season';
    case 'good': return 'Available';
    case 'limited': return 'Not Available';
  }
}
