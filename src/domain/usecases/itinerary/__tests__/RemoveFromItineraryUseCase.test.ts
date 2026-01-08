import { describe, it, expect, beforeEach } from 'vitest';
import { RemoveFromItineraryUseCase } from '../RemoveFromItineraryUseCase';
import { ItineraryItem } from '@/domain/types/itinerary';
import { Place } from '@/domain/types/place';

describe('RemoveFromItineraryUseCase', () => {
    let useCase: RemoveFromItineraryUseCase;
    let mockItems: ItineraryItem[];

    const mockPlace1: Place = {
        id: 'place-1',
        name: 'Osaka Castle',
        address: '1-1 Osakajo, Chuo Ward, Osaka',
        location: { lat: 34.6873, lng: 135.5262 },
    };

    const mockPlace2: Place = {
        id: 'place-2',
        name: 'Dotonbori',
        address: 'Dotonbori, Chuo Ward, Osaka',
        location: { lat: 34.6686, lng: 135.5004 },
    };

    beforeEach(() => {
        useCase = new RemoveFromItineraryUseCase();
        mockItems = [
            { id: 'item-1', place: mockPlace1, order: 0, durationMinutes: 60 },
            { id: 'item-2', place: mockPlace2, order: 1, durationMinutes: 60 },
        ];
    });

    it('should remove item by id', () => {
        const result = useCase.execute('item-1', mockItems);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('item-2');
    });

    it('should reorder remaining items after removal', () => {
        const result = useCase.execute('item-1', mockItems);

        expect(result[0].order).toBe(0);
    });

    it('should return empty array when removing last item', () => {
        const singleItem = [mockItems[0]];
        const result = useCase.execute('item-1', singleItem);

        expect(result).toHaveLength(0);
    });

    it('should return same items if id not found', () => {
        const result = useCase.execute('non-existent-id', mockItems);

        expect(result).toHaveLength(2);
    });

    it('should not mutate original items array', () => {
        const originalLength = mockItems.length;

        useCase.execute('item-1', mockItems);

        expect(mockItems).toHaveLength(originalLength);
    });
});
