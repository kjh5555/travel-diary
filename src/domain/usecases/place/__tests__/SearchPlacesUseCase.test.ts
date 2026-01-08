import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchPlacesUseCase } from '../SearchPlacesUseCase';
import { IPlaceRepository } from '@/domain/repositories/IPlaceRepository';
import { Place } from '@/domain/types/place';

describe('SearchPlacesUseCase', () => {
    let useCase: SearchPlacesUseCase;
    let mockRepository: IPlaceRepository;

    const mockPlaces: Place[] = [
        {
            id: '1',
            name: 'Osaka Castle',
            address: '1-1 Osakajo, Chuo Ward, Osaka',
            location: { lat: 34.6873, lng: 135.5262 },
            rating: 4.5,
            user_ratings_total: 1000,
            photos: [],
            types: ['tourist_attraction'],
        },
        {
            id: '2',
            name: 'Dotonbori',
            address: 'Dotonbori, Chuo Ward, Osaka',
            location: { lat: 34.6686, lng: 135.5004 },
            rating: 4.3,
            user_ratings_total: 800,
            photos: [],
            types: ['tourist_attraction'],
        },
    ];

    beforeEach(() => {
        mockRepository = {
            searchPlaces: vi.fn(),
            getPlaceDetails: vi.fn(),
        };
        useCase = new SearchPlacesUseCase(mockRepository);
    });

    it('should search places successfully', async () => {
        vi.mocked(mockRepository.searchPlaces).mockResolvedValue(mockPlaces);

        const result = await useCase.execute('Osaka');

        expect(mockRepository.searchPlaces).toHaveBeenCalledWith('Osaka');
        expect(result).toEqual(mockPlaces);
        expect(result).toHaveLength(2);
    });

    it('should trim query before searching', async () => {
        vi.mocked(mockRepository.searchPlaces).mockResolvedValue(mockPlaces);

        await useCase.execute('  Osaka  ');

        expect(mockRepository.searchPlaces).toHaveBeenCalledWith('Osaka');
    });

    it('should return empty array when no places found', async () => {
        vi.mocked(mockRepository.searchPlaces).mockResolvedValue([]);

        const result = await useCase.execute('NonexistentPlace');

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
    });

    it('should throw error when query is empty', async () => {
        await expect(useCase.execute('')).rejects.toThrow('Search query cannot be empty');
        expect(mockRepository.searchPlaces).not.toHaveBeenCalled();
    });

    it('should throw error when query is only whitespace', async () => {
        await expect(useCase.execute('   ')).rejects.toThrow('Search query cannot be empty');
        expect(mockRepository.searchPlaces).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
        const error = new Error('API Error');
        vi.mocked(mockRepository.searchPlaces).mockRejectedValue(error);

        await expect(useCase.execute('Osaka')).rejects.toThrow('API Error');
    });
});
