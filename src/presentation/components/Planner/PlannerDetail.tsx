
import { SavedItinerary, SavedItineraryPlace, PlaceMemory } from "@/domain/types/itinerary";
import { useState, useRef } from "react";
import { MapContainer } from "../Map/MapContainer";

interface PlannerDetailProps {
    itinerary: SavedItinerary;
    onBack: () => void;
    onUpdateMemory: (placeIndex: number, memory: PlaceMemory) => void;
}

export const PlannerDetail = ({ itinerary, onBack, onUpdateMemory }: PlannerDetailProps) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Initial map center
    const initialCenter = itinerary.arrivalAirport?.location
        || itinerary.items.find(i => !i.isDayTransition)?.place.location;

    // Helper to handle file upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, placeIndex: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Currently only supporting single image for simplicity in UI, but array in data
                const currentMemory = itinerary.items[placeIndex].memory || {};
                const newImages = [...(currentMemory.images || []), base64String];

                onUpdateMemory(placeIndex, {
                    ...currentMemory,
                    images: newImages,
                    timestamp: new Date().toISOString()
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleLike = (placeIndex: number) => {
        const currentMemory = itinerary.items[placeIndex].memory || {};
        onUpdateMemory(placeIndex, {
            ...currentMemory,
            isLiked: !currentMemory.isLiked,
            timestamp: new Date().toISOString()
        });
    }

    const handleTextChange = (text: string, placeIndex: number) => {
        const currentMemory = itinerary.items[placeIndex].memory || {};
        onUpdateMemory(placeIndex, {
            ...currentMemory,
            text,
            timestamp: new Date().toISOString()
        });
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">
            {/* Left: Map */}
            <div className="w-1/3 bg-white p-2 shadow-sm rounded-sm border-2 border-white relative h-full flex flex-col">
                <div className="flex-1 relative rounded-sm overflow-hidden border border-[#E5E2D0]">
                    <MapContainer
                        onMapLoad={setMap}
                        center={initialCenter}
                        zoom={10}
                    />
                </div>
                <div className="mt-4 text-center">
                    <h2 className="text-3xl font-[family-name:var(--font-caveat)] font-bold text-[#2C2724]">{itinerary.title}</h2>
                    <p className="text-sm text-[#78716C] mt-1">
                        {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                    </p>
                    <button onClick={onBack} className="mt-4 px-4 py-2 text-sm text-[#78716C] border border-[#E5E2D0] rounded-sm hover:border-[#E09F3E] hover:text-[#E09F3E] transition-colors">
                        ← Back to Collection
                    </button>
                </div>
            </div>

            {/* Right: Diary Timeline */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pr-4">
                <div className="space-y-12 pb-20">
                    {itinerary.items.map((item, index) => {
                        // Logic: Show all items. Use isDayTransition to show a divider AFTER the item.

                        return (
                            <div key={index}>
                                <div className="flex gap-6 group">
                                    {/* Time/Day Column */}
                                    <div className="w-24 text-right pt-4 shrink-0">
                                        <div className="font-[family-name:var(--font-caveat)] text-2xl text-[#E09F3E]">Day {item.day + 1}</div>
                                        <div className="text-xs text-[#78716C] font-mono mt-1">Stop #{index + 1}</div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 bg-white p-6 rounded-sm shadow-sm border border-[#E5E2D0] relative hover:shadow-md transition-shadow">
                                        {/* Place Header */}
                                        <div className="flex justify-between items-start mb-4 border-b border-dashed border-[#E5E2D0] pb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#2C2724]">{item.place.name}</h3>
                                                <p className="text-xs text-[#78716C] opacity-70">{item.place.address}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleLike(index)}
                                                    className={`text-2xl transition-transform active:scale-95 hover:scale-110 ${item.memory?.isLiked ? "opacity-100 scale-110" : "opacity-20 hover:opacity-60"}`}
                                                    title="Save to Memories"
                                                >
                                                    ❤️
                                                </button>
                                                <div className="text-2xl opacity-20">📍</div>
                                            </div>

                                        </div>

                                        {/* Memory Section */}
                                        <div className="bg-[#FDFCF0] p-4 rounded-sm border border-[#E5E2D0]/50">

                                            {/* Image Display */}
                                            {item.memory?.images && item.memory.images.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    {item.memory.images.map((img, i) => (
                                                        <div key={i} className="aspect-video relative rounded-sm overflow-hidden border border-white shadow-sm">
                                                            <img src={img} alt="Memory" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mb-4 h-32 border-2 border-dashed border-[#E5E2D0] rounded-sm flex flex-col items-center justify-center text-[#78716C]/50 hover:bg-white hover:border-[#E09F3E]/50 transition-colors cursor-pointer relative">
                                                    <span className="text-2xl">📷</span>
                                                    <span className="text-sm font-[family-name:var(--font-caveat)]">Add a photo</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, index)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            )}

                                            {/* Text Input */}
                                            <textarea
                                                placeholder="Write about this moment..."
                                                value={item.memory?.text || ""}
                                                onChange={(e) => handleTextChange(e.target.value, index)}
                                                className="w-full bg-transparent text-[#2C2724] placeholder:text-[#78716C]/40 focus:outline-none focus:ring-0 resize-none font-[family-name:var(--font-caveat)] text-xl leading-relaxed"
                                                rows={2}
                                            />

                                            {/* Add Photo Button (Small) if images exist */}
                                            {item.memory?.images && item.memory.images.length > 0 && (
                                                <div className="mt-2 flex justify-end">
                                                    <label className="text-xs text-[#78716C] hover:text-[#E09F3E] cursor-pointer flex items-center gap-1">
                                                        <span>+ Add another photo</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(e, index)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>

                                        {/* Connector Logic (Visual only for now) */}
                                        <div className="absolute top-1/2 -left-3 w-3 h-3 bg-white border-2 border-[#E5E2D0] rounded-full transform -translate-y-1/2"></div>
                                    </div>
                                </div>

                                {/* Visual Divider for Day Transition */}
                                {item.isDayTransition && (
                                    <div className="flex items-center gap-4 my-8 pl-12 opacity-50">
                                        <div className="h-px bg-gray-300 flex-1"></div>
                                        <span className="text-xs font-mono text-gray-400">End of Day {item.day + 1}</span>
                                        <div className="h-px bg-gray-300 flex-1"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
