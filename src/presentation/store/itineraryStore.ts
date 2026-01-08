import { create } from 'zustand';
import { Place } from '@/domain/types/place';
import { ItineraryItem } from '@/domain/types/itinerary';
import { AddToItineraryUseCase } from '@/domain/usecases/itinerary/AddToItineraryUseCase';
import { RemoveFromItineraryUseCase } from '@/domain/usecases/itinerary/RemoveFromItineraryUseCase';

interface ItineraryState {
    items: ItineraryItem[];
    addItem: (place: Place) => void;
    removeItem: (id: string) => void;
    reorderItems: (startIndex: number, endIndex: number) => void;
}

// Initialize use cases
const addToItineraryUseCase = new AddToItineraryUseCase();
const removeFromItineraryUseCase = new RemoveFromItineraryUseCase();

export const useItineraryStore = create<ItineraryState>((set) => ({
    items: [],
    addItem: (place) => set((state) => ({
        items: addToItineraryUseCase.execute(place, state.items),
    })),
    removeItem: (id) => set((state) => ({
        items: removeFromItineraryUseCase.execute(id, state.items),
    })),
    reorderItems: (startIndex, endIndex) => set((state) => {
        const newItems = [...state.items];
        const [removed] = newItems.splice(startIndex, 1);
        newItems.splice(endIndex, 0, removed);
        // Update order property
        return {
            items: newItems.map((item, index) => ({ ...item, order: index }))
        };
    }),
}));
