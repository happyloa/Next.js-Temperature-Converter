"use client";

import { BaseSkeleton } from "./BaseSkeleton";

interface ChartGraphicSkeletonProps {
    className?: string;
}

export function ChartGraphicSkeleton({ className }: ChartGraphicSkeletonProps) {
    return (
        <div className={`space-y-6 ${className}`}>
            {/* Axis and Labels mimic */}
            <div className="relative h-[250px] w-full border-l border-b border-slate-200/20 dark:border-white/10">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-full h-px bg-slate-200/5 dark:bg-white/5" />
                    ))}
                </div>

                {/* Line 1 (High Temp - Reddish) */}
                <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path
                        d="M0,40 Q25,35 50,30 T100,25"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-red-500 animate-pulse"
                    />
                    {[0, 25, 50, 75, 100].map((x, i) => (
                        <circle key={i} cx={x} cy={40 - (i * 3)} r="1.5" fill="currentColor" className="text-red-500 animate-pulse" />
                    ))}
                </svg>

                {/* Line 2 (Low Temp - Bluish) */}
                <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path
                        d="M0,70 Q25,75 50,65 T100,60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-500 animate-pulse"
                    />
                    {[0, 25, 50, 75, 100].map((x, i) => (
                        <circle key={i} cx={x} cy={70 - (i * 2)} r="1.5" fill="currentColor" className="text-blue-500 animate-pulse" />
                    ))}
                </svg>
            </div>

            {/* Legend mimic */}
            <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500/40 animate-pulse" />
                    <BaseSkeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500/40 animate-pulse" />
                    <BaseSkeleton className="h-3 w-12" />
                </div>
            </div>

            {/* X-axis labels mimic */}
            <div className="flex justify-between px-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <BaseSkeleton key={i} className="h-3 w-8" />
                ))}
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121420] p-8 shadow-sm dark:shadow-none min-h-[500px]">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                    <BaseSkeleton className="h-7 w-40" />
                    <BaseSkeleton className="h-4 w-60" />
                    <div className="pt-2">
                        <BaseSkeleton className="h-4 w-24" />
                    </div>
                </div>
                <BaseSkeleton className="h-10 w-32 rounded-xl" />
            </div>
            
            <ChartGraphicSkeleton />
            
            {/* Background Decoration Pulse */}
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-200/5 dark:bg-white/5 blur-3xl animate-pulse" />
        </div>
    );
}
