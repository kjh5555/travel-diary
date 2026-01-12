import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";

export class DeleteCustomThemeUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(id: string, userId: string): Promise<boolean> {
        if (!id) {
            throw new Error("테마 ID는 필수입니다");
        }
        if (!userId) {
            throw new Error("User ID is required");
        }
        return this.repository.delete(id, userId);
    }
}
