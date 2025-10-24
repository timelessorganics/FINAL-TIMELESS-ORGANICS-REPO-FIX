# Timeless Organics Launch Site Design Guidelines

## Design Approach
This is a premium, dark-themed investment platform with a sophisticated aesthetic combining earthy bronze tones, patina green accents, and slow-moving gradient animations. The design emphasizes exclusivity, natural elegance, and scarcity (limited 100 seats). Preserve the existing visual language while enhancing with modern CSS techniques.

## Core Visual Identity

### Color Palette
- **Background Dark**: #0a0a0a (primary page background)
- **Card/Surface Dark**: #121412 (elevated surfaces)
- **Text Light**: #e9ece8 (primary text)
- **Text Muted**: #b7bdb6 (secondary text)
- **Bronze Primary**: #a67c52 (primary CTA color, borders, emphasis)
- **Patina Accent**: #6f8f79 (bullet points, technical details, secondary emphasis)
- **Accent Gold**: #d8c3a5 (links, highlighted text, financial values)
- **Fine Print**: #8a9189 (legal text, timestamps)

### Animated Gradient System
**Critical Feature**: Implement slow-moving gradient effects on key text elements:
- **Gradient Colors**: Soft pastels (#b8ffe8 mint, #ffe38a yellow, #ffb499 coral) on 220% background-size
- **Animation**: 10-16 second ease-in-out infinite alternate cycle
- **Application**: Kickers, hero headlines, key numbers, emphasis text
- **Effect Types**:
  - Moving Fill: Full gradient text fill with background-clip
  - Moving Tint: Layered gradient overlay at 34% opacity
  - Apply saturation boost (1.25-1.28) and brightness increase (1.1-1.16)

### Typography
- **Display Font**: Playfair Display (700, 900 weights) - All headings
- **Body Font**: Inter (400, 600 weights) - All body text, UI elements
- **Monospace**: ui-monospace/Menlo/Consolas - Code displays, unique IDs
- **Hierarchy**:
  - H1: clamp(34px, 6.5vw, 64px), line-height 1.08
  - Kicker text: 12px uppercase, letter-spacing 0.08em
  - Brand labels: 13px uppercase, letter-spacing 0.12em, weight 600
  - Body: 16px base with natural line-height

### Layout System
**Spacing**: Use Tailwind units of 4, 6, 7, 10, 12, 14, 16, 20, 28 (primary: p-7, gap-7, m-28 for sections)
- Container: max-width 1100px, padding 28px (p-7)
- Section margins: 48px vertical spacing (my-12)
- Card padding: 26px (p-6.5 or p-7)
- Grid gaps: 28px between major elements (gap-7)
- Two-column grids break to single column below 900px

### Background Treatment
**Aloe Background Image**: Fixed position covering viewport
- Position: center, size: min(95vmin, 95%)
- Opacity: 30% with grayscale(35%) and contrast(1.05) filters
- Layer two radial gradients:
  - 40% bronze glow at 110% 110% position, 8% opacity
  - 50% patina glow at -10% 120% position, 8% opacity
- All content sits above this fixed background layer (z-index management)

## Component Design

### Cards
- Background: #121412 with 1px border (#1e231e)
- Border-radius: 18px
- Padding: 26px
- Subtle shadow for depth

### Buttons
**Bronze Primary Button** (Main CTAs):
- Background: rgba(166, 124, 82, 0.08) with backdrop-blur(5px) - glassy effect
- Border: 1px solid bronze
- Padding: 12px 16px, border-radius 12px
- Font: Inter 600 weight
- Hover: Increase opacity to 0.15, translateY(-1px)
- Optional animated gradient overlay (shown on hover, 0→1 opacity)
- Text color: Accent gold with subtle text-shadow for legibility

**Secondary Buttons**:
- Background: #161a16
- Border: 1px solid #2a2f2a
- Same padding and interaction patterns

**Sticky Footer CTA**: Fixed bottom, full-width, 95% opacity background, backdrop-blur, subtle top shadow

### Form Elements
- Background: #121512
- Border: 1px solid #2a2f2a, radius 10px
- Padding: 10px 12px
- Full-width inputs with consistent styling

### Image Grid (Sculpture Selection)
- Two-column grid with 20px gap
- Border-radius: 8px on all images
- Box-shadow: 0 8px 16px rgba(0,0,0,0.6)
- Hover: Subtle lift transform
- **Special Treatment for Bronze Pieces**:
  - Float effect: translateY(-8px)
  - Border: 2px solid bronze
  - Layered glow shadow (gold inner glow + deep drop shadow)
  - Sepia/saturation filters for metallic appearance
  - Hover increases lift to -12px with brighter glow

### List Styling
- Custom bullets: Patina green (•) positioned absolute left
- 22px left padding, 6px gap between items

### Gate/Modal Overlay
- Fixed fullscreen z-index 9999
- Background: rgba(6,7,6,0.6) with optional video background
- Panel: max-width 720px, 92vw mobile
- Panel background: rgba(18,20,18,0.72) with backdrop-blur(4px)
- Border: 1px solid #253025

## Certificate Design
- Size: 8.5in × 11in (letter size)
- Background: Dark (#1f1f1f) with aloe image background
- Deep black scrim overlay: rgba(0,0,0,0.7) for text contrast
- Gold border: 15px solid accent-gold
- Title: 48px Playfair Display, gold color with double bronze underline
- Investor name: 48px weight 900 with white text-shadow glow
- Code displays: Monospace, accent-gold on subtle transparent background with dashed bronze border
- Grid layout for code/perk details with patina labels and gold values

## Interactions & Animations
- Page transitions: Smooth, 120-300ms timing
- Button hover: translateY(-1px) with opacity/background changes
- Text gradient: Slow 10-16s ease-in-out infinite alternate cycle
- No aggressive animations - maintain premium, calm aesthetic
- Loading states: Bronze-colored spinner

## Images
**Required Images**:
1. **Hero Background Aloe**: Large aloe sculpture image used as fixed background across entire site (provided: image_0ce000.jpg)
2. **Certificate Background**: Bronze aloe sculpture in resin block for PDF certificates
3. **Sculpture Gallery**: 12-18 sculpture/cutting options for patron/founder selection (placeholders provided)

**Image Treatment**: All images get subtle saturation boost (1.1) and brightness increase (1.05) for cohesive aesthetic

## Responsive Behavior
- Breakpoint: 900px for grid collapse, 720px for auxiliary layouts
- Mobile: Stack all multi-column layouts, reduce heading sizes via clamp()
- Touch targets: Minimum 44px height on mobile
- Maintain visual hierarchy and gradient effects across all viewports

## Key UX Principles
- Emphasize scarcity (50/50 seat counters prominently displayed)
- Build trust through premium aesthetic and clear value proposition
- Guided flow: Email gate → Main launch page → Seat selection → PayFast checkout → Certificate delivery
- Clear status indicators for seat availability
- Transparent pricing and perk breakdown