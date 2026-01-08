# Plan: New Journey Feature

## Overview
This feature allows users to start a new trip planning session from the main dashboard. It introduces a "New Journey" modal that combines a map view with a form to select an arrival airport and add initial preferences (food, places to visit). The design will strictly follow the "Travel Diary" aesthetic.

## Architecture Decisions
-   **Modal State**: Use a local state in `page.tsx` or a dedicated context if it grows complex. For now, local state is sufficient.
-   **Map Integration**: Reuse `MapContainer` component.
-   **Search**: Reuse `SearchPlacesUseCase` for airport and place searches.
-   **Form Handling**: Controlled inputs for airport, food list, and visit list.
-   **Styling**: Tailwind CSS with custom classes from `ui_style_guide.md` (e.g., `font-caveat`, `rotate-*`).

## Phase Breakdown

### Phase 1: UI Skeleton & Modal Logic
**Goal**: Create a visible modal that opens when "New Journey" is clicked.
**Test Strategy**: Manual verification of modal open/close and layout responsiveness.
- [ ] Create `components/NewJourney/NewJourneyModal.tsx`
    -   Split layout: 50% Map (left), 50% Form (right).
    -   Close button with "handwritten" style.
- [ ] Update `app/page.tsx`
    -   Add state `isNewJourneyOpen`.
    -   Connect "New Journey" card `onClick` to set state.
- [ ] Apply "Travel Diary" styling
    -   Paper texture background for the form side.
    -   Masking tape accents.

### Phase 2: Map & Airport Search
**Goal**: Users can search for an airport and see it on the map.
**Test Strategy**: Mock `SearchPlacesUseCase` and verify search results populate.
- [ ] Integrate `MapContainer` into the left side of the modal.
- [ ] Add "Arrival Airport" search input on the right side.
    -   Use `SearchPlacesUseCase`.
    -   Filter results if possible (or just generic search).
- [ ] When an airport is selected:
    -   Pan map to location.
    -   Add a marker (flight icon?).

### Phase 3: Journey Preferences
**Goal**: Users can add multiple "Foods to eat" and "Places to visit".
**Test Strategy**: Verify items can be added and removed from the list.
- [ ] Add "Must Eat" section.
    -   Input + "Add" button.
    -   List of added items (bullet points or mini-cards).
- [ ] Add "Must Visit" section.
    -   Input + Search (optional) + "Add" button.
- [ ] Update Map
    -   If "Must Visit" items have locations, add markers.
    -   Fit bounds to include Airport + Visit locations.

### Phase 4: Polish & Refinement
**Goal**: Match the high-quality aesthetic of the style guide.
**Test Strategy**: Visual inspection against `ui_style_guide.md`.
- [ ] Add "tape" effects to the modal corners.
- [ ] Use handwriting font for headers ("Start your Adventure").
- [ ] Ensure the map has a "polaroid" border.
- [ ] Verify responsiveness on smaller screens (stack map and form).

## Quality Gates
- [ ] **Build**: Project compiles without errors.
- [ ] **Lint**: No new lint warnings.
- [ ] **Aesthetics**: Design matches `ui_style_guide.md`.
- [ ] **Functionality**: "New Journey" flow works from start to finish.

## Progress Tracking
**CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase
