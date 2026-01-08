import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GooglePlaceRepository } from '@/data/repositories/GooglePlaceRepository';

// Mock Google Maps API
const mockPlacesServiceInstance = {
    textSearch: vi.fn(),
    getDetails: vi.fn(),
};

class MockPlacesService {
    constructor() {
        return mockPlacesServiceInstance;
    }
}

global.google = {
    maps: {
        places: {
            PlacesService: MockPlacesService,
            PlacesServiceStatus: {
                OK: 'OK',
                ZERO_RESULTS: 'ZERO_RESULTS',
                NOT_FOUND: 'NOT_FOUND',
                INVALID_REQUEST: 'INVALID_REQUEST',
            },
        } as any,
        Point: vi.fn(),
        Size: vi.fn(),
        Map: class { },
    } as any,
} as any;

describe('GooglePlaceRepository', () => {
    let repository: GooglePlaceRepository;
    let mapDiv: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        mapDiv = document.createElement('div');
        repository = new GooglePlaceRepository(mapDiv);
    });

    describe('searchPlaces', () => {
        it('should search places correctly', async () => {
            const mockResults = [
                {
                    place_id: '123',
                    name: 'Osaka Castle',
                    formatted_address: 'Osaka',
                    geometry: {
                        location: {
                            lat: () => 34.6873,
                            lng: () => 135.5262,
                        }
                    },
                    rating: 4.5,
                    user_ratings_total: 1000,
                    photos: [],
                    types: ['tourist_attraction'],
                }
            ];

            mockPlacesServiceInstance.textSearch.mockImplementation((request: any, callback: any) => {
                callback(mockResults, 'OK');
            });

            const results = await repository.searchPlaces('Osaka Castle');

            expect(mockPlacesServiceInstance.textSearch).toHaveBeenCalledWith(
                { query: 'Osaka Castle' },
                expect.any(Function)
            );
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Osaka Castle');
            expect(results[0].location.lat).toBe(34.6873);
            expect(results[0].rating).toBe(4.5);
        });

        it('should return empty array when zero results', async () => {
            mockPlacesServiceInstance.textSearch.mockImplementation((request: any, callback: any) => {
                callback(null, 'ZERO_RESULTS');
            });

            const results = await repository.searchPlaces('NonexistentPlace');

            expect(results).toEqual([]);
        });

        it('should reject on API error', async () => {
            mockPlacesServiceInstance.textSearch.mockImplementation((request: any, callback: any) => {
                callback(null, 'INVALID_REQUEST');
            });

            await expect(repository.searchPlaces('Invalid')).rejects.toThrow('Place search failed with status: INVALID_REQUEST');
        });
    });

    describe('getPlaceDetails', () => {
        it('should get place details correctly', async () => {
            const mockResult = {
                place_id: '123',
                name: 'Osaka Castle',
                formatted_address: '1-1 Osakajo, Chuo Ward, Osaka',
                geometry: {
                    location: {
                        lat: () => 34.6873,
                        lng: () => 135.5262,
                    }
                },
                rating: 4.5,
                user_ratings_total: 1000,
                photos: [],
                types: ['tourist_attraction'],
            };

            mockPlacesServiceInstance.getDetails.mockImplementation((request: any, callback: any) => {
                callback(mockResult, 'OK');
            });

            const result = await repository.getPlaceDetails('123');

            expect(mockPlacesServiceInstance.getDetails).toHaveBeenCalledWith(
                {
                    placeId: '123',
                    fields: ['name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'photos', 'types', 'place_id', 'price_level', 'opening_hours'],
                },
                expect.any(Function)
            );
            expect(result).not.toBeNull();
            expect(result?.name).toBe('Osaka Castle');
            expect(result?.location.lat).toBe(34.6873);
        });

        it('should return null when place not found', async () => {
            mockPlacesServiceInstance.getDetails.mockImplementation((request: any, callback: any) => {
                callback(null, 'NOT_FOUND');
            });

            const result = await repository.getPlaceDetails('999');

            expect(result).toBeNull();
        });

        it('should reject on API error', async () => {
            mockPlacesServiceInstance.getDetails.mockImplementation((request: any, callback: any) => {
                callback(null, 'INVALID_REQUEST');
            });

            await expect(repository.getPlaceDetails('invalid')).rejects.toThrow('Place details fetch failed with status: INVALID_REQUEST');
        });
    });
});
