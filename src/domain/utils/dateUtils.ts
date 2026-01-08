import { SavedItinerary } from "../types/itinerary";

export type ItineraryStatus = 'upcoming' | 'ongoing' | 'past';

export const getItineraryStatus = (startDate: string, endDate: string): ItineraryStatus => {
    // Reset time components to compare dates only
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the end date

    if (start > today) {
        return 'upcoming';
    } else if (end < today) {
        return 'past';
    } else {
        return 'ongoing';
    }
};

export const groupItinerariesByStatus = (itineraries: SavedItinerary[]) => {
    const upcoming: SavedItinerary[] = [];
    const ongoing: SavedItinerary[] = [];
    const past: SavedItinerary[] = [];

    itineraries.forEach(itinerary => {
        const status = getItineraryStatus(itinerary.startDate, itinerary.endDate);
        if (status === 'upcoming') upcoming.push(itinerary);
        else if (status === 'ongoing') ongoing.push(itinerary);
        else past.push(itinerary);
    });

    upcoming.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    ongoing.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    past.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    return { upcoming, ongoing, past };
};

export interface JourneyDay {
    dayNumber: number;
    date: string;
    label: string;
    isToday: boolean;
}

export function getJourneyDays(startDate: string, endDate: string): JourneyDay[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return Array.from({ length: totalDays }, (_, i) => {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);
        
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        
        return {
            dayNumber: i,
            date: currentDate.toISOString().split('T')[0],
            label: `${i + 1}일차 (${month}/${day})`,
            isToday: currentDate.getTime() === today.getTime()
        };
    });
}

export function getCurrentDayOfJourney(startDate: string): number {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
}
