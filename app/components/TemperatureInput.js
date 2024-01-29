import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import styles from "./TempInput.module.css";

// 定義自訂主題，這裡定義了一個名為 custom 的顏色
const theme = createTheme({
  palette: {
    custom: {
      main: "#15486D",
    },
  },
});

// TemperatureInput 元件，用於單個溫度輸入
export default function TemperatureInput({
  scale,
  temperature,
  onTemperatureChange,
}) {
  // 定義溫度刻度的標籤，用於顯示攝氏或華氏
  const scaleNames = {
    c: "攝氏",
    f: "華氏",
  };

  return (
    // 使用 ThemeProvider 將自訂主題應用於此元件
    <ThemeProvider theme={theme}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>輸入{scaleNames[scale]}溫度:</legend>
        <TextField
          type="number" // 指定輸入類型為數字
          value={temperature} // 綁定溫度值
          onChange={(e) => onTemperatureChange(e, scale)} // 處理溫度改變
          id="filled-basic"
          label="輸入溫度"
          InputProps={{
            startAdornment: (
              // 在輸入框開頭添加溫度圖標
              <InputAdornment position="start">
                <DeviceThermostatIcon />
              </InputAdornment>
            ),
          }}
          variant="filled" // 文本框樣式
          color="custom" // 應用自訂顏色
          sx={{
            width: {
              sm: 250,
              md: 300,
              lg: 400,
            },
          }}
        />
      </fieldset>
    </ThemeProvider>
  );
}
