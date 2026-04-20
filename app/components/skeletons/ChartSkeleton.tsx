"use client";

import { BaseSkeleton } from "./BaseSkeleton";

export function ChartSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121420] p-8 shadow-sm dark:shadow-none h-full min-h-[500px]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <BaseSkeleton className="h-7 w-40" />
                    <BaseSkeleton className="h-4 w-64" />
                </div>
                <BaseSkeleton className="h-9 w-24 rounded-xl" />
            </div>
            
            <div className="h-[400px] w-full flex flex-col justify-end gap-4">
                <div className="flex items-end gap-2 h-full px-4">
                    {[30, 60, 45, 80, 55, 70, 40].map((h, i) => (
                        <BaseSkeleton 
                            key={i} 
                            className="flex-1 rounded-t-lg" 
                            style={{ height: `${h}%` }} 
                        />
                    ))}
                </div>
                <div className="flex justify-between px-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <BaseSkeleton key={i} className="h-3 w-8" />
                    ))}
                </div>
            </div>
        </div>
    );
}
