"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceInputState = "idle" | "listening" | "processing" | "error";

interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  lang?: string;
}

interface UseVoiceInputReturn {
  state: VoiceInputState;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  error: string | null;
}

/**
 * 使用 Web Speech API 進行語音輸入的 Hook。
 * 支援中文與英文語音辨識。
 */
export function useVoiceInput(
  options: UseVoiceInputOptions = {},
): UseVoiceInputReturn {
  const { onResult, onError, lang = "zh-TW" } = options;

  const [state, setState] = useState<VoiceInputState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // 僅在客戶端檢查支援度以避免 Hydration 不匹配
  useEffect(() => {
    const supported =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    setIsSupported(supported);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = "您的瀏覽器不支援語音輸入功能";
      setError(errorMsg);
      setState("error");
      onError?.(errorMsg);
      return;
    }

    // 停止任何現有的辨識
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState("listening");
      setError(null);
      setTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcriptText = lastResult[0].transcript;

      setTranscript(transcriptText);

      if (lastResult.isFinal) {
        setState("processing");
        // 從語音文字中提取數字
        const extracted = extractTemperature(transcriptText);
        if (extracted !== null) {
          onResult?.(extracted);
        } else {
          onResult?.(transcriptText);
        }
        setState("idle");
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMsg = "語音識別發生錯誤";

      switch (event.error) {
        case "no-speech":
          errorMsg = "未偵測到語音，請再試一次";
          break;
        case "audio-capture":
          errorMsg = "無法存取麥克風，請檢查權限設定";
          break;
        case "not-allowed":
          errorMsg = "麥克風權限被拒絕，請允許存取麥克風";
          break;
        case "network":
          errorMsg = "網路錯誤，請檢查網路連線";
          break;
        case "aborted":
          // 用戶取消，不視為錯誤
          setState("idle");
          return;
      }

      setError(errorMsg);
      setState("error");
      onError?.(errorMsg);
    };

    recognition.onend = () => {
      if (state === "listening") {
        setState("idle");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      const errorMsg = "無法啟動語音識別";
      setError(errorMsg);
      setState("error");
      onError?.(errorMsg);
    }
  }, [isSupported, lang, onResult, onError, state]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState("idle");
    }
  }, []);

  return {
    state,
    isSupported,
    startListening,
    stopListening,
    transcript,
    error,
  };
}

/**
 * 從語音轉錄文字中提取溫度數值。
 * 處理如 "25度"、"攝氏25度"、"二十五度" 等格式。
 */
function extractTemperature(text: string): string | null {
  // 正規化文字
  let normalized = text
    .replace(/負/g, "-")
    .replace(/零下/g, "-")
    .replace(/minus\s*/gi, "-")
    .replace(/negative\s*/gi, "-")
    .replace(/點/g, ".")
    .replace(/point\s*/gi, ".")
    .replace(/度/g, "")
    .replace(/degrees?/gi, "")
    .replace(/celsius/gi, "")
    .replace(/fahrenheit/gi, "")
    .replace(/kelvin/gi, "")
    .replace(/攝氏/g, "")
    .replace(/華氏/g, "")
    .trim();

  // 簡單處理常見中文數字 "二十五" -> "25"
  // 若包含 '十' 且前後有數字字元，則進行簡單轉換
  // 這裡做一個非常簡單的轉換邏輯，只處理 0-99 的口語
  const cnMap: Record<string, number> = {
    零: 0,
    一: 1,
    二: 2,
    两: 2,
    兩: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };

  // 嘗試將中文數字轉換為阿拉伯數字
  // 例如 "二十五" -> 2*10 + 5 = 25
  // "十三" -> 10 + 3 = 13
  // "五十" -> 5*10 = 50
  if (/^[零一二兩三四五六七八九十]+$/.test(normalized)) {
    let val = 0;
    if (normalized.startsWith("十")) {
      val += 10;
      if (normalized.length > 1) {
        val += cnMap[normalized[1]] || 0;
      }
    } else if (normalized.includes("十")) {
      const parts = normalized.split("十");
      if (parts[0]) val += (cnMap[parts[0]] || 0) * 10;
      if (parts[1]) val += cnMap[parts[1]] || 0;
    } else {
      // 單個數字
      val = cnMap[normalized] || 0;
    }
    return val.toString();
  }

  // 原有的阿拉伯數字匹配
  const numberMatch = normalized.match(/-?\d+\.?\d*/);
  if (numberMatch) {
    return numberMatch[0];
  }

  return null;
}
