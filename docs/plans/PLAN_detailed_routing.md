# Plan: Detailed Routing & UI Polish

## Goals
1.  **Detailed Transit Routing**: Extract and display platform, line, and timing info from Google Directions API.
2.  **Itinerary Visualization**: Create a "Travel Timeline" view that connects places with their route cards.
3.  **UI Bug Fix**: Ensure search dropdowns close when clicking outside.

## Phase Breakdown

### Phase 1: Domain & Repository Updates
**Goal**: Capture rich routing data.
- [ ] Update `src/domain/types/itinerary.ts`:
    -   Add `RouteStep` interface.
    -   Add `TransitDetails` interface.
    -   Update `Route` to include `steps: RouteStep[]`.
- [ ] Update `src/data/repositories/GoogleRouteRepository.ts`:
    -   Request `transit_details`.
    -   Map the complex Google API response to our clean Domain types.

### Phase 2: Itinerary UI (New View)
**Goal**: Visualize the journey.
- [ ] Update `NewJourneyModal.tsx`:
    -   Add state `viewMode`: `'planning' | 'itinerary'`.
    -   Add `isLoadingRoutes` state.
    -   On "Start Planning":
        -   Loop through wishlist items sequentially.
        -   Calculate routes for each leg (Airport -> P1, P1 -> P2...).
        -   Store results in `itineraryItems` state.
        -   Switch to `'itinerary'` mode.
- [ ] Create `ItinerarySteps.tsx` (or inline):
    -   Render "Station" Nodes.
    -   Render "Connector" Lines (Transit info).
    -   Show: Line Name, Color, Departure Time, Platform (if available).

### Phase 3: Polish & Bug Fixes
**Goal**: Robustness.
- [ ] **Dropdown Fix**: Add `useEffect` listener for clicks on `document` to close search dropdowns when not focused.
- [ ] **Styles**: Ensure the new "Timeline" looks like a travel plan entry (tickets, times).

## Quality Gates
- [ ] **API**: Transit details (e.g., "Yamanote Line", "Platform 2") are visible.
- [ ] **UX**: Dropdowns close reliably.
- [ ] **Flow**: Smooth transition from adding places to seeing the route.
