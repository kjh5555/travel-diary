import React from 'react';

interface DateSelectorProps {
    startDate: string;
    endDate: string;
    isEditingDate: boolean;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onToggleEdit: () => void;
    onFinishEdit: () => void;
    required?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
    startDate,
    endDate,
    isEditingDate,
    onStartDateChange,
    onEndDateChange,
    onToggleEdit,
    onFinishEdit,
    required = false
}) => {
    const isMissingDates = required && (!startDate || !endDate);
    if (startDate && endDate && !isEditingDate) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[var(--primary)]">calendar_month</span>
                    <span className="font-medium">
                        {new Date(startDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                    </span>
                    <span className="text-[var(--muted-foreground)]">~</span>
                    <span className="font-medium">
                        {new Date(endDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                    </span>
                </div>
                <button
                    onClick={onToggleEdit}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors"
                    title="날짜 변경"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">
                        시작일 {required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => onStartDateChange(e.target.value)}
                        className={`h-10 bg-[var(--secondary)] border rounded-lg px-3 text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${
                            required && !startDate ? 'border-red-400' : 'border-[var(--border)]'
                        }`}
                    />
                </div>
                <span className="text-[var(--muted-foreground)] mt-5">~</span>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">
                        종료일 {required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={e => {
                            onEndDateChange(e.target.value);
                            if (startDate && e.target.value) {
                                onFinishEdit();
                            }
                        }}
                        className={`h-10 bg-[var(--secondary)] border rounded-lg px-3 text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${
                            required && !endDate ? 'border-red-400' : 'border-[var(--border)]'
                        }`}
                    />
                </div>
            </div>
            {isMissingDates && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    시작일과 종료일을 설정해주세요
                </p>
            )}
        </div>
    );
};
