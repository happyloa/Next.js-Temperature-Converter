"use client";

import React, { useState } from "react";
import TemperatureInput from "./components/TemperatureInput";
import styles from "./page.module.css";

// TemperatureConverter 主元件，用於攝氏與華氏溫度轉換
export default function TemperatureConverter() {
  const [temperature, setTemperature] = useState("");
  const [scale, setScale] = useState("c");
  const [error, setError] = useState("");

  // 處理溫度輸入變更的函數
  const handleTemperatureChange = (e, scale) => {
    const value = e.target.value;
    if (!value || !isNaN(value)) {
      setTemperature(value);
      setScale(scale);
      setError("");
    } else {
      setError("請輸入有效的數字");
    }
  };

  // 溫度轉換函數：攝氏轉華氏
  const toFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

  // 溫度轉換函數：華氏轉攝氏
  const toCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

  // 嘗試進行溫度轉換，並返回轉換後的溫度值
  const tryConvert = (temperature, convert) => {
    const input = parseFloat(temperature);
    if (Number.isNaN(input)) return "";
    return convert(input).toString();
  };

  const celsius =
    scale === "f" ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit =
    scale === "c" ? tryConvert(temperature, toFahrenheit) : temperature;

  return (
    <div>
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
    </div>
  );
}
