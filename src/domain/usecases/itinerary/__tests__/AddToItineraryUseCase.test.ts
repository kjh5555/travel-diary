import { describe, it, expect, beforeEach } from 'vitest';
import { AddToItineraryUseCase } from '../AddToItineraryUseCase';
import { Place } from '@/domain/types/place';
import { ItineraryItem } from '@/domain/types/itinerary';

describe('AddToItineraryUseCase', () => {
    let useCase: AddToItineraryUseCase;
    let mockItems: ItineraryItem[];

    const mockPlace: Place = {
        id: 'place-1',
        name: 'Osaka Castle',
        address: '1-1 Osakajo, Chuo Ward, Osaka',
        location: { lat: 34.6873, lng: 135.5262 },
        rating: 4.5,
    };

    beforeEach(() => {
        mockItems = [];
        useCase = new AddToItineraryUseCase();
    });

    it('should add a place to empty itinerary', () => {
        const result = useCase.execute(mockPlace, mockItems);

        expect(result).toHaveLength(1);
        expect(result[0].place).toEqual(mockPlace);
        expect(result[0].order).toBe(0);
        expect(result[0].id).toBeDefined();
    });

    it('should add a place with correct order', () => {
        const firstItem: ItineraryItem = {
            id: 'item-1',
            place: mockPlace,
            order: 0,
        };
        mockItems = [firstItem];

        const newPlace: Place = {
            id: 'place-2',
            name: 'Dotonbori',
            address: 'Dotonbori, Chuo Ward, Osaka',
            location: { lat: 34.6686, lng: 135.5004 },
            rating: 4.3,
        };

        const result = useCase.execute(newPlace, mockItems);

        expect(result).toHaveLength(2);
        expect(result[1].order).toBe(1);
        expect(result[1].place.name).toBe('Dotonbori');
    });

    it('should set default duration to 60 minutes', () => {
        const result = useCase.execute(mockPlace, mockItems);

        expect(result[0].durationMinutes).toBe(60);
    });

    it('should generate unique ID for each item', () => {
        const result1 = useCase.execute(mockPlace, mockItems);
        const result2 = useCase.execute(mockPlace, result1);

        expect(result1[0].id).not.toBe(result2[1].id);
    });

    it('should not mutate original items array', () => {
        const originalLength = mockItems.length;

        useCase.execute(mockPlace, mockItems);

        expect(mockItems).toHaveLength(originalLength);
    });
});
