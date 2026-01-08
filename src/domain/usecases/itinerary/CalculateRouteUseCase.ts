import { IRouteRepository, Route } from "@/domain/types/itinerary";
import { Place } from "@/domain/types/place";

export class CalculateRouteUseCase {
    constructor(private routeRepository: IRouteRepository) { }

    async execute(origin: Place, destination: Place, mode: string = 'WALKING'): Promise<Route | null> {
        return this.routeRepository.getRoute(origin, destination, mode);
    }
}
