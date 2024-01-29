import { TextField } from "@mui/material";

import styles from "./TempInput.module.css";

// TemperatureInput元件用於單個溫度輸入
export default function TemperatureInput({
  scale,
  temperature,
  onTemperatureChange,
}) {
  // 溫度刻度的標籤
  const scaleNames = {
    c: "攝氏",
    f: "華氏",
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>輸入{scaleNames[scale]}溫度:</legend>
      <TextField
        type="number"
        value={temperature}
        onChange={(e) => onTemperatureChange(e, scale)}
        id="outlined-basic"
        variant="outlined"
      />
      {/* <input
        className={styles.input}
        type="number"
        value={temperature}
        onChange={(e) => onTemperatureChange(e, scale)}
      /> */}
    </fieldset>
  );
}
