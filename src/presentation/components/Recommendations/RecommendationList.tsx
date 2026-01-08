import { Place } from "@/domain/types/place";
import { useRecommendations } from "@/presentation/hooks/useRecommendations";
import { PlaceDetailsCard } from "../Place/PlaceDetailsCard";
import { useItineraryStore } from "@/presentation/store/itineraryStore";
import { Plus } from "lucide-react";

interface RecommendationListProps {
    place: Place;
    map: google.maps.Map | null;
}

export const RecommendationList = ({ place, map }: RecommendationListProps) => {
    const { recommendations, loading } = useRecommendations(place, map);
    const addItem = useItineraryStore(state => state.addItem);

    if (loading) return <div className="text-sm text-gray-500">Finding similar places...</div>;
    if (!recommendations.length) return null;

    return (
        <div className="mt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">You might also like</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {recommendations.map((rec) => (
                    <div key={rec.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-800/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-medium">{rec.name}</div>
                                <div className="text-xs text-gray-500 truncate">{rec.address}</div>
                                <PlaceDetailsCard place={rec} />
                            </div>
                            <button
                                onClick={() => {
                                    addItem(rec);
                                    alert(`Added ${rec.name} to itinerary`);
                                }}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600 dark:hover:bg-blue-900/30 dark:text-blue-400"
                                title="Add to Itinerary"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
