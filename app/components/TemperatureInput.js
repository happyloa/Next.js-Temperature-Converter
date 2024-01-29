import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import styles from "./TempInput.module.css";

const theme = createTheme({
  palette: {
    custom: {
      main: "#15486D",
    },
  },
});

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
    <ThemeProvider theme={theme}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>輸入{scaleNames[scale]}溫度:</legend>
        <TextField
          type="number"
          value={temperature}
          onChange={(e) => onTemperatureChange(e, scale)}
          id="filled-basic"
          label="輸入溫度"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DeviceThermostatIcon />
              </InputAdornment>
            ),
          }}
          variant="filled"
          color="custom"
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
