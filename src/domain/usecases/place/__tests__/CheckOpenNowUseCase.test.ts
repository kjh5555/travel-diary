import { describe, it, expect, beforeEach } from 'vitest';
import { CheckOpenNowUseCase } from '../CheckOpenNowUseCase';
import { Place } from '@/domain/types/place';

describe('CheckOpenNowUseCase', () => {
    let useCase: CheckOpenNowUseCase;

    const openPlace: Place = {
        id: 'place-1',
        name: 'Open Restaurant',
        address: 'Osaka',
        location: { lat: 34.6873, lng: 135.5262 },
        opening_hours: {
            open_now: true,
            weekday_text: ['Monday: 9:00 AM – 10:00 PM'],
        },
    };

    const closedPlace: Place = {
        id: 'place-2',
        name: 'Closed Restaurant',
        address: 'Osaka',
        location: { lat: 34.6873, lng: 135.5262 },
        opening_hours: {
            open_now: false,
        },
    };

    const placeWithoutHours: Place = {
        id: 'place-3',
        name: 'Unknown Hours Place',
        address: 'Osaka',
        location: { lat: 34.6873, lng: 135.5262 },
    };

    beforeEach(() => {
        useCase = new CheckOpenNowUseCase();
    });

    it('should return true when place is open', () => {
        const result = useCase.execute(openPlace);

        expect(result).toBe(true);
    });

    it('should return false when place is closed', () => {
        const result = useCase.execute(closedPlace);

        expect(result).toBe(false);
    });

    it('should return undefined when opening hours not available', () => {
        const result = useCase.execute(placeWithoutHours);

        expect(result).toBeUndefined();
    });

    it('should handle place with opening_hours but no open_now', () => {
        const placeWithPartialData: Place = {
            ...placeWithoutHours,
            opening_hours: {
                weekday_text: ['Monday: 9:00 AM – 10:00 PM'],
            },
        };

        const result = useCase.execute(placeWithPartialData);

        expect(result).toBeUndefined();
    });
});
