"use client";

import { HeroSkeleton } from "./HeroSkeleton";
import { SummaryCardSkeleton, MetricBoxSkeleton, AirQualitySkeleton } from "./MetricSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";

export function WeatherSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Hero and Summary Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                <HeroSkeleton />
                <div className="grid gap-4 grid-rows-3 h-full">
                    <SummaryCardSkeleton />
                    <SummaryCardSkeleton />
                    <SummaryCardSkeleton />
                </div>
            </div>

            {/* 2. Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AirQualitySkeleton />
                <MetricBoxSkeleton />
                <MetricBoxSkeleton />
                <MetricBoxSkeleton />
            </div>

            {/* 3. Chart */}
            <ChartSkeleton />
        </div>
    );
}
