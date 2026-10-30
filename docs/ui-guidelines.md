# UNILOG — Neumorphism Design System & UI Guidelines

UNILOG strictly employs a premium **Neumorphic (Soft UI)** design system tailored for collegiate and institutional workflows. This aesthetic creates an ergonomic, tactile interface where interface elements appear carved out of or extruded from the background plane.

---

## 1. Color Palette Tokens

### Light Mode (Default)
- **App Background & Surface**: `#E8ECF3` (identical surface/background creates true neumorphism)
- **Text Primary**: `#1E293B` (slate-800)
- **Text Secondary**: `#64748B` (slate-500)
- **Text Muted**: `#94A3B8` (slate-400)
- **Primary Indigo**: `#4F6AE8`
- **Primary Dark**: `#3D54C9`
- **Success Green**: `#4CAF83`
- **Warning Amber**: `#E8A93C`
- **Danger Red**: `#E05C5C`
- **Shadow Light Highlight**: `#FFFFFF`
- **Shadow Dark Occlusion**: `#C5CBD8`
- **Subtle Accessibility Border**: `rgba(255, 255, 255, 0.6)`

### Dark Mode
- **App Background & Surface**: `#232733`
- **Text Primary**: `#F1F5F9` (slate-100)
- **Text Secondary**: `#94A3B8` (slate-400)
- **Text Muted**: `#64748B` (slate-500)
- **Shadow Light Highlight**: `#2D3242`
- **Shadow Dark Occlusion**: `#14171F`
- **Subtle Accessibility Border**: `rgba(255, 255, 255, 0.08)`

---

## 2. Neumorphism Shadow Utilities

The pairing of light (top-left) and dark (bottom-right) shadows creates the 3D depth:

```css
/* Light Mode */
.neu-raised {
  box-shadow: 8px 8px 16px #C5CBD8, -8px -8px 16px #FFFFFF;
}
.neu-inset {
  box-shadow: inset 6px 6px 12px #C5CBD8, inset -6px -6px 12px #FFFFFF;
}
.neu-pressed {
  box-shadow: inset 4px 4px 8px #C5CBD8, inset -4px -4px 8px #FFFFFF;
}
.neu-flat {
  box-shadow: 4px 4px 8px #C5CBD8, -4px -4px 8px #FFFFFF;
}

/* Dark Mode */
.dark .neu-raised {
  box-shadow: 8px 8px 16px #14171F, -8px -8px 16px #2D3242;
}
.dark .neu-inset {
  box-shadow: inset 6px 6px 12px #14171F, inset -6px -6px 12px #2D3242;
}
.dark .neu-pressed {
  box-shadow: inset 4px 4px 8px #14171F, inset -4px -4px 8px #2D3242;
}
.dark .neu-flat {
  box-shadow: 4px 4px 8px #14171F, -4px -4px 8px #2D3242;
}
```

---

## 3. Component Usage Rules

1. **Containers & Cards**:
   - Small cards, stat blocks, and list items: `.neu-raised rounded-2xl` (16px radius).
   - Major page containers, modals, and charts: `.neu-raised rounded-3xl` (24px radius).
2. **Form Inputs & Search**:
   - Always use `.neu-inset rounded-xl` (12px radius) with placeholder `#94A3B8`.
   - On focus: `focus:ring-2 focus:ring-[#4F6AE8]/40`.
3. **Buttons**:
   - Secondary / standard buttons: `.neu-button rounded-xl` with lift on hover and pressed state on active.
   - Primary actions: `.neu-button-primary rounded-xl` (solid `#4F6AE8` with soft ambient glow).
4. **Pills & Status Badges**:
   - Always use `.neu-pressed rounded-full` (9999px radius) with soft background tint (`bg-[#4CAF83]/10` for Present, `bg-[#E05C5C]/10` for Absent). Flat colored badges are forbidden.
5. **Navigation Sidebar**:
   - Inactive items: `.neu-flat text-[#64748B]`.
   - Active route: `.neu-inset text-[#4F6AE8] font-semibold bg-[#4F6AE8]/5`.
   - Icon size: exactly 18px (`w-[18px] h-[18px]`).

---

## 4. Typography & Layout Rhythm

- **Font**: Inter via `next/font/google`.
- **Sizes**:
  - `text-xs` (12px): labels, badges, table cells, secondary hints
  - `text-sm` (14px): buttons, table headers, descriptions
  - `text-base` (16px): card headings, input values
  - `text-xl` to `text-3xl`: page titles and primary KPI numbers
- **Spacing Scale**: 8pt grid only (4, 8, 12, 16, 24, 32, 40, 48).
- **Max Content Width**: `max-w-7xl mx-auto`.
- **Page Padding**: `px-6 py-8` on desktop, `px-4 py-6` on mobile.

---

## 5. Strict Prohibitions

- **No Pure White (`#FFFFFF`) or Pure Black (`#000000`) Backgrounds**: The background must always remain `#E8ECF3` (light) or `#232733` (dark).
- **No Tailwind Default Shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` are strictly barred.
- **No Emojis Anywhere in UI**: Icons must solely be SVGs sourced from `lucide-react`.
- **No Flat Colored Boxes**: Elements must exhibit tactile depth through light/dark shadow pairs.
