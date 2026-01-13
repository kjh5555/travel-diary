import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaFriendRepository } from "@/data/repositories/PrismaFriendRepository";
import { GetFriendsUseCase } from "@/domain/usecases/friend/GetFriendsUseCase";
import { SendFriendRequestUseCase } from "@/domain/usecases/friend/SendFriendRequestUseCase";
import { RemoveFriendUseCase } from "@/domain/usecases/friend/RemoveFriendUseCase";

const repository = new PrismaFriendRepository();

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const useCase = new GetFriendsUseCase(repository);
        const friends = await useCase.execute(session.user.id);

        return NextResponse.json(friends);
    } catch (error) {
        console.error("Get friends error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "친구 목록을 가져오는데 실패했습니다." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { email, message } = body;

        if (!email) {
            return NextResponse.json({ error: "이메일이 필요합니다." }, { status: 400 });
        }

        const useCase = new SendFriendRequestUseCase(repository);
        const friendRequest = await useCase.execute(session.user.id, email, message);

        return NextResponse.json(friendRequest, { status: 201 });
    } catch (error) {
        console.error("Send friend request error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "친구 요청을 보내는데 실패했습니다." },
            { status: 400 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const friendId = searchParams.get("friendId");

        if (!friendId) {
            return NextResponse.json({ error: "친구 ID가 필요합니다." }, { status: 400 });
        }

        const useCase = new RemoveFriendUseCase(repository);
        await useCase.execute(session.user.id, friendId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove friend error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "친구 삭제에 실패했습니다." },
            { status: 500 }
        );
    }
}
