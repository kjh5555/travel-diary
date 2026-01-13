import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaFriendRepository } from "@/data/repositories/PrismaFriendRepository";
import { GetFriendRequestsUseCase } from "@/domain/usecases/friend/GetFriendRequestsUseCase";

const repository = new PrismaFriendRepository();

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const useCase = new GetFriendRequestsUseCase(repository);
        const [sent, received, pendingCount] = await Promise.all([
            useCase.executeSent(session.user.id),
            useCase.executeReceived(session.user.id),
            useCase.getPendingCount(session.user.id)
        ]);

        return NextResponse.json({
            sent,
            received,
            pendingCount
        });
    } catch (error) {
        console.error("Get friend requests error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "친구 요청을 가져오는데 실패했습니다." },
            { status: 500 }
        );
    }
}
