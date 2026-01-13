import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaJourneyShareRepository } from "@/data/repositories/PrismaJourneyShareRepository";
import { PrismaFriendRepository } from "@/data/repositories/PrismaFriendRepository";
import { ShareJourneyUseCase } from "@/domain/usecases/journeyShare/ShareJourneyUseCase";
import { ManageShareUseCase } from "@/domain/usecases/journeyShare/ManageShareUseCase";
import { SharePermission } from "@/domain/types/friend";

const journeyShareRepository = new PrismaJourneyShareRepository();
const friendRepository = new PrismaFriendRepository();

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const useCase = new ManageShareUseCase(journeyShareRepository);
        const shares = await useCase.getSharesForJourney(id, session.user.id);

        return NextResponse.json(shares);
    } catch (error) {
        console.error("Get shares error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "공유 목록을 가져오는데 실패했습니다." },
            { status: 500 }
        );
    }
}

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
        const { sharedWithId, permission = 'VIEW' } = body;

        if (!sharedWithId) {
            return NextResponse.json({ error: "공유할 사용자 ID가 필요합니다." }, { status: 400 });
        }

        const useCase = new ShareJourneyUseCase(journeyShareRepository, friendRepository);
        const share = await useCase.execute(id, session.user.id, sharedWithId, permission as SharePermission);

        return NextResponse.json(share, { status: 201 });
    } catch (error) {
        console.error("Share journey error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "여정 공유에 실패했습니다." },
            { status: 400 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { shareId, permission } = body;

        if (!shareId || !permission) {
            return NextResponse.json({ error: "공유 ID와 권한이 필요합니다." }, { status: 400 });
        }

        const useCase = new ManageShareUseCase(journeyShareRepository);
        const share = await useCase.updatePermission(shareId, session.user.id, permission as SharePermission);

        return NextResponse.json(share);
    } catch (error) {
        console.error("Update share error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "공유 권한 변경에 실패했습니다." },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const shareId = searchParams.get("shareId");

        if (!shareId) {
            return NextResponse.json({ error: "공유 ID가 필요합니다." }, { status: 400 });
        }

        const useCase = new ManageShareUseCase(journeyShareRepository);
        await useCase.removeShare(shareId, session.user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove share error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "공유 해제에 실패했습니다." },
            { status: 400 }
        );
    }
}
