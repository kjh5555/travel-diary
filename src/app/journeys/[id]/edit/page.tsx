"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SavedItinerary } from "@/domain/types/itinerary";
import { LocalStorageItineraryRepository } from "@/data/repositories/LocalStorageItineraryRepository";
import { GetTripItineraryUseCase } from "@/domain/usecases/itinerary/GetTripItineraryUseCase";
import { NewJourneyModal } from "@/presentation/components/NewJourney/NewJourneyModal";

export default function JourneyEditPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const userId = session?.user?.id || "anonymous";
    const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadItinerary = async () => {
            if (!params.id || typeof params.id !== 'string') return;
            
            setIsLoading(true);
            try {
                const repository = new LocalStorageItineraryRepository();
                const useCase = new GetTripItineraryUseCase(repository);
                const result = await useCase.execute(params.id, userId);
                setItinerary(result);
            } catch (error) {
                console.error("Failed to load itinerary:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadItinerary();
    }, [params.id, userId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!itinerary) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/50 mb-4">
                    error_outline
                </span>
                <h2 className="text-2xl font-bold mb-2">여정을 찾을 수 없어요</h2>
                <p className="text-[var(--muted-foreground)] mb-6">요청하신 여행 일정이 존재하지 않습니다.</p>
                <button 
                    onClick={() => router.push('/journeys')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <NewJourneyModal
            isOpen={true}
            onClose={() => router.push(`/journeys/${params.id}`)}
            initialData={itinerary}
        />
    );
}
