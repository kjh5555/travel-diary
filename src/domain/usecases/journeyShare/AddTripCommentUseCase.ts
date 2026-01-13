import { IJourneyShareRepository } from "@/domain/repositories/IJourneyShareRepository";
import { TripComment } from "@/domain/types/friend";

export class AddTripCommentUseCase {
    constructor(private repository: IJourneyShareRepository) {}

    async execute(placeId: string, userId: string, content: string): Promise<TripComment> {
        if (!content || content.trim().length === 0) {
            throw new Error("댓글 내용을 입력해주세요.");
        }

        if (content.length > 1000) {
            throw new Error("댓글은 1000자 이내로 작성해주세요.");
        }

        return await this.repository.addComment(placeId, userId, content.trim());
    }

    async update(commentId: string, userId: string, content: string): Promise<TripComment> {
        if (!content || content.trim().length === 0) {
            throw new Error("댓글 내용을 입력해주세요.");
        }

        return await this.repository.updateComment(commentId, userId, content.trim());
    }

    async delete(commentId: string, userId: string): Promise<void> {
        await this.repository.deleteComment(commentId, userId);
    }

    async getComments(placeId: string): Promise<TripComment[]> {
        return await this.repository.getComments(placeId);
    }
}
