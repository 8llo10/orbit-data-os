# ORBIT Frontend Style Architecture

`apps/web/styles` is the single styling source of truth for ORBIT Web.

## Structure

```text
styles/
├── tokens.css                    # palette, spacing, radii, shadows, themes
├── base.css                      # reset, typography, global motion, accessibility
├── primitives.css                # shared surfaces, buttons, forms and layout helpers
├── shell.css                     # desktop/mobile application chrome
├── components/
│   ├── assistant-spotlight.css
│   ├── copilot.css
│   ├── dashboard-builder.css
│   ├── data-table.css
│   ├── collection-view.css
│   └── insight-bars.css
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

1. **`tokens.css` owns design tokens only.** Product code consumes variables instead of inventing one-off theme colors.
2. **`base.css` owns global behavior only.** Reset, typography, shared motion keyframes, scrollbar and reduced-motion accessibility live there.
3. **`primitives.css` owns reusable UI contracts.** Page shells, surfaces, buttons, form controls, generic grids and shared setting rows belong there.
4. **`shell.css` owns application chrome only.** Desktop sidebar, mobile header/drawer, toolbar, notifications and command palette do not belong in page files.
5. **Substantial reusable components own a stylesheet** under `components/`. DataTable, CollectionView, InsightBars, Copilot, DashboardBuilder and AssistantSpotlight do not leak styling into a page stylesheet.
6. **Each product area owns a page stylesheet** under `pages/`. A page file contains only styles unique to that product area.
7. **No `<style>` or `<style jsx>` blocks in product components/dashboard pages.** Runtime data-driven dimensions such as chart height or progress width are the only acceptable inline styles.
8. **Responsive rules live with their owner.** Desktop, tablet and mobile behavior for a component/page are defined in the same stylesheet; there is no disconnected mobile CSS dump.
9. **No green in the ORBIT identity.** The product palette stays plum / mauve / lavender with neutral surfaces.
10. **Extend before inventing.** Use an existing token/primitive before introducing another visual contract.

## Breakpoints

- Desktop: `> 980px`
- Tablet: `761px – 980px`
- Mobile: `<= 760px`
- Small mobile refinements: `<= 640px` and `<= 430px`

## Motion

Motion is restrained and functional. Shared entrance, pop, spin and fade keyframes live in `base.css`. Every animation respects `prefers-reduced-motion`.

## Import order

`app/layout.tsx` imports styles in this order:

1. tokens
2. base
3. primitives
4. shell
5. component-owned styles
6. page-owned styles

Later layers may specialize an earlier contract, but page files should never redefine foundation tokens.

## Maintenance rule

Styling work is considered infrastructure, not feature logic. Future backend/AI work should not add CSS to route handlers or service modules. Any future visual change must be made in the owning stylesheet above so ORBIT keeps one coherent visual system on laptop and mobile.
