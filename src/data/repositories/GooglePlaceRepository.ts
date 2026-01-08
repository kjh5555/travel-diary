import { IPlaceRepository } from "@/domain/repositories/IPlaceRepository";
import { Place, SearchPlacesOptions } from "@/domain/types/place";
import { IRecommendationRepository } from "@/domain/types/recommendation";

export class GooglePlaceRepository implements IPlaceRepository, IRecommendationRepository {
    private service: google.maps.places.PlacesService;

    constructor(mapDiv: HTMLDivElement | google.maps.Map) {
        // google 객체 타입 체크를 제거하고 직접 PlacesService 생성
        this.service = new google.maps.places.PlacesService(mapDiv);
    }

    async searchPlaces(options: SearchPlacesOptions): Promise<Place[]> {
        return new Promise((resolve, reject) => {
            const request: google.maps.places.TextSearchRequest = {
                query: options.query,
                ...(options.location && {
                    location: options.location,
                    radius: 2000 // 2km radius bias
                }),
                ...(options.airportsOnly && {
                    type: 'airport'
                })
            };

            this.service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    let filteredResults = results;

                    // airportsOnly가 true일 경우 공항만 필터링
                    if (options.airportsOnly) {
                        filteredResults = results.filter(result =>
                            result.types?.includes('airport')
                        );
                    }

                    const places: Place[] = filteredResults.map((result) => ({
                        id: result.place_id || '',
                        name: result.name || '',
                        address: result.formatted_address || '',
                        location: {
                            lat: result.geometry?.location?.lat() || 0,
                            lng: result.geometry?.location?.lng() || 0,
                        },
                        rating: result.rating,
                        user_ratings_total: result.user_ratings_total,
                        photos: result.photos?.map((photo) => photo.getUrl() || '') || [],
                        types: result.types,
                        price_level: result.price_level,
                        opening_hours: result.opening_hours ? {
                            open_now: result.opening_hours.isOpen ? !!result.opening_hours.isOpen() : false,
                            weekday_text: result.opening_hours.weekday_text,
                        } : undefined,
                    }));
                    resolve(places);
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve([]);
                } else {
                    reject(new Error('Place search failed with status: ' + status));
                }
            });
        });
    }

    async getPlaceDetails(placeId: string): Promise<Place | null> {
        return new Promise((resolve, reject) => {
            const request: google.maps.places.PlaceDetailsRequest = {
                placeId: placeId,
                fields: ['name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'photos', 'types', 'place_id', 'price_level', 'opening_hours'],
            };

            this.service.getDetails(request, (result, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                    const place: Place = {
                        id: result.place_id || '',
                        name: result.name || '',
                        address: result.formatted_address || '',
                        location: {
                            lat: result.geometry?.location?.lat() || 0,
                            lng: result.geometry?.location?.lng() || 0,
                        },
                        rating: result.rating,
                        user_ratings_total: result.user_ratings_total,
                        photos: result.photos?.map((photo) => photo.getUrl() || '') || [],
                        types: result.types,
                        price_level: result.price_level,
                        opening_hours: result.opening_hours ? {
                            open_now: result.opening_hours.isOpen ? !!result.opening_hours.isOpen() : false,
                            weekday_text: result.opening_hours.weekday_text,
                        } : undefined,
                    };
                    resolve(place);
                } else if (status === google.maps.places.PlacesServiceStatus.NOT_FOUND) {
                    resolve(null);
                } else {
                    reject(new Error('Place details fetch failed with status: ' + status));
                }
            });
        });
    }

    async getRecommendations(place: Place): Promise<Place[]> {
        if (!place.location || !place.types || place.types.length === 0) return [];

        const type = place.types[0];

        return new Promise((resolve) => {
            const request: google.maps.places.TextSearchRequest = {
                query: type,
                location: { lat: place.location.lat, lng: place.location.lng },
                radius: 1000,
            };

            this.service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    const places = results
                        .filter(p => p.place_id !== place.id)
                        .map((result) => ({
                            id: result.place_id || '',
                            name: result.name || '',
                            address: result.formatted_address || '',
                            location: {
                                lat: result.geometry?.location?.lat() || 0,
                                lng: result.geometry?.location?.lng() || 0,
                            },
                            rating: result.rating,
                            user_ratings_total: result.user_ratings_total,
                            photos: result.photos?.map((photo) => photo.getUrl() || '') || [],
                            types: result.types,
                            price_level: result.price_level,
                            opening_hours: result.opening_hours ? {
                                open_now: result.opening_hours.isOpen ? !!result.opening_hours.isOpen() : false,
                                weekday_text: result.opening_hours.weekday_text,
                            } : undefined,
                        }));
                    resolve(places);
                } else {
                    resolve([]);
                }
            });
        });
    }
}
