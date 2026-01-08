# Walkthrough - Detailed Routing & UI Polish

I have upgraded the "New Journey" feature to support **Detailed Transit Routing** and improved the UI interaction.

## Changes

### 1. Detailed Routing Engine
-   **Domain Updates**: Added `RouteStep` and `TransitDetails` to capture lines, stops, departure times, and instructions.
-   **Google Repository**: Enhanced `getRoute` to extract detailed transit steps from the Google Directions API (e.g., "Take Haruka Express from Platform 4 at 10:30").

### 2. Itinerary Timeline View
-   **New UI Mode**: When you click "Start Planning", the modal switches to an **Itinerary View**.
-   **Visuals**:
    -   **Places**: Shown as nodes on a timeline.
    -   **Connections**: "Ticket-style" cards showing:
        -   Total Duration
        -   Transit Lines (with colors)
        -   Departure/Arrival Times & Stations
        -   Walking Instructions

### 3. UI Polish
-   **Click Outside**: Dropdowns for Airport and Wishlist search now close automatically when you click outside them.
-   **Flow**: "Back to Edit" button allowing you to refine your list after seeing the route.

## Verification

### Manual Verification Steps
1.  **Dropdown Fix**: Open Airport search -> Click styled background -> Dropdown closes.
2.  **Plan Trip**:
    -   Airport: "Kansai International Airport"
    -   Add Place: "Kyoto Station"
    -   Add Place: "Kiyomizu-dera"
3.  **Start Planning**:
    -   Click "Start Planning".
    -   **Expected**: Button shows "Calculating...".
    -   **Transition**: View changes to "Your Itinerary".
    -   **Check Data**:
        -   Leg 1 (KIX -> Kyoto): Should show "Haruka Express" or similar train, duration ~80 mins.
        -   Leg 2 (Kyoto -> Kiyomizu): Should show Bus or Walking directions.

## Next Steps
-   Persist this itinerary to the backend database.
