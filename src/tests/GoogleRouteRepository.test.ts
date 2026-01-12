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
            NOT_FOUND: 'NOT_FOUND',
        },
        TravelMode: {
            TRANSIT: 'TRANSIT',
            DRIVING: 'DRIVING',
        },
        TransitMode: {
            TRAIN: 'TRAIN',
            SUBWAY: 'SUBWAY',
            BUS: 'BUS',
            RAIL: 'RAIL',
        },
        TransitRoutePreference: {
            FEWER_TRANSFERS: 'FEWER_TRANSFERS',
        },
    } as any,
} as any;

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GoogleRouteRepository', () => {
    let repository: GoogleRouteRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repository = new GoogleRouteRepository();
    });

    it('should calculate route correctly via HTTP API', async () => {
        const origin: Place = { id: '1', name: 'Origin', location: { lat: 10, lng: 10 }, address: 'A' };
        const destination: Place = { id: '2', name: 'Dest', location: { lat: 20, lng: 20 }, address: 'B' };

        mockFetch.mockResolvedValue({
            json: () => Promise.resolve({
                status: 'OK',
                routes: [{
                    legs: [{
                        distance: { value: 1000, text: '1 km' },
                        duration: { value: 600, text: '10 mins' },
                        steps: [],
                    }],
                    overview_polyline: { points: 'encoded_polyline' },
                }],
            }),
        });

        const route = await repository.getRoute(origin, destination);

        expect(mockFetch).toHaveBeenCalled();
        expect(route).toBeDefined();
        expect(route?.distanceMeters).toBe(1000);
        expect(route?.durationSeconds).toBe(600);
    });

    it('should fallback to JS SDK when HTTP API fails', async () => {
        const origin: Place = { id: '1', name: 'Origin', location: { lat: 10, lng: 10 }, address: 'A' };
        const destination: Place = { id: '2', name: 'Dest', location: { lat: 20, lng: 20 }, address: 'B' };

        mockFetch.mockResolvedValue({
            json: () => Promise.resolve({ status: 'ZERO_RESULTS' }),
        });

        const mockResult = {
            routes: [{
                legs: [{
                    distance: { value: 1000, text: '1 km' },
                    duration: { value: 600, text: '10 mins' },
                    steps: [],
                }],
                overview_polyline: 'encoded_polyline',
            }],
        };

        mockDirectionsServiceInstance.route.mockImplementation((request: any, callback: any) => {
            callback(mockResult, 'OK');
        });

        const route = await repository.getRoute(origin, destination, 'DRIVING');

        expect(route).toBeDefined();
        expect(route?.distanceMeters).toBe(1000);
        expect(route?.durationSeconds).toBe(600);
    });
});
