"use client";

import type { FC } from "react";
import { useCallback, useState } from "react";
import type { HistoryEntry } from "../types/history";

interface ExportButtonProps {
    history: HistoryEntry[];
    formatTemperature: (value: number) => string;
    className?: string;
}

/**
 * Export button for downloading history as CSV or copying to clipboard.
 */
export const ExportButton: FC<ExportButtonProps> = ({
    history,
    formatTemperature,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const generateCSV = useCallback((): string => {
        if (history.length === 0) return "";

        // CSV header
        const headers = ["時間", "攝氏 (°C)", "華氏 (°F)", "絕對溫標 (K)", "蘭氏 (°R)", "列氏 (°Ré)", "牛頓氏 (°N)"];

        // CSV rows
        const rows = history.map((entry) => {
            const date = new Date(entry.timestamp);
            const timeStr = date.toLocaleString("zh-TW");

            const values = entry.conversions.map((c) => formatTemperature(c.result));
            return [timeStr, ...values].join(",");
        });

        return [headers.join(","), ...rows].join("\n");
    }, [history, formatTemperature]);

    const handleExportCSV = useCallback(() => {
        try {
            const csv = generateCSV();
            if (!csv) {
                setStatus("error");
                setTimeout(() => setStatus("idle"), 2000);
                return;
            }

            // Create blob and download
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `temperature-history-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setStatus("success");
            setIsOpen(false);
            setTimeout(() => setStatus("idle"), 2000);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 2000);
        }
    }, [generateCSV]);

    const handleCopyToClipboard = useCallback(async () => {
        try {
            const csv = generateCSV();
            if (!csv) {
                setStatus("error");
                setTimeout(() => setStatus("idle"), 2000);
                return;
            }

            await navigator.clipboard?.writeText(csv);
            setStatus("success");
            setIsOpen(false);
            setTimeout(() => setStatus("idle"), 2000);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 2000);
        }
    }, [generateCSV]);

    const handleExportJSON = useCallback(() => {
        try {
            if (history.length === 0) {
                setStatus("error");
                setTimeout(() => setStatus("idle"), 2000);
                return;
            }

            const json = JSON.stringify(history, null, 2);
            const blob = new Blob([json], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `temperature-history-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setStatus("success");
            setIsOpen(false);
            setTimeout(() => setStatus("idle"), 2000);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 2000);
        }
    }, [history]);

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 rounded-xl px-3 py-2
          bg-white/5 text-white/70 text-sm
          hover:bg-white/10 hover:text-white
          transition-all duration-200
          ${status === "success" ? "bg-green-500/20 text-green-400" : ""}
          ${status === "error" ? "bg-red-500/20 text-red-400" : ""}
          ${className}
        `}
                aria-label="匯出紀錄"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                >
                    <path
                        fillRule="evenodd"
                        d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
                        clipRule="evenodd"
                    />
                </svg>
                {status === "success" ? "已匯出" : status === "error" ? "失敗" : "匯出"}
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-xl border border-slate-700/60 bg-slate-900/95 p-1 shadow-xl backdrop-blur">
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                        >
                            <span>📊</span>
                            <span>下載 CSV</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleExportJSON}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                        >
                            <span>📋</span>
                            <span>下載 JSON</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleCopyToClipboard}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                        >
                            <span>📎</span>
                            <span>複製到剪貼簿</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
