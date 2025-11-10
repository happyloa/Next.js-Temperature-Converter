"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";

import { HISTORY_STORAGE_KEY, parseHistoryPayload } from "../lib/history";
import type { HistoryEntry } from "../types/history";

/**
 * 封裝歷史紀錄的讀寫，包含 localStorage 與 sessionStorage 的 fallback 邏輯。
 */
export function useHistoryStore() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const storageRef = useRef<"local" | "session">("local");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storages: Array<{ name: "local" | "session"; storage: Storage }> = [
      { name: "local", storage: window.localStorage },
      { name: "session", storage: window.sessionStorage },
    ];

    for (const { name, storage } of storages) {
      try {
        const raw = storage.getItem(HISTORY_STORAGE_KEY);
        if (!raw) {
          continue;
        }

        const parsed = parseHistoryPayload(JSON.parse(raw) as unknown);
        if (parsed.length) {
          startTransition(() => setHistory(parsed));
          storageRef.current = name;
          break;
        }
      } catch (error) {
        console.error("Failed to restore history", error);
      }
    }

    startTransition(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) {
      return;
    }

    const payload = history.length > 0 ? JSON.stringify(history) : null;

    const storages: Array<{ name: "local" | "session"; storage: Storage }> =
      storageRef.current === "session"
        ? [
            { name: "session", storage: window.sessionStorage },
            { name: "local", storage: window.localStorage },
          ]
        : [
            { name: "local", storage: window.localStorage },
            { name: "session", storage: window.sessionStorage },
          ];

    const isQuotaExceeded = (error: unknown): boolean => {
      if (!error) return false;
      if (error instanceof DOMException) {
        return (
          error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
          error.code === 22 ||
          error.code === 1014
        );
      }
      return false;
    };

    for (const { name, storage } of storages) {
      try {
        if (!payload) {
          storage.removeItem(HISTORY_STORAGE_KEY);
        } else {
          storage.setItem(HISTORY_STORAGE_KEY, payload);
        }
        storageRef.current = name;
        return;
      } catch (error) {
        if (isQuotaExceeded(error)) {
          continue;
        }
        console.error("Failed to persist history", error);
        return;
      }
    }
  }, [history, hydrated]);

  const addHistoryEntry = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, 8));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return {
    history,
    addHistoryEntry,
    clearHistory,
  };
}
