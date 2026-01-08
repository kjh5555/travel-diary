"use client";

import { useEffect, useState } from "react";
import { Place } from "@/domain/types/place";
import { SavedItinerary } from "@/domain/types/itinerary";
import { getJourneyDays, getCurrentDayOfJourney, JourneyDay } from "@/domain/utils/dateUtils";

interface JourneySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    place: Place;
    matchingJourneys: SavedItinerary[];
    placeCountry: string | null;
    hasOngoingJourneys: boolean;
    onConfirm: (journeyId: string, day: number) => void;
}

type Step = 'journey' | 'day';

export const JourneySelectionModal = ({
    isOpen,
    onClose,
    place,
    matchingJourneys,
    placeCountry,
    hasOngoingJourneys,
    onConfirm
}: JourneySelectionModalProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState<Step>('journey');
    const [selectedJourney, setSelectedJourney] = useState<SavedItinerary | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [journeyDays, setJourneyDays] = useState<JourneyDay[]>([]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            
            if (matchingJourneys.length === 1) {
                setSelectedJourney(matchingJourneys[0]);
                setStep('day');
            } else {
                setStep('journey');
                setSelectedJourney(null);
            }
            setSelectedDay(null);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen, matchingJourneys]);

    useEffect(() => {
        if (selectedJourney) {
            const days = getJourneyDays(selectedJourney.startDate, selectedJourney.endDate);
            setJourneyDays(days);
            
            const currentDay = getCurrentDayOfJourney(selectedJourney.startDate);
            const validCurrentDay = Math.min(currentDay, days.length - 1);
            setSelectedDay(validCurrentDay);
        }
    }, [selectedJourney]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleJourneySelect = (journey: SavedItinerary) => {
        setSelectedJourney(journey);
        setStep('day');
    };

    const handleConfirm = () => {
        if (selectedJourney && selectedDay !== null) {
            onConfirm(selectedJourney.id, selectedDay);
        }
    };

    const handleBack = () => {
        if (matchingJourneys.length > 1) {
            setStep('journey');
            setSelectedJourney(null);
            setSelectedDay(null);
        }
    };

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
    };

    const getPlaceCount = (journey: SavedItinerary) => {
        return journey.items.filter(item => !item.isDayTransition).length;
    };

    if (!isVisible) return null;

    const renderNoOngoingJourneys = () => (
        <div className="p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/50 mb-4 block">
                flight_takeoff
            </span>
            <h3 className="text-xl font-bold mb-2">진행 중인 여행이 없습니다</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
                현재 진행 중인 여행 일정이 없어요.<br />
                새로운 여행을 계획하거나, 예정된 여행이<br />
                시작되면 장소를 추가할 수 있습니다.
            </p>
            <button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] font-bold transition-colors"
            >
                닫기
            </button>
        </div>
    );

    const renderNoMatchingJourneys = () => (
        <div className="p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-[var(--muted-foreground)]/50 mb-4 block">
                location_off
            </span>
            <h3 className="text-xl font-bold mb-2">해당 국가에 진행 중인 여행이 없습니다</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
                {placeCountry ? `[${placeCountry}]` : '해당 위치'}에서 진행 중인 여행이 없어요.
            </p>
            <button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] font-bold transition-colors"
            >
                닫기
            </button>
        </div>
    );

    const renderJourneySelection = () => (
        <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">calendar_month</span>
                어떤 여행에 추가할까요?
            </h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {matchingJourneys.map(journey => (
                    <button
                        key={journey.id}
                        onClick={() => handleJourneySelect(journey)}
                        className="w-full p-4 bg-[var(--secondary)] hover:bg-[var(--border)] rounded-xl text-left transition-colors border border-transparent hover:border-[var(--primary)]"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold truncate">
                                    {journey.title || "나의 여행"}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-[var(--muted-foreground)]">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">calendar_today</span>
                                        {formatDateRange(journey.startDate, journey.endDate)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">location_on</span>
                                        {getPlaceCount(journey)}곳
                                    </span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-[var(--muted-foreground)]">
                                chevron_right
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDaySelection = () => (
        <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
                {matchingJourneys.length > 1 && (
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                )}
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--primary)]">event</span>
                    어느 날에 추가할까요?
                </h3>
            </div>

            {selectedJourney && (
                <div className="mb-4 p-3 bg-[var(--secondary)] rounded-xl">
                    <div className="text-sm text-[var(--muted-foreground)]">선택된 여행</div>
                    <div className="font-bold">{selectedJourney.title || "나의 여행"}</div>
                </div>
            )}

            <div className="mb-4 p-3 bg-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/20">
                <div className="text-sm text-[var(--primary)] font-medium">추가할 장소</div>
                <div className="font-bold">{place.name}</div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto mb-6">
                {journeyDays.map(day => (
                    <button
                        key={day.dayNumber}
                        onClick={() => setSelectedDay(day.dayNumber)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedDay === day.dayNumber
                                ? "bg-[var(--primary)] text-white"
                                : day.isToday
                                    ? "bg-[var(--primary)]/20 text-[var(--primary)] border-2 border-[var(--primary)]"
                                    : "bg-[var(--secondary)] hover:bg-[var(--border)]"
                        }`}
                    >
                        {day.label}
                        {day.isToday && (
                            <span className="ml-1 text-xs">(오늘)</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] font-medium transition-colors"
                >
                    취소
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={selectedDay === null}
                    className="flex-1 h-12 rounded-xl bg-[var(--primary)] text-white font-bold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    추가하기
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        if (!hasOngoingJourneys) {
            return renderNoOngoingJourneys();
        }
        
        if (matchingJourneys.length === 0) {
            return renderNoMatchingJourneys();
        }
        
        if (step === 'journey') {
            return renderJourneySelection();
        }
        
        return renderDaySelection();
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
        >
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transition-transform duration-300 ${
                    isOpen ? "scale-100" : "scale-95"
                }`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-[var(--secondary)] hover:bg-[var(--border)] rounded-full flex items-center justify-center transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="overflow-y-auto max-h-[90vh]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
