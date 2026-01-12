import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalculateRouteUseCase } from '../CalculateRouteUseCase';
import { Place } from '@/domain/types/place';
import { Route, IRouteRepository } from '@/domain/types/itinerary';

describe('CalculateRouteUseCase', () => {
    let useCase: CalculateRouteUseCase;
    let mockRepository: IRouteRepository;

    const origin: Place = {
        id: 'place-1',
        name: 'Osaka Castle',
        address: '1-1 Osakajo, Chuo Ward, Osaka',
        location: { lat: 34.6873, lng: 135.5262 },
    };

    const destination: Place = {
        id: 'place-2',
        name: 'Dotonbori',
        address: 'Dotonbori, Chuo Ward, Osaka',
        location: { lat: 34.6686, lng: 135.5004 },
    };

    beforeEach(() => {
        mockRepository = {
            getRoute: vi.fn(),
        };
        useCase = new CalculateRouteUseCase(mockRepository);
    });

    it('should calculate route successfully', async () => {
        const mockRoute: Route = {
            durationSeconds: 900, // 15 minutes
            distanceMeters: 3500,
            mode: 'WALKING',
            steps: [],
        };

        vi.mocked(mockRepository.getRoute).mockResolvedValue(mockRoute);

        const result = await useCase.execute(origin, destination, 'WALKING');

        expect(mockRepository.getRoute).toHaveBeenCalledWith(origin, destination, 'WALKING');
        expect(result).toEqual(mockRoute);
        expect(result?.durationSeconds).toBe(900);
    });

    it('should return null when route not found', async () => {
        vi.mocked(mockRepository.getRoute).mockResolvedValue(null);

        const result = await useCase.execute(origin, destination, 'WALKING');

        expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
        const error = new Error('API Error');
        vi.mocked(mockRepository.getRoute).mockRejectedValue(error);

        await expect(useCase.execute(origin, destination, 'WALKING'))
            .rejects.toThrow('API Error');
    });

    it('should handle different travel modes', async () => {
        const drivingRoute: Route = {
            durationSeconds: 600,
            distanceMeters: 5000,
            mode: 'DRIVING',
            steps: [],
        };

        vi.mocked(mockRepository.getRoute).mockResolvedValue(drivingRoute);

        const result = await useCase.execute(origin, destination, 'DRIVING');

        expect(mockRepository.getRoute).toHaveBeenCalledWith(origin, destination, 'DRIVING');
        expect(result?.mode).toBe('DRIVING');
    });

    it('should use default mode when not specified', async () => {
        const walkingRoute: Route = {
            durationSeconds: 900,
            distanceMeters: 3500,
            mode: 'WALKING',
            steps: [],
        };

        vi.mocked(mockRepository.getRoute).mockResolvedValue(walkingRoute);

        const result = await useCase.execute(origin, destination);

        expect(mockRepository.getRoute).toHaveBeenCalledWith(origin, destination, 'WALKING');
    });
});
