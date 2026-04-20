"use client";

import { BaseSkeleton } from "./BaseSkeleton";

export function HeroSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-900 p-8 lg:col-span-2 shadow-2xl dark:shadow-none min-h-[320px] flex flex-col justify-between">
            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-4">
                    <BaseSkeleton className="h-10 w-48 sm:h-12 sm:w-64" />
                    <div className="flex gap-2">
                        <BaseSkeleton className="h-4 w-32" />
                        <BaseSkeleton className="h-4 w-20 rounded-full" />
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                    <BaseSkeleton className="h-10 w-10 rounded-lg" />
                    <BaseSkeleton className="h-4 w-20" />
                </div>
            </div>

            <div className="relative z-10 flex items-end gap-6">
                <div className="flex-1">
                    <BaseSkeleton className="h-24 w-40 sm:h-32 sm:w-56 rounded-2xl" />
                </div>

                <div className="flex flex-col gap-2 pb-4 text-right">
                    <BaseSkeleton className="h-6 w-32 ml-auto" />
                    <BaseSkeleton className="h-4 w-20 ml-auto" />
                </div>
            </div>
            
            {/* Mimic the background gradient spot */}
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#00CECB]/5 blur-3xl"></div>
        </div>
    );
}
