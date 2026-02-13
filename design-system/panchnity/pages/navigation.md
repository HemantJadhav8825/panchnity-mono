# Navigation Page Overrides

> **PROJECT:** Hold Yourself
> **Generated:** 2026-02-02 01:51:00
> **Page Type:** Dashboard / Data View

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content
- **Sections:** 1. Intro (Vertical), 2. The Journey (Horizontal Track), 3. Detail Reveal, 4. Vertical Footer

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- **Strategy:** Continuous palette transition. Chapter colors. Progress bar #000000.

### Component Overrides

- Avoid: Break browser/app back button behavior
- Avoid: Let nav overlap first section content
- Avoid: Use for flat single-level sites

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: z-index stacking, box-shadow elevation (4 levels), transform: translateZ(), backdrop-filter, parallax
- Navigation: Preserve navigation history properly
- Navigation: Add padding-top to body equal to nav height
- Navigation: Use for sites with 3+ levels of depth
- CTA Placement: Floating Sticky CTA or End of Horizontal Track
