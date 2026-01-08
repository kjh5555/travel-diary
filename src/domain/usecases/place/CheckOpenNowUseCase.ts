import { Place } from "@/domain/types/place";

export class CheckOpenNowUseCase {
    execute(place: Place): boolean | undefined {
        return place.opening_hours?.open_now;
    }
}
