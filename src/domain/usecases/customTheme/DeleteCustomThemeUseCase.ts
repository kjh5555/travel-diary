import { ICustomThemeRepository } from "@/domain/repositories/ICustomThemeRepository";

export class DeleteCustomThemeUseCase {
    constructor(private repository: ICustomThemeRepository) {}

    async execute(id: string): Promise<boolean> {
        if (!id) {
            throw new Error("테마 ID는 필수입니다");
        }
        return this.repository.delete(id);
    }
}
