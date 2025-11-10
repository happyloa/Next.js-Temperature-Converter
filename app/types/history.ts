import type { TemperatureScaleCode } from "./temperature";

/**
 * 歷史紀錄內單筆轉換的摘要資料。
 */
export type TemperatureConversionSummary = {
  code: TemperatureScaleCode;
  label: string;
  symbol: string;
  result: number;
};

/**
 * 使用者儲存的完整溫度轉換紀錄。
 */
export type HistoryEntry = {
  id: string;
  timestamp: string;
  scale: TemperatureScaleCode;
  scaleLabel: string;
  scaleSymbol: string;
  value: number;
  conversions: TemperatureConversionSummary[];
};
