import { IFriendRepository } from "@/domain/repositories/IFriendRepository";

export class RejectFriendRequestUseCase {
    constructor(private repository: IFriendRepository) {}

    async execute(requestId: string, userId: string): Promise<void> {
        if (!requestId) {
            throw new Error("요청 ID가 필요합니다.");
        }

        await this.repository.rejectFriendRequest(requestId, userId);
    }
}
