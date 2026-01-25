"use client";

import { useCallback, useRef, useState } from "react";

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
 * Hook for voice input using Web Speech API.
 * Supports Chinese and English speech recognition.
 */
export function useVoiceInput(
  options: UseVoiceInputOptions = {},
): UseVoiceInputReturn {
  const { onResult, onError, lang = "zh-TW" } = options;

  const [state, setState] = useState<VoiceInputState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = "您的瀏覽器不支援語音輸入功能";
      setError(errorMsg);
      setState("error");
      onError?.(errorMsg);
      return;
    }

    // Stop any existing recognition
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
        // Extract number from transcript
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
          // User aborted, not an error
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
 * Extract temperature value from speech transcript.
 * Handles patterns like "25度", "攝氏25度", "25 degrees", "negative 10", etc.
 */
function extractTemperature(text: string): string | null {
  // Normalize text
  const normalized = text
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

  // Match number patterns
  const numberMatch = normalized.match(/-?\d+\.?\d*/);

  if (numberMatch) {
    return numberMatch[0];
  }

  // Try to convert Chinese numbers
  const chineseNumbers: Record<string, string> = {
    零: "0",
    一: "1",
    二: "2",
    三: "3",
    四: "4",
    五: "5",
    六: "6",
    七: "7",
    八: "8",
    九: "9",
    十: "10",
    百: "100",
  };

  let convertedText = normalized;
  for (const [chinese, digit] of Object.entries(chineseNumbers)) {
    convertedText = convertedText.replace(new RegExp(chinese, "g"), digit);
  }

  const convertedMatch = convertedText.match(/-?\d+\.?\d*/);
  return convertedMatch ? convertedMatch[0] : null;
}
