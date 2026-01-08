import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPlaceDetailsUseCase } from '../GetPlaceDetailsUseCase';
import { IPlaceRepository } from '@/domain/repositories/IPlaceRepository';
import { Place } from '@/domain/types/place';

describe('GetPlaceDetailsUseCase', () => {
    let useCase: GetPlaceDetailsUseCase;
    let mockRepository: IPlaceRepository;

    const mockPlace: Place = {
        id: '123',
        name: 'Osaka Castle',
        address: '1-1 Osakajo, Chuo Ward, Osaka',
        location: { lat: 34.6873, lng: 135.5262 },
        rating: 4.5,
        user_ratings_total: 1000,
        photos: ['https://example.com/photo1.jpg'],
        types: ['tourist_attraction', 'point_of_interest'],
    };

    beforeEach(() => {
        mockRepository = {
            searchPlaces: vi.fn(),
            getPlaceDetails: vi.fn(),
        };
        useCase = new GetPlaceDetailsUseCase(mockRepository);
    });

    it('should get place details successfully', async () => {
        vi.mocked(mockRepository.getPlaceDetails).mockResolvedValue(mockPlace);

        const result = await useCase.execute('123');

        expect(mockRepository.getPlaceDetails).toHaveBeenCalledWith('123');
        expect(result).toEqual(mockPlace);
        expect(result?.name).toBe('Osaka Castle');
    });

    it('should trim placeId before fetching', async () => {
        vi.mocked(mockRepository.getPlaceDetails).mockResolvedValue(mockPlace);

        await useCase.execute('  123  ');

        expect(mockRepository.getPlaceDetails).toHaveBeenCalledWith('123');
    });

    it('should return null when place not found', async () => {
        vi.mocked(mockRepository.getPlaceDetails).mockResolvedValue(null);

        const result = await useCase.execute('999');

        expect(result).toBeNull();
    });

    it('should throw error when placeId is empty', async () => {
        await expect(useCase.execute('')).rejects.toThrow('Place ID cannot be empty');
        expect(mockRepository.getPlaceDetails).not.toHaveBeenCalled();
    });

    it('should throw error when placeId is only whitespace', async () => {
        await expect(useCase.execute('   ')).rejects.toThrow('Place ID cannot be empty');
        expect(mockRepository.getPlaceDetails).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
        const error = new Error('API Error');
        vi.mocked(mockRepository.getPlaceDetails).mockRejectedValue(error);

        await expect(useCase.execute('123')).rejects.toThrow('API Error');
    });
});
