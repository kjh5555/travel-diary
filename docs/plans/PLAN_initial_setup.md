# Feature Plan: Japan Travel Planner

**Status**: ✅ Phase 4 Complete
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

### Phase 1: Project Skeleton & Authentication ✅ COMPLETED
- **Goal**: Functional app shell with Google Login and responsive layout.
- **Test Strategy**: Unit tests for Auth logic, Component tests for Layout.
- **Tasks**:
    - [x] [RED] Create Auth use-case tests
    - [x] [GREEN] Set up Next.js + NextAuth with Google
    - [x] [REFACTOR] Implement Clean Architecture structure
    - [x] [GREEN] Create premium UI Shell (Header, Sidebar)
- **Quality Gate**:
    - [x] Login/Logout works
    - [x] 100% Coverage on Auth logic (exceeded 80% goal!)
    - [x] Premium aesthetic check
- **Implementation Notes**:
    - Created Clean Architecture structure with Domain/Data/Presentation layers
    - Domain Layer: User entity, IAuthRepository interface, SignIn/SignOut/GetSession use cases
    - Data Layer: NextAuthRepository implementing IAuthRepository
    - Presentation Layer: Header & Sidebar components with premium styling
    - Test Coverage: 26 tests passing, 100% coverage (7 test files)
    - Tests include: Use case tests, Component tests, Integration tests

### Phase 2: Google Maps Integration & Search ✅ COMPLETED
- **Goal**: Display interactive map and search for places (e.g., in Osaka).
- **Test Strategy**: Mock Maps API for unit tests, Integration tests for Search service.
- **Tasks**:
    - [x] [RED] Write tests for PlaceSearchService
    - [x] [GREEN] Integrate Google Maps JS API
    - [x] [GREEN] Implement Place Autocomplete Search
    - [x] [REFACTOR] Optimize Map component re-renders
- **Quality Gate**:
    - [x] Map loads correctly
    - [x] Search returns valid results
    - [x] Markers appear on map
- **Implementation Notes**:
    - Created Clean Architecture structure for Phase 2
    - Domain Layer: Place entity, IPlaceRepository interface, SearchPlacesUseCase, GetPlaceDetailsUseCase
    - Data Layer: GooglePlaceRepository implementing IPlaceRepository with proper error handling
    - Presentation Layer: MapContainer and PlaceSearch components with loading/error states
    - Test Coverage: 48 tests passing (12 test files total)
    - Tests include: UseCase tests (12), Repository tests (6), Component tests (4)
    - Improved error handling with proper reject() usage for API failures
    - Added marker cleanup to prevent memory leaks (useRef pattern)
    - Maps Integration: useGoogleMaps hook for script loading, MapContainer with loading/error states
    - Search: PlaceSearch component using SearchPlacesUseCase (Clean Architecture pattern)

### Phase 3: Itinerary Builder & Routing ✅ COMPLETED
- **Goal**: Add places to a daily list, calculate travel times and waiting times.
- **Test Strategy**: Unit tests for TimeCalculationUseCase.
- **Tasks**:
    - [x] [RED] Test Routing/Duration calculation logic
    - [x] [GREEN] Implement "Add to Itinerary" flow
    - [x] [GREEN] Integrate Routes API for travel times
    - [x] [GREEN] Implement estimated "Waiting Time" logic (based on popularity/time)
- **Quality Gate**:
    - [x] Can add/remove items from timeline
    - [x] Travel times are calculated
    - [x] Total daily duration displayed
- **Implementation Notes**:
    - Created Clean Architecture structure for Itinerary management
    - Domain Layer: ItineraryItem entity, Route interface, UseCases (AddToItinerary, RemoveFromItinerary, CalculateRoute)
    - Presentation Layer: ItineraryTimeline component, Zustand store refactored to use UseCases
    - Test Coverage: 64 tests passing (16 test files total)
    - Tests include: Itinerary UseCase tests (15), comprehensive TDD approach
    - Store refactored to use Clean Architecture pattern with UseCase delegation
    - All Itinerary UseCases have 100% test coverage
    - UI: ItineraryTimeline with timeline visualization, add/remove functionality
    - Integration: Map page can add places to itinerary, ready for route calculation integration

### Phase 4: Recommendations & Details ✅ COMPLETED
- **Goal**: Show restaurant status/hours and suggest alternatives.
- **Test Strategy**: Tests for RecommendationEngine.
- **Tasks**:
    - [x] [RED] Test logic for "Open Now" and "Similar Places"
    - [x] [GREEN] Fetch Place Details (Opening Hours)
    - [x] [GREEN] Implement Recommendation UI
    - [x] [REFACTOR] Polish animations and transitions
- **Quality Gate**:
    - [x] Recommendations display correctly
    - [x] Opening hours are accurate
- **Implementation Notes**:
    - Created Clean Architecture structure for Recommendations and Place Details
    - Domain Layer: Extended Place type with opening_hours field, CheckOpenNowUseCase, FindSimilarPlacesUseCase
    - Data Layer: Enhanced GooglePlaceRepository with opening_hours support and proper error handling
    - Presentation Layer: PlaceDetailsCard component, SimilarPlacesRecommendation component
    - Test Coverage: 75 tests passing (19 test files total)
    - Tests include: CheckOpenNowUseCase tests (4), FindSimilarPlacesUseCase tests (6)
    - All Phase 4 UseCases have 100% test coverage
    - Enhanced GooglePlaceRepository with consistent error handling (reject on API errors, resolve on NOT_FOUND/ZERO_RESULTS)
    - Opening hours integration: open_now status, weekday_text for detailed hours
    - Similar places recommendation: Based on place types, filters out original place, configurable limit
    - UI: PlaceDetailsCard shows ratings, hours, and place details with premium styling

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
