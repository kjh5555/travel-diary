# Feature Plan: Japan Travel Planner

**Status**: 🚧 Draft
**Last Updated**: 2025-12-31

## Overview
Build a web-based Japan Travel Planner that allows users to log in with Google, create itineraries using Google Maps, and get smart recommendations for their trip (e.g., travel times, waiting times, restaurant status).

## Architecture Decisions
- **Frontend**: Next.js (React) for a robust, SEO-friendly web app.
- **Styling**: Vanilla CSS (as per user preference for flexibility/control) + Design System for premium aesthetics.
- **Auth**: NextAuth.js (Google Provider).
- **Maps**: Google Maps JavaScript API + Places API + Routes API.
- **State Management**: React Context or Zustand (simple & effective).
- **Architecture**: Clean Architecture (Domain, Data, Presentation layers) to support TDD.

## Phase Breakdown

### Phase 1: Project Skeleton & Authentication (approx. 4h)
- **Goal**: Functional app shell with Google Login and responsive layout.
- **Test Strategy**: Unit tests for Auth logic, Component tests for Layout.
- **Tasks**:
    - [ ] [RED] Create Auth use-case tests
    - [ ] [GREEN] Set up Next.js + NextAuth with Google
    - [ ] [REFACTOR] Implement Clean Architecture structure
    - [ ] [GREEN] Create premium UI Shell (Header, Sidebar)
- **Quality Gate**:
    - [ ] Login/Logout works
    - [ ] 80% Coverage on Auth logic
    - [ ] Premium aesthetic check

### Phase 2: Google Maps Integration & Search (approx. 4h)
- **Goal**: Display interactive map and search for places (e.g., in Osaka).
- **Test Strategy**: Mock Maps API for unit tests, Integration tests for Search service.
- **Tasks**:
    - [ ] [RED] Write tests for PlaceSearchService
    - [ ] [GREEN] Integrate Google Maps JS API
    - [ ] [GREEN] Implement Place Autocomplete Search
    - [ ] [REFACTOR] Optimize Map component re-renders
- **Quality Gate**:
    - [ ] Map loads correctly
    - [ ] Search returns valid results
    - [ ] Markers appear on map

### Phase 3: Itinerary Builder & Routing (approx. 5h)
- **Goal**: Add places to a daily list, calculate travel times and waiting times.
- **Test Strategy**: Unit tests for TimeCalculationUseCase.
- **Tasks**:
    - [ ] [RED] Test Routing/Duration calculation logic
    - [ ] [GREEN] Implement "Add to Itinerary" flow
    - [ ] [GREEN] Integrate Routes API for travel times
    - [ ] [GREEN] Implement estimated "Waiting Time" logic (based on popularity/time)
- **Quality Gate**:
    - [ ] Can add/remove items from timeline
    - [ ] Travel times are calculated
    - [ ] Total daily duration displayed

### Phase 4: Recommendations & Details (approx. 4h)
- **Goal**: Show restaurant status/hours and suggest alternatives.
- **Test Strategy**: Tests for RecommendationEngine.
- **Tasks**:
    - [ ] [RED] Test logic for "Open Now" and "Similar Places"
    - [ ] [GREEN] Fetch Place Details (Opening Hours)
    - [ ] [GREEN] Implement Recommendation UI
    - [ ] [REFACTOR] Polish animations and transitions
- **Quality Gate**:
    - [ ] Recommendations display correctly
    - [ ] Opening hours are accurate

## Risks & Mitigations
- **Risk**: Google Maps API costs. **Mitigation**: Use quotas and lazy loading.
- **Risk**: API Complexity. **Mitigation**: Wrap external APIs in simpler Domain Interfaces.

## Rollback Strategy
- Git Revert for code.
- Environment variable toggle for features if applicable.

---
**CRITICAL INSTRUCTIONS**: after completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase
