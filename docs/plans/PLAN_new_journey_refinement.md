# Plan: New Journey Feature Refinement

## Goals
1.  **Strict Place Validation**: Prevent users from adding non-existent places (text-only entries).
2.  **Smart Restaurant Recommendations**: When searching for food, present top 3 candidates near the current location (Airport or last added spot).
3.  **Scalable UI**: Redesign the wishlist/itinerary view to handle a large number of items gracefully.

## Phase Breakdown

### Phase 1: Validation & strict Mode
**Goal**: Ensure every item in the wishlist is a valid `Place` object with coordinates.
- [ ] Remove text-only submission (Enter key behavior).
- [ ] Force users to select from the autocomplete dropdown.
- [ ] Display an error or hint if the user tries to add invalid text.

### Phase 2: Restaurant Recommendation Logic
**Goal**: Suggestions for "Good Food" (맛집).
- [ ] **Context-Aware Search**: If the query implies food (or explicit "Find Food" button), search near the `selectedAirport` or the last added `wishlist` item.
- [ ] **Recommendation UI**:
    -   Instead of a simple dropdown, show a "Top 3 Picks" card.
    -   User selects 1 of the 3 to add to the wishlist.
    -   Show rating, photo (if available), and distance.

### Phase 3: UI Redesign for Scalability
**Goal**: accomodate "Many Places" without clutter.
- [ ] **Scrollable "Paper" List**: Convert the wishlist into a structured list that resembles a travel itinerary (e.g. numbered list or timeline).
- [ ] **Compact View**: Reduce the height of each item but keep essential info (Name, Rating).
- [ ] **Grouping**: Group items by type (Visit vs Eat) or keep chronological order.
- [ ] **Vertical Layout**: Ensure the form side of the modal captures the "Long List" feel (like a receipt or notepad).

## Quality Gates
- [ ] **Validation**: Impossible to add "random text" as a place.
- [ ] **UX**: Flow for "Find Sushi" -> "Show 3 Sushi places" -> "Pick 1" feels natural.
- [ ] **Design**: UI still looks good with 10+ items.
