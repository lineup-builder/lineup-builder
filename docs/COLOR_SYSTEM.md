# Color System Documentation

## Overview

The Lineup Builder uses a robust, single-source-of-truth color system based on US Naval Academy (USNA) colors. All colors are defined as CSS variables in `src/index.css` and exposed through Tailwind CSS for consistent theming across light and dark modes.

## Design Principles

1. **Single Source of Truth**: All colors are defined once in CSS variables
2. **Semantic Naming**: Use semantic tokens (e.g., `primary`, `accent`) instead of raw colors
3. **Theme-Aware**: Full support for light and dark modes
4. **Accessible**: Proper contrast ratios maintained across themes
5. **Maintainable**: Easy to update colors globally from one location

## USNA Brand Colors

### Primary Colors

- **Navy Blue**: `#13294B` / `hsl(213 59% 19%)`
  - Official USNA Navy Blue
  - Mapped to `--color-navy-600`

- **Gold**: `#F8B739` / `hsl(41 93% 60%)`
  - Official USNA Gold
  - Mapped to `--color-gold-400`

### Color Scales

The system provides full color scales for each brand color:

**Navy Scale**: `navy-50` through `navy-950`
- Lighter values (50-300): Backgrounds, subtle UI elements
- Mid values (400-600): Primary actions, emphasis
- Darker values (700-950): Dark mode backgrounds, deep contrast

**Gold Scale**: `gold-50` through `gold-900`
- Used for accent colors, highlights, and calls-to-action
- Maintains USNA gold at the 400 level

**Neutral Scale**: `neutral-50` through `neutral-900`
- Cool-toned neutrals for borders, muted text, and UI chrome

## Semantic Color Tokens

### Using Semantic Tokens

Always prefer semantic tokens over direct color references:

```tsx
// ✅ Good - Uses semantic tokens
<div className="bg-primary text-primary-foreground">
<Button variant="default">Click Me</Button>

// ❌ Bad - Hardcoded colors
<div className="bg-navy-600 text-white">
```

### Available Semantic Tokens

#### Core Tokens

- **`background`**: Main page background
- **`foreground`**: Primary text color
- **`primary`**: Primary brand color (navy)
  - `primary-foreground`: Text on primary backgrounds
- **`secondary`**: Secondary UI elements
  - `secondary-foreground`: Text on secondary backgrounds
- **`accent`**: Accent color (gold)
  - `accent-foreground`: Text on accent backgrounds
- **`muted`**: Muted/subtle backgrounds
  - `muted-foreground`: Muted text
- **`destructive`**: Error/danger states
  - `destructive-foreground`: Text on destructive backgrounds

#### UI Element Tokens

- **`border`**: Default border color
- **`input`**: Input field borders
- **`ring`**: Focus ring color
- **`card`**: Card backgrounds
  - `card-foreground`: Text on cards
- **`popover`**: Popover/dropdown backgrounds
  - `popover-foreground`: Text in popovers

#### Custom Application Tokens

- **`usage-badge`**: Athlete usage count badge background
  - `usage-badge-foreground`: Text on usage badges

## Theme Modes

### Light Mode (Default)

- Background: White
- Foreground: Dark navy (`navy-900`)
- Primary: USNA Navy Blue (`navy-600`)
- Accent: USNA Gold (`gold-400`)
- Secondary: Light neutral (`neutral-100`)

### Dark Mode

Activated with `class="dark"` on root element.

- Background: Very dark navy (`navy-950`)
- Foreground: Off-white (`neutral-50`)
- Primary: Lighter navy (`navy-400`) for better contrast
- Accent: USNA Gold (`gold-400`) - same as light mode
- Secondary: Dark navy (`navy-800`)

## Usage in Different Contexts

### In Tailwind Classes

```tsx
// Background colors
<div className="bg-primary">
<div className="bg-accent">
<div className="bg-navy-600">

// Text colors
<p className="text-foreground">
<span className="text-muted-foreground">
<h1 className="text-primary">

// Borders
<div className="border border-border">
<input className="border-input">

// Dark mode variants
<div className="bg-white dark:bg-navy-900">
```

### In CSS Variables (Direct Access)

```css
.custom-class {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border: 1px solid var(--color-border);
}
```

### With Opacity

Use Tailwind's opacity modifiers:

```tsx
<div className="bg-primary/10">        {/* 10% opacity */}
<div className="bg-accent/20">         {/* 20% opacity */}
<div className="border-gold-400/30">   {/* 30% opacity */}
```

Or use modern CSS color functions:

```css
.custom {
  background: oklch(from var(--color-primary) l c h / 0.1);
}
```

## Component Usage Patterns

### Buttons

```tsx
// Primary action - navy background
<Button variant="default">Save</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Secondary action
<Button variant="outline">Cancel</Button>
```

### Cards

```tsx
<Card className="bg-card text-card-foreground">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
</Card>
```

### Inputs

```tsx
<Input
  className="border-input bg-background text-foreground"
  placeholder="Enter text..."
/>
```

### Badges & Chips

```tsx
// Event chips (gold accent)
<span className="bg-accent/20 text-accent-foreground border border-accent/30">
  FX
</span>

// Usage badges (navy)
<span className="bg-usage-badge text-usage-badge-foreground">
  3
</span>
```

## File Structure

### Primary Color Definitions

**`src/index.css`**
- Defines all CSS color variables in `@theme` block
- Includes light mode defaults
- Dark mode overrides in `.dark` selector
- Contains USNA brand scales (navy, gold, neutral)
- Defines semantic tokens

### Tailwind Configuration

**`tailwind.config.ts`**
- Extends theme with color variables
- Maps CSS variables to Tailwind utilities
- Makes colors available as `bg-*`, `text-*`, `border-*`, etc.
- Defines `borderRadius` tokens

### Component Usage

**`src/components/**/*.tsx`**
- Components use semantic tokens exclusively
- No hardcoded hex/rgb values in components
- Rely on Tailwind utilities or CSS variables

## Adding New Colors

### 1. Add to CSS Variables (src/index.css)

```css
@theme {
  /* Add new color scale */
  --color-custom-400: hsl(200 80% 50%);

  /* Or add semantic token */
  --color-special: var(--color-navy-500);
  --color-special-foreground: hsl(0 0% 100%);
}

/* Add dark mode override if needed */
.dark {
  --color-special: var(--color-navy-300);
}
```

### 2. Expose in Tailwind (tailwind.config.ts)

```typescript
export default {
  theme: {
    extend: {
      colors: {
        custom: {
          400: "var(--color-custom-400)",
        },
        special: {
          DEFAULT: "var(--color-special)",
          foreground: "var(--color-special-foreground)",
        },
      },
    },
  },
} satisfies Config;
```

### 3. Use in Components

```tsx
<div className="bg-special text-special-foreground">
  <span className="text-custom-400">Content</span>
</div>
```

## Migration Guide

If you need to update existing hardcoded colors:

### Before
```tsx
<div className="bg-blue-600 text-white dark:bg-blue-500">
```

### After
```tsx
<div className="bg-primary text-primary-foreground">
```

### Before (CSS)
```css
.custom {
  background: #13294B;
  color: white;
}
```

### After (CSS)
```css
.custom {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}
```

## Best Practices

1. **Always use semantic tokens** for UI elements (buttons, cards, etc.)
2. **Use brand colors** (navy, gold) for brand-specific styling
3. **Maintain contrast** - always pair background with appropriate foreground
4. **Test both themes** - verify colors work in light and dark modes
5. **Avoid hardcoding** - never use hex/rgb values directly in components
6. **Use opacity modifiers** - `/10`, `/20`, etc. for transparent variants
7. **Document custom tokens** - if adding new semantic tokens, document their purpose

## Accessibility

All color combinations meet WCAG 2.1 AA standards:

- **Primary on background**: High contrast (navy on white)
- **Accent on background**: Sufficient contrast (gold on white/dark navy)
- **Muted text**: Minimum 4.5:1 ratio
- **Focus indicators**: Clear ring with primary color

## Troubleshooting

### Colors not updating
1. Check CSS variable is defined in `@theme` block
2. Verify Tailwind config includes the color
3. Ensure dark mode override exists if needed
4. Rebuild with `pnpm dev` or `pnpm build`

### Dark mode not working
1. Verify `class="dark"` on root element
2. Check `darkMode: "class"` in `tailwind.config.ts`
3. Ensure dark mode overrides are in `.dark` selector

### Inconsistent colors
1. Always use semantic tokens, not direct color values
2. Check if component is using hardcoded colors
3. Verify CSS variable fallbacks are working

## References

- USNA Official Colors: https://www.usna.edu/BrandToolkit/colors.php
- Tailwind CSS v4 Theme: https://tailwindcss.com/docs/v4-beta
- shadcn/ui Theming: https://ui.shadcn.com/docs/theming
