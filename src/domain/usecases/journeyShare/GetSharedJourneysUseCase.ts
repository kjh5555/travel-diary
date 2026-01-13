import { IJourneyShareRepository } from "@/domain/repositories/IJourneyShareRepository";
import { SharedJourneyInfo } from "@/domain/types/friend";
import { SavedItinerary } from "@/domain/types/itinerary";

export class GetSharedJourneysUseCase {
    constructor(private repository: IJourneyShareRepository) {}

    async executeSharedWithMe(userId: string): Promise<SharedJourneyInfo[]> {
        return await this.repository.getSharedWithMe(userId);
    }

    async executeGetJourney(itineraryId: string, userId: string): Promise<SavedItinerary | null> {
        const access = await this.repository.hasAccess(itineraryId, userId);
        if (!access.hasAccess) {
            throw new Error("이 여정에 접근할 권한이 없습니다.");
        }

        return await this.repository.getSharedJourney(itineraryId, userId);
    }
}
