"use client";

import React, { useState } from "react";

import TemperatureInput from "./components/TemperatureInput";
import styles from "./page.module.css";

// 主元件，用於攝氏與華氏溫度轉換
export default function TemperatureConverter() {
  // 定義三個狀態：溫度值、溫度刻度（攝氏或華氏）和錯誤信息
  const [temperature, setTemperature] = useState("");
  const [scale, setScale] = useState("c");
  const [error, setError] = useState("");

  // 處理溫度輸入變更的函數
  const handleTemperatureChange = (e, scale) => {
    const value = e.target.value;
    if (!value || !isNaN(value)) {
      // 檢查輸入是否為有效數字
      setTemperature(value);
      setScale(scale);
      setError("");
    } else {
      setError("請輸入有效的數字");
    }
  };

  // 攝氏轉華氏的函數
  const toFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

  // 華氏轉攝氏的函數
  const toCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

  // 執行溫度轉換，並返回轉換後的溫度值，保留一位小數
  const tryConvert = (temperature, convert) => {
    const input = parseFloat(temperature);
    if (Number.isNaN(input)) return "";
    const result = convert(input);
    return result.toFixed(1); // 這裡使用 toFixed(1) 來保留一位小數
  };

  // 根據當前刻度，計算對應的溫度值
  const celsius =
    scale === "f" ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit =
    scale === "c" ? tryConvert(temperature, toFahrenheit) : temperature;

  return (
    <section className={styles.container}>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={handleTemperatureChange}
      />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={handleTemperatureChange}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
    </section>
  );
}
