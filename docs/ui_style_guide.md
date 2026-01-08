# UI Style Guide: Modern Travel Planner

This document outlines the visual design system currently implemented in the application. The design follows a **Modern, Clean, and Minimalist** aesthetic, prioritizing clarity, usability, and a focus on map/itinerary content.

## 1. Design Philosophy

-   **Clean & Airy**: Uses plenty of whitespace and light cool-toned backgrounds (`#f8fbfc`) to create a fresh feeling.
-   **Content-First**: High contrast text and bright accent colors guide the user without overwhelming the content.
-   **Modern Interaction**: Smooth transitions, backdrop blurs, and rounded corners (`rounded-2xl`) for a friendly yet professional feel.
-   **Depth**: Usage of heavy shadows (`shadow-2xl`) for modals and delicate shadows (`shadow-sm`) for cards to establish hierarchy.

## 2. Color Palette

The color system relies on CSS variables defined in line with Tailwind CSS v4.

### Light Mode (Default)

| Color Variable | Hex Value | Usage |
| :--- | :--- | :--- |
| **`--primary`** | `#13b6ec` | **Brand Color**. Main actions, active states, highlights. (Cyan Blue) |
| **`--primary-dark`** | `#0e8db8` | Hover states for primary buttons. |
| **`--background`** | `#f8fbfc` | Main app background. Very light cool grey/blue. |
| **`--surface`** | `#ffffff` | Card and Modal backgrounds. Pure white. |
| **`--foreground`** | `#0d181b` | Primary text color. Almost black. |
| **`--muted-foreground`** | `#4c869a` | Secondary text, placeholders, subtitles. Muted blue-grey. |
| **`--border`** | `#cfe1e7` | Borders for inputs, dividers, and panels. |
| **`--secondary`** | `#e7f0f3` | Secondary backgrounds, hover states for list items. |

### Dark Mode

| Color Variable | Hex Value | Usage |
| :--- | :--- | :--- |
| **`--background`** | `#101d22` | Deep dark blue-grey. |
| **`--surface`** | `#1c2e35` | Card backgrounds in dark mode. |
| **`--foreground`** | `#e7f0f3` | Primary text in dark mode. |

## 3. Typography

The application uses a dual-font system to support both English/Global and Korean text seamlessly.

### Primary Font: **Plus Jakarta Sans**
-   **Variable**: `--font-display`
-   **Usage**: Headings, UI controls, English text.
-   **Characteristics**: Geometric, modern, high legibility.

### Korean Font: **Noto Sans KR**
-   **Variable**: `--font-korean`
-   **Usage**: Korean text fallback.
-   **Characteristics**: Clean, standard sans-serif for Korean.

### Font Weights
-   **Regular (400)**: distinct body text.
-   **Medium (500)**: Buttons, navigation.
-   **Bold (700)** / **ExtraBold (800)**: Headings, emphasis.

## 4. Components & Patterns

### Modals & Floating Panels
Floating elements use high elevation and heavy rounding to distinct themselves from the map or background.

-   **Classes**: `bg-[var(--surface)]`, `rounded-2xl`, `shadow-2xl`, `border border-[var(--border)]`.
-   **Overlay**: `bg-black/50 backdrop-blur-sm`.

### Buttons

#### Primary Button
-   **Style**: Solid background color with white text.
-   **Classes**: `bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-md rounded-lg font-bold`.

#### Secondary / Ghost Button
-   **Style**: Transparent or slight background with colored text.
-   **Classes**: `text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]`.

### Cards (Itinerary Items)
Content items are contained in clean boxes with subtle borders.

-   **Container**: `bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm`.
-   **Interaction**: `hover:shadow-md transition-shadow`.

### Form Elements
Inputs are designed to be spacious and clearly defined.

-   **Input**: `h-11 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-4`.
-   **Focus State**: `focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20`.

## 5. Iconography

The project uses **Material Symbols Outlined** via Google Fonts.

-   **Implementation**: `<span className="material-symbols-outlined">icon_name</span>`
-   **Style**: Outlined, 24px default size.
-   **Settings**: `FILL 0`, `wght 400`. filled variants use custom class `.filled`.

## 6. Layout

-   **Sidebar Layout**: Fixed sidebar on the left, scrollable main content area.
-   **Responsiveness**: Adaptive padding (`p-3 md:p-10`), flexible flex containers.
