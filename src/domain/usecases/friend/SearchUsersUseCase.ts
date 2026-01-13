import { IFriendRepository } from "@/domain/repositories/IFriendRepository";
import { User } from "@/domain/entities/User";

export class SearchUsersUseCase {
    constructor(private repository: IFriendRepository) {}

    async execute(email: string, excludeUserId: string): Promise<User[]> {
        if (!email || email.length < 3) {
            return [];
        }

        return await this.repository.searchUsersByEmail(email.trim().toLowerCase(), excludeUserId);
    }
}
