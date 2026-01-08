import { IRouteRepository, Route } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";

export class GoogleRouteRepository implements IRouteRepository {
    private service: google.maps.DirectionsService;

    constructor() {
        this.service = new google.maps.DirectionsService();
    }

    async getRoute(origin: Place, destination: Place, mode: string = 'transit'): Promise<Route | null> {
        // Try HTTP API first for better transit data
        const httpResult = await this.tryHttpApi(origin, destination, mode);
        if (httpResult) {
            return httpResult;
        }

        // If TRANSIT mode failed, try DRIVING as fallback
        if (mode.toUpperCase() === 'TRANSIT') {
            console.log('⚠️ TRANSIT not available, trying DRIVING fallback...');
            const drivingResult = await this.tryHttpApi(origin, destination, 'DRIVING');
            if (drivingResult) {
                return drivingResult;
            }

            // Try JS SDK with DRIVING
            const sdkDrivingResult = await this.tryRoute(origin, destination, 'DRIVING');
            if (sdkDrivingResult) {
                return sdkDrivingResult;
            }
        }

        // Fallback to JS SDK
        return this.tryRoute(origin, destination, mode);
    }

    private async tryHttpApi(origin: Place, destination: Place, mode: string): Promise<Route | null> {
        try {
            const originStr = origin.address || `${origin.location.lat},${origin.location.lng}`;
            const destinationStr = destination.address || `${destination.location.lat},${destination.location.lng}`;

            // Use Next.js API route to avoid CORS
            const url = `/api/directions?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destinationStr)}&mode=${mode.toLowerCase()}`;

            console.log('🌐 HTTP API Request (via Next.js API):', {
                origin: origin.address || origin.name,
                destination: destination.address || destination.name,
                mode
            });

            const response = await fetch(url);
            const data = await response.json();

            console.log('📦 HTTP API Response:', JSON.stringify(data, null, 2));

            if (data.status === 'OK' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const leg = route.legs[0];

                console.log('✅ Route found via HTTP API:', {
                    distance: leg.distance?.text,
                    duration: leg.duration?.text,
                    steps: leg.steps?.length
                });

                return {
                    distanceMeters: leg.distance?.value || 0,
                    durationSeconds: leg.duration?.value || 0,
                    mode: mode as any,
                    polyline: route.overview_polyline?.points,
                    steps: leg.steps?.map((step: any) => ({
                        instruction: step.html_instructions?.replace(/<[^>]*>/g, ''),
                        distance: step.distance?.text || '',
                        duration: step.duration?.text || '',
                        mode: step.travel_mode || 'WALKING',
                        transit: step.transit_details ? {
                            line: {
                                name: step.transit_details.line?.name,
                                short_name: step.transit_details.line?.short_name,
                                color: step.transit_details.line?.color,
                                vehicle: step.transit_details.line?.vehicle ? {
                                    icon: step.transit_details.line.vehicle.icon,
                                    type: step.transit_details.line.vehicle.type
                                } : undefined
                            },
                            departure_stop: step.transit_details.departure_stop?.name,
                            arrival_stop: step.transit_details.arrival_stop?.name,
                            departure_time: step.transit_details.departure_time?.text,
                            arrival_time: step.transit_details.arrival_time?.text,
                            num_stops: step.transit_details.num_stops,
                            headsign: step.transit_details.headsign
                        } : undefined
                    })) || []
                };
            } else {
                console.warn('❌ HTTP API failed:', data.status, data.error_message);
                return null;
            }
        } catch (error) {
            console.error('❌ HTTP API error:', error);
            return null;
        }
    }

    private async tryRoute(origin: Place, destination: Place, mode: string): Promise<Route | null> {
        // 대중교통 경로 찾기 전략 (안정성 순서)
        // 1. 주소 사용 (가장 안정적이고 정확)
        // 2. 장소 이름 사용
        // 3. 좌표 사용 (최후의 수단)

        const strategies = [];

        // Strategy 1: 주소 사용 (가장 안정적)
        if (origin.address && destination.address) {
            strategies.push({
                origin: origin.address,
                destination: destination.address,
                label: 'address'
            });
        }

        // Strategy 2: 장소 이름 사용
        if (origin.name && destination.name) {
            strategies.push({
                origin: origin.name,
                destination: destination.name,
                label: 'name'
            });
        }

        // Strategy 3: 좌표 (fallback)
        strategies.push({
            origin: { lat: origin.location.lat, lng: origin.location.lng },
            destination: { lat: destination.location.lat, lng: destination.location.lng },
            label: 'coordinates'
        });

        // 각 전략을 순서대로 시도
        for (const strategy of strategies) {
            const result = await this.executeRouteRequest(strategy.origin, strategy.destination, mode, origin.name, destination.name, strategy.label);
            if (result) {
                return result;
            }
        }

        // 모든 전략 실패
        console.warn('⚠️ All routing strategies failed', {
            origin: origin.name,
            destination: destination.name,
            mode
        });
        return null;
    }

    private async executeRouteRequest(
        origin: string | google.maps.LatLngLiteral,
        destination: string | google.maps.LatLngLiteral,
        mode: string,
        originName: string,
        destinationName: string,
        strategyLabel: string
    ): Promise<Route | null> {
        return new Promise((resolve) => {
            // Normalize mode to uppercase for Google Maps JS SDK
            const normalizedMode = mode.toUpperCase();

            const request: google.maps.DirectionsRequest = {
                origin,
                destination,
                travelMode: normalizedMode as google.maps.TravelMode,
                region: 'JP', // 일본 지역 코드 명시
            };

            // For TRANSIT mode, add transit options
            if (normalizedMode === 'TRANSIT') {
                // 현재 시간 + 5분 후로 설정 (현재 시간은 대중교통이 없을 수 있음)
                const departureTime = new Date();
                departureTime.setMinutes(departureTime.getMinutes() + 5);

                request.transitOptions = {
                    departureTime,
                    modes: [
                        google.maps.TransitMode.TRAIN,
                        google.maps.TransitMode.SUBWAY,
                        google.maps.TransitMode.BUS,
                        google.maps.TransitMode.RAIL
                    ],
                    routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
                };
            }

            console.log(`🔍 Route request (${strategyLabel}):`, {
                origin: typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`,
                destination: typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`,
                originName,
                destinationName,
                mode,
                strategy: strategyLabel
            });

            this.service.route(
                request,
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK && result && result.routes[0] && result.routes[0].legs[0]) {
                        console.log(`✅ Route found using ${strategyLabel}:`, {
                            distance: result.routes[0].legs[0].distance?.text,
                            duration: result.routes[0].legs[0].duration?.text
                        });
                        const leg = result.routes[0].legs[0];
                        resolve({
                            distanceMeters: leg.distance?.value || 0,
                            durationSeconds: leg.duration?.value || 0,
                            mode: normalizedMode as any,
                            polyline: result.routes[0].overview_polyline,
                            steps: leg.steps.map(step => {
                                const transit = step.transit;
                                // Convert travel_mode to match RouteStep type
                                const stepMode = step.travel_mode === 'TRANSIT' ? 'TRANSIT'
                                    : step.travel_mode === 'DRIVING' ? 'DRIVING'
                                    : step.travel_mode === 'BICYCLING' ? 'BICYCLING'
                                    : 'WALKING';

                                return {
                                    instruction: step.instructions,
                                    distance: step.distance?.text || "",
                                    duration: step.duration?.text || "",
                                    mode: stepMode,
                                    transit: transit ? {
                                        line: transit.line ? {
                                            name: transit.line.name,
                                            short_name: transit.line.short_name,
                                            color: transit.line.color,
                                            vehicle: transit.line.vehicle ? {
                                                icon: transit.line.vehicle.icon,
                                                type: 'RAIL'
                                            } : undefined
                                        } : undefined,
                                        departure_stop: transit.departure_stop?.name,
                                        arrival_stop: transit.arrival_stop?.name,
                                        departure_time: transit.departure_time?.text,
                                        arrival_time: transit.arrival_time?.text,
                                        num_stops: transit.num_stops,
                                        headsign: transit.headsign
                                    } : undefined
                                };
                            })
                        });
                    } else {
                        // Only log warnings for unexpected errors (not NOT_FOUND)
                        if (status !== google.maps.DirectionsStatus.NOT_FOUND) {
                            console.warn(`Route request failed with ${strategyLabel} (${status})`);
                        }
                        resolve(null);
                    }
                }
            );
        });
    }
}
