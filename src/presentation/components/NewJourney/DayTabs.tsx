import React from 'react';

interface DayTabsProps {
    daysCount: number;
    currentDay: number;
    onDayChange: (day: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ daysCount, currentDay, onDayChange }) => {
    if (daysCount <= 1) return null;

    return (
        <div className="flex px-6 border-b border-[var(--border)] gap-1 shrink-0 overflow-x-auto">
            {Array.from({ length: daysCount }).map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => onDayChange(idx)}
                    className={`px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                        currentDay === idx
                            ? "text-[var(--primary)] font-bold"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                >
                    {idx + 1}일차
                    {currentDay === idx && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--primary)] rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
    );
};
