import { IJourneyShareRepository } from "@/domain/repositories/IJourneyShareRepository";
import { JourneyShare, SharePermission } from "@/domain/types/friend";

export class ManageShareUseCase {
    constructor(private repository: IJourneyShareRepository) {}

    async getSharesForJourney(itineraryId: string, ownerId: string): Promise<JourneyShare[]> {
        return await this.repository.getSharesForJourney(itineraryId, ownerId);
    }

    async updatePermission(shareId: string, ownerId: string, permission: SharePermission): Promise<JourneyShare> {
        return await this.repository.updateSharePermission(shareId, ownerId, permission);
    }

    async removeShare(shareId: string, ownerId: string): Promise<void> {
        await this.repository.removeShare(shareId, ownerId);
    }

    async checkAccess(itineraryId: string, userId: string): Promise<{ hasAccess: boolean; permission: SharePermission | null }> {
        return await this.repository.hasAccess(itineraryId, userId);
    }
}
