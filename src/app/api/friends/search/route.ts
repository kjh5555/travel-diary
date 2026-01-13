import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaFriendRepository } from "@/data/repositories/PrismaFriendRepository";
import { SearchUsersUseCase } from "@/domain/usecases/friend/SearchUsersUseCase";

const repository = new PrismaFriendRepository();

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json([]);
        }

        const useCase = new SearchUsersUseCase(repository);
        const users = await useCase.execute(email, session.user.id);

        return NextResponse.json(users);
    } catch (error) {
        console.error("Search users error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "사용자 검색에 실패했습니다." },
            { status: 500 }
        );
    }
}
