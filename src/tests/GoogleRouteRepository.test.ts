import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleRouteRepository } from '@/data/repositories/GoogleRouteRepository';
import { Place } from '@/domain/types/place';

// Mock Google Maps API
const mockDirectionsServiceInstance = {
    route: vi.fn(),
};

class MockDirectionsService {
    constructor() {
        return mockDirectionsServiceInstance;
    }
}

global.google = {
    maps: {
        DirectionsService: MockDirectionsService,
        DirectionsStatus: {
            OK: 'OK',
        },
        TravelMode: {
            TRANSIT: 'TRANSIT',
        },
    } as any,
} as any;

describe('GoogleRouteRepository', () => {
    let repository: GoogleRouteRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repository = new GoogleRouteRepository();
    });

    it('should calculate route correctly', async () => {
        const origin: Place = { id: '1', name: 'Origin', location: { lat: 10, lng: 10 }, address: 'A' };
        const destination: Place = { id: '2', name: 'Dest', location: { lat: 20, lng: 20 }, address: 'B' };

        const mockResult = {
            routes: [{
                legs: [{
                    distance: { value: 1000 },
                    duration: { value: 600 },
                }],
                overview_polyline: 'encoded_polyline',
            }],
        };

        mockDirectionsServiceInstance.route.mockImplementation((request: any, callback: any) => {
            callback(mockResult, 'OK');
        });

        const route = await repository.getRoute(origin, destination);

        expect(mockDirectionsServiceInstance.route).toHaveBeenCalledWith(
            expect.objectContaining({
                origin: { lat: 10, lng: 10 },
                destination: { lat: 20, lng: 20 },
            }),
            expect.any(Function)
        );

        expect(route).toBeDefined();
        expect(route?.distanceMeters).toBe(1000);
        expect(route?.durationSeconds).toBe(600);
    });
});
