import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaFriendRepository } from "@/data/repositories/PrismaFriendRepository";
import { AcceptFriendRequestUseCase } from "@/domain/usecases/friend/AcceptFriendRequestUseCase";
import { RejectFriendRequestUseCase } from "@/domain/usecases/friend/RejectFriendRequestUseCase";

const repository = new PrismaFriendRepository();

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        if (action === 'accept') {
            const useCase = new AcceptFriendRequestUseCase(repository);
            const friendship = await useCase.execute(id, session.user.id);
            return NextResponse.json(friendship);
        } else if (action === 'reject') {
            const useCase = new RejectFriendRequestUseCase(repository);
            await useCase.execute(id, session.user.id);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "유효하지 않은 액션입니다." }, { status: 400 });
        }
    } catch (error) {
        console.error("Handle friend request error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "친구 요청 처리에 실패했습니다." },
            { status: 400 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await repository.cancelFriendRequest(id, session.user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cancel friend request error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "친구 요청 취소에 실패했습니다." },
            { status: 400 }
        );
    }
}
