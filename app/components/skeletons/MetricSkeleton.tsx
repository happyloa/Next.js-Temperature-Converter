"use client";

import { BaseSkeleton } from "./BaseSkeleton";

export function SummaryCardSkeleton() {
    return (
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-white/5 px-6 py-4">
            <div className="flex items-center gap-4">
                <BaseSkeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col gap-1">
                    <BaseSkeleton className="h-4 w-16" />
                    <BaseSkeleton className="h-3 w-12" />
                </div>
            </div>
            <BaseSkeleton className="h-6 w-12" />
        </div>
    );
}

export function MetricBoxSkeleton() {
    return (
        <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121420] p-6 h-[160px] flex flex-col justify-between">
            <BaseSkeleton className="h-4 w-20" />
            <div className="flex items-end justify-between">
                <BaseSkeleton className="h-10 w-24" />
                <BaseSkeleton className="h-8 w-8 rounded-full opacity-50" />
            </div>
        </div>
    );
}

export function AirQualitySkeleton() {
    return (
        <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121420] p-6 h-full flex flex-col justify-between min-h-[160px]">
            <div className="mb-4 flex items-center justify-between">
                <BaseSkeleton className="h-4 w-24" />
                <BaseSkeleton className="h-5 w-12 rounded" />
            </div>
            <div className="flex flex-col gap-4">
                <BaseSkeleton className="h-10 w-16" />
                <div className="space-y-2 border-t border-slate-200 dark:border-white/5 pt-3">
                    <div className="flex justify-between items-center">
                        <BaseSkeleton className="h-3 w-12" />
                        <BaseSkeleton className="h-3 w-10" />
                    </div>
                    <div className="flex justify-between items-center">
                        <BaseSkeleton className="h-3 w-12" />
                        <BaseSkeleton className="h-3 w-10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
