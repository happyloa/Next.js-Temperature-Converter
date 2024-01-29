import React from 'react';

// TemperatureInput元件用於單個溫度輸入
function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  // 溫度刻度的標籤
  const scaleNames = {
    c: '攝氏',
    f: '華氏'
  };

  return (
    <fieldset>
      <legend>輸入{scaleNames[scale]}溫度:</legend>
      <input type="number" value={temperature}
             onChange={(e) => onTemperatureChange(e, scale)} />
    </fieldset>
  );
}