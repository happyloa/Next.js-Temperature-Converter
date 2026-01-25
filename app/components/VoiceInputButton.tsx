"use client";

import type { FC } from "react";
import { useVoiceInput } from "../hooks/useVoiceInput";

interface VoiceInputButtonProps {
    onResult: (value: string) => void;
    className?: string;
}

/**
 * Voice input button component with visual feedback.
 */
export const VoiceInputButton: FC<VoiceInputButtonProps> = ({ onResult, className = "" }) => {
    const { state, isSupported, startListening, stopListening, error } = useVoiceInput({
        onResult,
        lang: "zh-TW",
    });

    if (!isSupported) {
        return null;
    }

    const isListening = state === "listening";
    const isProcessing = state === "processing";
    const hasError = state === "error";

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleClick}
                disabled={isProcessing}
                className={`
          group relative flex items-center justify-center
          w-10 h-10 rounded-full transition-all duration-300
          ${isListening
                        ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse"
                        : hasError
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                    }
          ${isProcessing ? "opacity-50 cursor-wait" : "cursor-pointer"}
          ${className}
        `}
                title={isListening ? "點擊停止" : "語音輸入溫度"}
                aria-label={isListening ? "停止語音輸入" : "開始語音輸入"}
            >
                {isListening ? (
                    // Stop icon
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                ) : (
                    // Microphone icon
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                        <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.93V20H8a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07A7 7 0 0019 11z" />
                    </svg>
                )}

                {/* Listening animation rings */}
                {isListening && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                        <span className="absolute inset-[-4px] rounded-full border-2 border-red-500/30 animate-pulse" />
                    </>
                )}
            </button>

            {/* Error tooltip */}
            {hasError && error && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs whitespace-nowrap z-10">
                    {error}
                </div>
            )}
        </div>
    );
};
