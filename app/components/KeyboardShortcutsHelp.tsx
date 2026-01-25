"use client";

import type { FC } from "react";
import { useState } from "react";

interface ShortcutInfo {
    keys: string;
    description: string;
}

interface KeyboardShortcutsHelpProps {
    shortcuts: ShortcutInfo[];
}

/**
 * Keyboard shortcuts help panel that shows on ? key press.
 */
export const KeyboardShortcutsHelp: FC<KeyboardShortcutsHelpProps> = ({ shortcuts }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Help button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 shadow-lg backdrop-blur transition-all hover:bg-slate-700 hover:text-white"
                aria-label="鍵盤快捷鍵"
                title="鍵盤快捷鍵 (?)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                >
                    <path
                        fillRule="evenodd"
                        d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 01-.53 1.28h-9a.75.75 0 01-.53-1.28l.621-.622a2.25 2.25 0 00.659-1.59V18h-3a3 3 0 01-3-3V5.25zm1.5 0v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="mx-4 max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-100">鍵盤快捷鍵</h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {shortcuts.map((shortcut, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between gap-4 text-sm"
                                >
                                    <span className="text-slate-300">{shortcut.description}</span>
                                    <kbd className="rounded-lg bg-slate-800 px-2 py-1 font-mono text-xs text-slate-200">
                                        {shortcut.keys}
                                    </kbd>
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                            按 Escape 或點擊外部關閉
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};
