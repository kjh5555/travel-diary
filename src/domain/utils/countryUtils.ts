import { SavedItinerary } from "../types/itinerary";
import { Place } from "../types/place";

export function extractCountryFromAddress(address: string | undefined): string | null {
    if (!address || address.trim().length === 0) {
        return null;
    }

    const addressParts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
    
    if (addressParts.length === 0) {
        return null;
    }

    const lastPart = addressParts[addressParts.length - 1];
    
    const isPostalCodeOnly = /^[\d\-]+$/.test(lastPart);
    if (isPostalCodeOnly && addressParts.length > 1) {
        return addressParts[addressParts.length - 2];
    }

    return lastPart;
}

export function getJourneyCountry(itinerary: SavedItinerary): string | null {
    if (itinerary.arrivalAirport?.address) {
        const country = extractCountryFromAddress(itinerary.arrivalAirport.address);
        if (country) return country;
    }

    if (itinerary.departureAirport?.address) {
        const country = extractCountryFromAddress(itinerary.departureAirport.address);
        if (country) return country;
    }

    const firstPlace = itinerary.items.find(item => !item.isDayTransition);
    if (firstPlace?.place.address) {
        return extractCountryFromAddress(firstPlace.place.address);
    }

    return null;
}

export function getPlaceCountry(place: Place): string | null {
    return extractCountryFromAddress(place.address);
}

export function countriesMatch(country1: string | null, country2: string | null): boolean {
    if (!country1 || !country2) {
        return false;
    }
    
    return country1.toLowerCase().trim() === country2.toLowerCase().trim();
}
