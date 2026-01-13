import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaJourneyShareRepository } from "@/data/repositories/PrismaJourneyShareRepository";
import { AddTripCommentUseCase } from "@/domain/usecases/journeyShare/AddTripCommentUseCase";

const repository = new PrismaJourneyShareRepository();

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const placeId = searchParams.get("placeId");

        if (!placeId) {
            return NextResponse.json({ error: "장소 ID가 필요합니다." }, { status: 400 });
        }

        const useCase = new AddTripCommentUseCase(repository);
        const comments = await useCase.getComments(placeId);

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Get comments error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "댓글을 가져오는데 실패했습니다." },
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
        const { placeId, content } = body;

        if (!placeId || !content) {
            return NextResponse.json({ error: "장소 ID와 내용이 필요합니다." }, { status: 400 });
        }

        const useCase = new AddTripCommentUseCase(repository);
        const comment = await useCase.execute(placeId, session.user.id, content);

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Add comment error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "댓글 작성에 실패했습니다." },
            { status: 400 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { commentId, content } = body;

        if (!commentId || !content) {
            return NextResponse.json({ error: "댓글 ID와 내용이 필요합니다." }, { status: 400 });
        }

        const useCase = new AddTripCommentUseCase(repository);
        const comment = await useCase.update(commentId, session.user.id, content);

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Update comment error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "댓글 수정에 실패했습니다." },
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
        const commentId = searchParams.get("commentId");

        if (!commentId) {
            return NextResponse.json({ error: "댓글 ID가 필요합니다." }, { status: 400 });
        }

        const useCase = new AddTripCommentUseCase(repository);
        await useCase.delete(commentId, session.user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete comment error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "댓글 삭제에 실패했습니다." },
            { status: 400 }
        );
    }
}
