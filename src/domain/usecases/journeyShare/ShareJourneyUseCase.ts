import { IJourneyShareRepository } from "@/domain/repositories/IJourneyShareRepository";
import { IFriendRepository } from "@/domain/repositories/IFriendRepository";
import { JourneyShare, SharePermission } from "@/domain/types/friend";

export class ShareJourneyUseCase {
    constructor(
        private journeyShareRepository: IJourneyShareRepository,
        private friendRepository: IFriendRepository
    ) {}

    async execute(
        itineraryId: string,
        ownerId: string,
        sharedWithId: string,
        permission: SharePermission = 'VIEW'
    ): Promise<JourneyShare> {
        if (!itineraryId || !sharedWithId) {
            throw new Error("여정 ID와 공유할 사용자 ID가 필요합니다.");
        }

        const isFriend = await this.friendRepository.isFriend(ownerId, sharedWithId);
        if (!isFriend) {
            throw new Error("친구에게만 여정을 공유할 수 있습니다.");
        }

        return await this.journeyShareRepository.shareJourney(itineraryId, ownerId, sharedWithId, permission);
    }
}
