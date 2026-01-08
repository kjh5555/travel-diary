
import { SavedItinerary } from "@/domain/types/itinerary";
import { PlaceImage } from "../Place/PlaceImage";

interface PlannerCardProps {
    itinerary: SavedItinerary;
    onClick: () => void;
}

export const PlannerCard = ({ itinerary, onClick }: PlannerCardProps) => {
    // Determine the representative place name for the image
    // Fallback order: First place -> Arrival Airport -> "Kyoto" (default generic)
    const firstPlace = itinerary.items.find(i => !i.isDayTransition)?.place;
    const placeName = firstPlace?.name || itinerary.arrivalAirport?.name || "Japan";
    const regionName = firstPlace?.address.split(',').pop()?.trim() || "Japan";

    return (
        <div
            onClick={onClick}
            className="group relative bg-white p-6 shadow-md rounded-sm cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-xl rotate-[-1deg] hover:rotate-0 duration-300 border-2 border-[#E5E2D0] hover:border-[#E09F3E]"
        >
            {/* Tape effect */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-blue-100/50 rotate-[2deg] shadow-sm backdrop-blur-sm border border-white/20"></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold font-[family-name:var(--font-caveat)] text-[#2C2724] group-hover:text-[#E09F3E] transition-colors truncate">
                        {itinerary.title || "My Trip"}
                    </h3>
                    <div className="text-xs font-nunito text-[#78716C] mt-1 bg-[#FDFCF0] px-2 py-1 inline-block rounded-sm border border-[#E5E2D0]">
                        {new Date(itinerary.startDate).toLocaleDateString()} ~ {new Date(itinerary.endDate).toLocaleDateString()}
                    </div>
                </div>
                <span className="text-2xl">🇯🇵</span>
            </div>

            <div className="space-y-2 mt-4">
                {itinerary.arrivalAirport && (
                    <div className="flex items-center gap-2 text-sm text-[#78716C]">
                        <span>🛫</span>
                        <span className="truncate">{itinerary.arrivalAirport.name}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[#78716C]">
                    <span>📍</span>
                    <span>{itinerary.items.filter(i => !i.isDayTransition).length} Places</span>
                </div>
            </div>
        </div>
    );
};
