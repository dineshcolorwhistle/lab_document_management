# Lab Document Management – Design System (2025–2026)

Modern SaaS-style UI with your existing brand palette, soft depth, and clear hierarchy.

---

## Color Palette (HEX)

### Brand (primary)

| Token            | HEX       | Usage                                      |
|------------------|-----------|--------------------------------------------|
| **Primary**      | `#352D36` | Buttons, active states, body text, icons   |
| **Primary hover**| `#3f3441` | Hover state for primary actions            |
| **Surface**      | `#F7F6F2` | Page/section background                    |
| **Surface elevated** | `#FFFFFF` | Cards, header, sidebar, modals        |
| **Muted**        | `#9C9F9F` | Borders, secondary text, placeholders      |
| **Muted light**  | `#909493` | Placeholders, disabled text                |
| **Muted soft**   | `#B5B8B8` | Subtle dividers, hover backgrounds         |
| **Border**       | `#E8E9E9` | Card/input borders (light, minimal)        |

### Semantic accents (accessible, works with brand)

| Token   | HEX       | Usage                    |
|---------|-----------|--------------------------|
| **Blue**| `#4F6BED` | Links, info, secondary CTAs |
| **Green** | `#0D9488` | Success, approved, positive |
| **Amber** | `#D97706` | Warning, pending          |
| **Red** | `#DC2626` | Error, destructive, sign out |

Use these in `tailwind.config.js` under `theme.extend.colors.brand` and `theme.extend.colors.accent`.

---

## Shadows & Depth

- **Soft**: `0 2px 8px rgba(53, 45, 54, 0.06)` – buttons, nav items
- **Soft lg**: `0 4px 20px rgba(53, 45, 54, 0.08)` – cards, dropdowns
- **Soft xl**: `0 8px 32px rgba(53, 45, 54, 0.1)` – sidebar, modals

No heavy borders; depth comes from soft shadows and subtle border opacity.

---

## Layout & Structure

### Sidebar

- **Width**: 256px expanded (`w-sidebar`), 72px collapsed (`w-sidebar-collapsed`)
- **Background**: `brand-surface-elevated` (#FFFFFF), `shadow-soft-xl`
- **Border**: Optional `border-brand-border/60` (no heavy border)
- **Behavior**: Collapsible on desktop (icon-only when collapsed); overlay + slide-in on mobile
- **Nav items**: Rounded (`rounded-xl`), active = `bg-brand-primary/8` + `text-brand-primary`; hover = `bg-brand-muted/10`
- **Logo**: Square icon on brand primary; text “Lab Docs” / “Compliance” hidden when collapsed

### Top bar (header)

- **Height**: 56px (`h-14`)
- **Sticky**: `sticky top-0 z-30`
- **Background**: `bg-brand-surface-elevated/95` + `backdrop-blur-sm` + `shadow-soft`
- **Border**: `border-b border-brand-border/60`
- **Content**: Left = mobile menu (lg:hidden) + page title + optional breadcrumbs; right = user avatar + dropdown
- **User menu**: Rounded `rounded-2xl`, `shadow-soft-xl`; avatar on brand primary; sign out in accent red

### Main content

- **Background**: `bg-brand-surface` (#F7F6F2)
- **Container**: `max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8`
- **Spacing**: Consistent `space-y-6` between sections; cards use `gap-4` / `gap-6` in grids

---

## Components

### Cards (`.ldm-card`)

- `rounded-2xl`, `border border-brand-border`, `bg-brand-surface-elevated`, `shadow-soft-lg`, `p-6`
- Hover (optional): `hover:shadow-soft-xl`
- Use for: stat cards, content blocks, recent items, quick actions

### Buttons

- **Primary**: `ldm-btn ldm-btn-primary` – brand primary bg, surface text
- **Secondary**: `ldm-btn ldm-btn-secondary` – border, elevated surface bg
- **Ghost**: `ldm-btn ldm-btn-ghost` – transparent, hover bg
- All: `rounded-xl`, soft shadow, no heavy borders

### Inputs (`.ldm-input`)

- `rounded-xl`, light border, focus ring `focus:ring-2 focus:ring-brand-muted/20`

### Alerts

- Use existing `.ldm-alert-*` (info, success, warning, danger) with `rounded-xl` and semantic colors.

---

## Responsive

- **Desktop-first**: Sidebar visible by default; collapsible for more content space
- **Tablet**: Same as desktop; sidebar can stay collapsed for focus
- **Mobile**: Sidebar hidden; hamburger in header opens overlay sidebar; content full-width with `px-4` / `sm:px-6`

---

## Accessibility

- **Contrast**: Primary text (#352D36) on surface (#F7F6F2) and elevated (#FFFFFF) meets WCAG AA
- **Focus**: Visible focus rings (`focus:ring-2`, brand-muted)
- **Motion**: Prefer `transition-all duration-200/300`; respect `prefers-reduced-motion` if you add animations
- **Labels**: `aria-label` on icon-only buttons (sidebar toggle, collapse, close)

---

## File reference

- **Tokens**: `tailwind.config.js` (`theme.extend.colors`, `boxShadow`, `borderRadius`, `spacing`)
- **Global + components**: `src/index.css` (base, `.ldm-*` classes)
- **Sidebar**: `src/components/layout/Sidebar.jsx`
- **Header**: `src/components/layout/Header.jsx`
- **Layout**: `src/components/layout/DashboardLayout.jsx`
- **Cards / buttons**: `src/components/ui/Card.jsx`, `Button.jsx`; use `ldm-card` and `ldm-btn-*` from `index.css`
