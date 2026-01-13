import { IFriendRepository } from "@/domain/repositories/IFriendRepository";
import { FriendRequest } from "@/domain/types/friend";

export class SendFriendRequestUseCase {
    constructor(private repository: IFriendRepository) {}

    async execute(senderId: string, receiverEmail: string, message?: string): Promise<FriendRequest> {
        if (!receiverEmail || !receiverEmail.includes('@')) {
            throw new Error("유효한 이메일 주소를 입력해주세요.");
        }

        const isFriend = await this.repository.isFriend(senderId, receiverEmail);
        if (isFriend) {
            throw new Error("이미 친구인 사용자입니다.");
        }

        return await this.repository.sendFriendRequest(senderId, receiverEmail.trim().toLowerCase(), message);
    }
}
