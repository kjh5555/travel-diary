# Walkthrough - New Journey Refinements

I have refined the **New Journey** feature to be more robust and user-friendly, specifically for handling restaurant searches and larger itineraries.

## Changes

### 1. Strict Place Validation
-   **Removed Free Text**: Users can no longer press "Enter" to add arbitrary text (which caused issues with map markers).
-   **Forced Selection**: Users must select a valid place from the dropdown or recommendation cards.

### 2. Smart Restaurant Recommendations (맛집 추천)
-   **Context-Aware Search**: When searching, the system biases results towards your **last added location** (or the airport if empty).
-   **Top 3 Candidates**: If you search for generic terms (e.g., "Sushi", "Cafe") and get multiple results, the UI switches to a "Top Picks" view.
-   **Selection**: Clicking a recommendation card adds it to your wishlist and map immediately.

### 3. Scalable UI (Timeline View)
-   **Vertical Timeline**: Replaced the simple list with a vertical timeline layout using a dashed line and dots.
-   **Scrollable Area**: The list now has a max-height and custom scrolling, allowing for many items without breaking the modal layout.
-   **Visuals**: Added rating stars and address details to the recommendation cards.

## Verification

### Manual Verification Steps
1.  **Validation**: Try typing "Random Text" and pressing Enter. -> *Nothing happens (Correct).*
2.  **Airport**: Search "Narita Airport" -> Select -> Map Pans.
3.  **Smart Search**:
    -   Type "Sushi".
    -   **Expected**: UI shows "✨ Top Picks Near You" with 3 sushi places near Narita.
    -   Select one. -> Added to timeline + Map Marker.
4.  **Timeline**:
    -   Add 5 more places.
    -   **Expected**: The list scrolls smoothly. The newest items are at the bottom (or top depending on logic, currently appended). Map fits all bounds.

## Next Steps
-   Save the finalized itinerary to the database.
