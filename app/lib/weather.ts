/**
 * Open-Meteo weather code 對應的中文描述。
 */
export const WEATHER_CODE_MAP: Record<number, string> = {
  0: "晴朗無雲",
  1: "大致晴朗",
  2: "局部多雲",
  3: "陰天",
  45: "有霧",
  48: "霧凇",
  51: "毛毛雨",
  53: "間歇性小雨",
  55: "毛毛雨偏強",
  56: "凍毛毛雨",
  57: "凍毛毛雨偏強",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "凍雨",
  67: "凍雨偏強",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "霰或冰珠",
  80: "短暫小陣雨",
  81: "短暫中陣雨",
  82: "短暫強陣雨",
  85: "短暫小陣雪",
  86: "短暫強陣雪",
  95: "可能打雷",
  96: "雷陣雨伴隨冰雹",
  99: "強雷陣雨伴隨冰雹",
};

/**
 * 預設城市清單，方便快速體驗。
 */
export const WEATHER_PRESETS: string[] = ["高雄", "東京", "紐約", "倫敦"];

export const getWeatherDescription = (code: number): string =>
  WEATHER_CODE_MAP[code] ?? "天氣狀況不明，請再試一次。";
