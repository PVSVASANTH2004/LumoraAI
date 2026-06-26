---
name: Lumora
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for a premium enterprise-grade AI experience. The brand personality is rooted in intelligence and speed, manifesting through a highly refined, dark-mode-first aesthetic. It targets power users who value clarity and precision.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**. It utilizes deep blacks to create a sense of infinite space, punctuated by vibrant accents that signify AI activity and intelligence. The emotional response should be one of calm focus, high-performance reliability, and sophisticated technological edge.

## Colors
The palette is built on a "Total Dark" foundation to reduce eye strain and emphasize content. 
- **Primary Background**: The base layer for the application.
- **Secondary Background**: Used for sidebars and navigation panels to create structural hierarchy.
- **Card Background**: A lifted surface for content modules, featuring a semi-transparent border to define edges against the dark background.
- **Accents**: Violet and Blue are used sparingly for interactive elements, AI-generated states, and progress indicators.
- **Text**: High-contrast white for readability, with a zinc-toned muted state for metadata and secondary information.

## Typography
This design system utilizes **Geist** for its technical precision and modern, developer-centric feel. 

Headlines use tight letter-spacing and bold weights to command attention and feel "engineered." Body text prioritizes legibility with generous line heights. Labels are utilized for UI controls and metadata, often paired with slightly increased letter spacing for clarity at small sizes. All typography scales down by approximately 15% on mobile devices to maintain vertical rhythm.

## Layout & Spacing
The layout follows a fluid 12-column grid on desktop with a maximum container width of 1440px. 

- **Desktop**: 40px outer margins with 24px gutters.
- **Tablet**: 24px outer margins with 16px gutters.
- **Mobile**: 16px outer margins with 16px gutters.

Spacing relies on a strict 8px base unit. Vertical rhythm is maintained through "stack" variables, ensuring consistent breathing room between components. AI chat interfaces should use a centered, max-width column (800px) to maintain focus and readability during long-form interactions.

## Elevation & Depth
Depth is conveyed through **Glassmorphism** and **Tonal Layers** rather than heavy shadows.

- **Level 0 (Base)**: Primary Background (#09090B).
- **Level 1 (Navigation/Sidebar)**: Secondary Background (#18181B) with a subtle 1px right-border.
- **Level 2 (Cards/Modals)**: Card Background (#202024) with a `backdrop-filter: blur(12px)` and a 1px white border at 10% opacity.
- **Shadows**: Only used on floating elements (modals, dropdowns) using a very soft, large-radius shadow: `0 20px 40px rgba(0,0,0,0.4)`.
- **AI Focus**: Active AI states may utilize a subtle primary-accent outer glow (`box-shadow: 0 0 15px rgba(124, 58, 237, 0.2)`).

## Shapes
The shape language is sophisticated and approachable. 
- **Standard UI Elements**: Buttons, inputs, and small widgets use a 0.5rem (8px) radius.
- **Content Containers**: Large cards and document modules use a larger 1.5rem (24px) radius to create a soft, premium feel.
- **Interactive States**: Focus rings should follow the radius of the parent element with a 2px offset.

## Components
- **Buttons**: Primary buttons use a linear gradient (Violet to Blue) with a subtle scale-up transform (1.02x) on hover. Secondary buttons are "Ghost" style with a subtle white border.
- **Glassmorphic Sidebar**: Sidebar uses `rgba(24, 24, 27, 0.7)` with a heavy background blur (20px). Navigation items use high-contrast text for the active state and muted text for inactive.
- **Input Fields**: Darker than the card background, featuring a transition to a 1px Violet border and a 4px soft Violet outer glow on focus.
- **Source Citation Tags**: Small, pill-shaped tags with a 10% Blue tint background and 1px Blue border. They should feel like "chips" that are easily scannable within AI responses.
- **Document Cards**: Large 24px rounded containers. On hover, the border opacity increases from 10% to 25%, and a subtle inner glow appears.
- **Skeleton Loaders**: Utilize a shimmering gradient moving from `#18181B` to `#27272A`.
- **Rich Empty States**: Use low-opacity monochromatic illustrations or large, blurred atmospheric gradients in the background to avoid "dead" space.