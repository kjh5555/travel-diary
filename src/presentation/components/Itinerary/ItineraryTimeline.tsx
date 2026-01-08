import { useItineraryStore } from "@/presentation/store/itineraryStore";
import { Trash2, MapPin, Clock } from "lucide-react";
import { PlaceDetailsCard } from "../Place/PlaceDetailsCard";

export const ItineraryTimeline = () => {
    const { items, removeItem } = useItineraryStore();

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <MapPin className="mb-2 h-10 w-10 opacity-20" />
                <p>Your itinerary is empty.</p>
                <p className="text-sm">Search for places on the map to add them.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={item.id} className="relative pl-6">
                    {/* Timeline connector */}
                    {index < items.length - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-gray-200 dark:bg-zinc-700" />
                    )}

                    {/* Dot */}
                    <div className="absolute left-0 top-2 h-6 w-6 rounded-full border-4 border-white bg-blue-500 shadow-sm dark:border-zinc-900" />

                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold">{item.place.name}</h3>
                                <p className="text-sm text-gray-500">{item.place.address}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    <span>{item.durationMinutes} min stay</span>
                                </div>
                                <PlaceDetailsCard place={item.place} />
                            </div>
                            <button
                                onClick={() => removeItem(item.id)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Travel Time Hint (Placeholder for now) */}
                        {index < items.length - 1 && (
                            <div className="mt-4 border-t border-dashed border-gray-200 pt-2 text-xs text-gray-400 dark:border-zinc-800">
                                <span className="italic">Calculate route to next stop...</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
