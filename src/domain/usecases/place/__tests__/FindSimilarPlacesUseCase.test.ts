import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindSimilarPlacesUseCase } from '../FindSimilarPlacesUseCase';
import { IPlaceRepository } from '@/domain/repositories/IPlaceRepository';
import { Place } from '@/domain/types/place';

describe('FindSimilarPlacesUseCase', () => {
    let useCase: FindSimilarPlacesUseCase;
    let mockRepository: IPlaceRepository;

    const targetPlace: Place = {
        id: 'place-1',
        name: 'Italian Restaurant',
        address: 'Osaka',
        location: { lat: 34.6873, lng: 135.5262 },
        types: ['restaurant', 'italian_restaurant'],
        rating: 4.5,
    };

    const similarPlaces: Place[] = [
        {
            id: 'place-2',
            name: 'Pizza Place',
            address: 'Osaka',
            location: { lat: 34.6880, lng: 135.5270 },
            types: ['restaurant', 'italian_restaurant'],
            rating: 4.3,
        },
        {
            id: 'place-3',
            name: 'Pasta House',
            address: 'Osaka',
            location: { lat: 34.6890, lng: 135.5280 },
            types: ['restaurant', 'italian_restaurant'],
            rating: 4.6,
        },
    ];

    beforeEach(() => {
        mockRepository = {
            searchPlaces: vi.fn(),
            getPlaceDetails: vi.fn(),
        };
        useCase = new FindSimilarPlacesUseCase(mockRepository);
    });

    it('should find similar places based on types', async () => {
        vi.mocked(mockRepository.searchPlaces).mockResolvedValue(similarPlaces);

        const result = await useCase.execute(targetPlace);

        expect(mockRepository.searchPlaces).toHaveBeenCalled();
        expect(result).toHaveLength(2);
        expect(result[0].types).toContain('italian_restaurant');
    });

    it('should exclude the original place from results', async () => {
        const allPlaces = [targetPlace, ...similarPlaces];
        vi.mocked(mockRepository.searchPlaces).mockResolvedValue(allPlaces);

        const result = await useCase.execute(targetPlace);

        expect(result).not.toContainEqual(targetPlace);
        expect(result.every(p => p.id !== targetPlace.id)).toBe(true);
    });

    it('should return empty array when no similar places found', async () => {
        vi.mocked(mockRepository.searchPlaces).mockResolvedValue([]);

        const result = await useCase.execute(targetPlace);

        expect(result).toEqual([]);
    });

    it('should limit results to specified count', async () => {
        const manyPlaces = Array.from({ length: 10 }, (_, i) => ({
            ...similarPlaces[0],
            id: `place-${i}`,
            name: `Restaurant ${i}`,
        }));
        vi.mocked(mockRepository.searchPlaces).mockResolvedValue(manyPlaces);

        const result = await useCase.execute(targetPlace, 3);

        expect(result).toHaveLength(3);
    });

    it('should handle place without types', async () => {
        const placeWithoutTypes: Place = {
            ...targetPlace,
            types: undefined,
        };

        vi.mocked(mockRepository.searchPlaces).mockResolvedValue([]);

        const result = await useCase.execute(placeWithoutTypes);

        expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
        const error = new Error('Search failed');
        vi.mocked(mockRepository.searchPlaces).mockRejectedValue(error);

        await expect(useCase.execute(targetPlace)).rejects.toThrow('Search failed');
    });
});
