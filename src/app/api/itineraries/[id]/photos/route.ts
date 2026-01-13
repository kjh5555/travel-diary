import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaJourneyShareRepository } from "@/data/repositories/PrismaJourneyShareRepository";
import { AddTripPhotoUseCase } from "@/domain/usecases/journeyShare/AddTripPhotoUseCase";

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

        const useCase = new AddTripPhotoUseCase(repository);
        const photos = await useCase.getPhotos(placeId);

        return NextResponse.json(photos);
    } catch (error) {
        console.error("Get photos error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "사진을 가져오는데 실패했습니다." },
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
        const { placeId, imageUrl, caption } = body;

        if (!placeId || !imageUrl) {
            return NextResponse.json({ error: "장소 ID와 이미지가 필요합니다." }, { status: 400 });
        }

        const useCase = new AddTripPhotoUseCase(repository);
        const photo = await useCase.execute(placeId, session.user.id, imageUrl, caption);

        return NextResponse.json(photo, { status: 201 });
    } catch (error) {
        console.error("Add photo error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "사진 업로드에 실패했습니다." },
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
        const photoId = searchParams.get("photoId");

        if (!photoId) {
            return NextResponse.json({ error: "사진 ID가 필요합니다." }, { status: 400 });
        }

        const useCase = new AddTripPhotoUseCase(repository);
        await useCase.delete(photoId, session.user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete photo error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "사진 삭제에 실패했습니다." },
            { status: 400 }
        );
    }
}
