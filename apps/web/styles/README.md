# ORBIT Frontend Style Architecture

This directory is the single styling source of truth for the web application.

## Structure

```text
styles/
├── tokens.css                  # colors, spacing, radii, shadows, theme variables
├── base.css                    # reset, typography, global motion, scroll behavior
├── primitives.css              # reusable surfaces, buttons, forms, tables, page shells
├── shell.css                   # desktop sidebar, mobile header/drawer, toolbar, palette
├── components/
│   ├── assistant-spotlight.css
│   ├── copilot.css
│   └── dashboard-builder.css
└── pages/
    ├── landing.css
    ├── auth.css
    ├── dashboard.css
    ├── assistant.css
    ├── imports.css
    ├── collections.css
    ├── search.css
    ├── automations.css
    ├── graph.css
    ├── developer.css
    ├── settings.css
    ├── activity.css
    └── error.css
```

## Ownership rules

1. **Tokens only in `tokens.css`.** Pages and components must use variables instead of introducing new theme colors.
2. **Global behavior only in `base.css`.** Reset, typography, shared animation keyframes and accessibility live there.
3. **Reusable UI only in `primitives.css`.** Buttons, inputs, cards, surfaces, tables and shared grid helpers belong there.
4. **Application chrome only in `shell.css`.** Navigation, toolbar, drawers and command palette must not leak into page files.
5. **One component = one stylesheet** under `components/` when the component has a substantial visual system.
6. **One product area = one page stylesheet** under `pages/`. Responsive rules stay beside the styles they own.
7. **No `<style>` / `<style jsx>` blocks in product components or dashboard pages.** Dynamic data-driven dimensions may use React inline styles only when the value is runtime data (for example chart/bar width).
8. **Desktop and mobile are designed together.** Every owner stylesheet contains its own responsive rules; do not create a second disconnected mobile stylesheet.
9. **No green in the ORBIT product palette.** The visual identity stays plum / mauve / lavender with neutral surfaces.
10. **Prefer refinement over new CSS.** Extend an existing token or primitive before creating another one-off visual rule.

## Breakpoints

- Desktop: `> 980px`
- Tablet: `761px – 980px`
- Mobile: `<= 760px`
- Small mobile refinements: `<= 640px` / `<= 430px`

## Motion

Motion is intentionally restrained. `base.css` owns shared entrance/popup/spin animations and every animation respects `prefers-reduced-motion`.

## Import order

`app/layout.tsx` imports styles in this order:

1. tokens
2. base
3. primitives
4. shell
5. component styles
6. page styles

Later files may specialize earlier primitives, but should not redefine foundation tokens.
