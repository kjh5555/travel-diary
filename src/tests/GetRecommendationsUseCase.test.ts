import { describe, it, expect, vi } from 'vitest';
import { GetRecommendationsUseCase } from '@/domain/usecases/place/GetRecommendationsUseCase';
import { Place } from '@/domain/types/place';

describe('GetRecommendationsUseCase', () => {
    it('should return recommendations from repository', async () => {
        const mockRepo = {
            getRecommendations: vi.fn(),
        } as any;

        const useCase = new GetRecommendationsUseCase(mockRepo);
        const place: Place = { id: '1', name: 'Original', location: { lat: 0, lng: 0 }, address: 'A', types: ['restaurant'] };
        const recommendations: Place[] = [{ id: '2', name: 'Rec', location: { lat: 0, lng: 0 }, address: 'B' }];

        mockRepo.getRecommendations.mockResolvedValue(recommendations);

        const result = await useCase.execute(place);

        expect(mockRepo.getRecommendations).toHaveBeenCalledWith(place);
        expect(result).toEqual(recommendations);
    });
});
