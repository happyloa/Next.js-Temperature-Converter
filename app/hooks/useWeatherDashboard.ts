"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import type { WeatherData } from "../types/weather";

const WEATHER_STORAGE_KEY = "weather-dashboard-state";

/**
 * 整合地理、天氣、空氣品質與時間 API 的 hook，提供統一的查詢介面。
 */
export function useWeatherDashboard(defaultQuery: string) {
  const [weatherQuery, setWeatherQuery] = useState<string>(defaultQuery);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const storageRef = useRef<"local" | "session">("local");
  const initialFetchRef = useRef(false);

  const parseWeatherPayload = useCallback(
    (value: unknown): { query: string; data: WeatherData } | null => {
      if (!value || typeof value !== "object") return null;

      const record = value as { query?: unknown; data?: unknown };
      if (
        typeof record.query !== "string" ||
        !record.data ||
        typeof record.data !== "object"
      ) {
        return null;
      }

      const data = record.data as Partial<WeatherData>;
      const optionalNumberFields: Array<keyof WeatherData> = [
        "pressure",
        "dailyHigh",
        "dailyLow",
      ];
      const hasValidOptionalNumbers = optionalNumberFields.every(
        (field) => typeof data[field] === "number" || data[field] === null,
      );
      const hasValidCoordinates =
        data.coordinates === null ||
        (data.coordinates !== undefined &&
          typeof data.coordinates === "object" &&
          typeof data.coordinates.latitude === "number" &&
          typeof data.coordinates.longitude === "number");

      if (
        typeof data.location !== "string" ||
        !Array.isArray(data.administrative) ||
        typeof data.timezone !== "string" ||
        typeof data.timezoneAbbreviation !== "string" ||
        typeof data.observationTime !== "string" ||
        typeof data.temperature !== "number" ||
        typeof data.temperatureUnit !== "string" ||
        typeof data.apparentTemperature !== "number" ||
        typeof data.apparentTemperatureUnit !== "string" ||
        typeof data.humidity !== "number" ||
        typeof data.humidityUnit !== "string" ||
        typeof data.windSpeed !== "number" ||
        typeof data.windSpeedUnit !== "string" ||
        typeof data.pressureUnit !== "string" ||
        typeof data.precipitation !== "number" ||
        typeof data.precipitationUnit !== "string" ||
        typeof data.uvIndex !== "number" ||
        typeof data.uvIndexUnit !== "string" ||
        typeof data.weatherCode !== "number" ||
        typeof data.isDay !== "boolean" ||
        !hasValidOptionalNumbers ||
        typeof data.dailyTemperatureUnit !== "string" ||
        !hasValidCoordinates
      ) {
        return null;
      }

      return {
        query: record.query,
        data: {
          ...data,
          pressure:
            typeof data.pressure === "number" ? data.pressure : Number.NaN,
          dailyHigh:
            typeof data.dailyHigh === "number" ? data.dailyHigh : Number.NaN,
          dailyLow:
            typeof data.dailyLow === "number" ? data.dailyLow : Number.NaN,
          airQuality: data.airQuality ?? null,
          localTime: data.localTime ?? null,
          utcOffset: data.utcOffset ?? null,
          dayOfWeek: data.dayOfWeek ?? null,
        } as WeatherData,
      };
    },
    [],
  );

  const isQuotaExceeded = (error: unknown): boolean => {
    if (!error) return false;
    if (error instanceof DOMException) {
      return (
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        error.code === 22 ||
        error.code === 1014
      );
    }
    return false;
  };

  const persistWeather = useCallback(
    (payload: { query: string; data: WeatherData }) => {
      if (typeof window === "undefined") return;

      const storages: Array<{ name: "local" | "session"; storage: Storage }> =
        storageRef.current === "session"
          ? [
              { name: "session", storage: window.sessionStorage },
              { name: "local", storage: window.localStorage },
            ]
          : [
              { name: "local", storage: window.localStorage },
              { name: "session", storage: window.sessionStorage },
            ];

      const serialized = JSON.stringify(payload);

      for (const { name, storage } of storages) {
        try {
          storage.setItem(WEATHER_STORAGE_KEY, serialized);
          storageRef.current = name;
          return;
        } catch (error) {
          if (isQuotaExceeded(error)) {
            continue;
          }
          console.error("Failed to persist weather payload", error);
          return;
        }
      }
    },
    [],
  );

  type GeoApiLocation = {
    name: string;
    latitude: number;
    longitude: number;
    timezone?: string;
    country?: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
  };

  type GeoApiResponse = {
    results?: GeoApiLocation[];
  };

  type ForecastApiResponse = {
    current: {
      time: string;
      temperature_2m: number;
      apparent_temperature: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
      weather_code: number;
      surface_pressure?: number;
      pressure_msl?: number;
      precipitation: number;
      uv_index: number;
      is_day: number;
    };
    current_units?: {
      temperature_2m?: string;
      apparent_temperature?: string;
      relative_humidity_2m?: string;
      wind_speed_10m?: string;
      surface_pressure?: string;
      pressure_msl?: string;
      precipitation?: string;
      uv_index?: string;
    };
    daily?: {
      time?: string[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
    };
    daily_units?: {
      temperature_2m_max?: string;
      temperature_2m_min?: string;
    };
    timezone?: string;
    timezone_abbreviation?: string;
  };

  type AirQualityApiResponse = {
    current?: {
      european_aqi: number;
      pm2_5: number;
      pm10: number;
      time: string;
    };
    current_units?: {
      european_aqi?: string;
      pm2_5?: string;
      pm10?: string;
    };
  };

  type TimeApiResponse = {
    timezone?: string;
    abbreviation?: string;
    datetime?: string;
    utc_offset?: string;
    day_of_week?: number | null;
  };

  const [forecastDays, setForecastDays] = useState<7 | 14>(7);

  const fetchWeather = useCallback(
    async (query: string, days: 7 | 14 = forecastDays) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;

      const trimmed = query.trim();
      if (!trimmed) {
        setWeatherError("請輸入地點名稱");
        setWeatherData(null);
        setWeatherLoading(false);
        return;
      }

      setWeatherLoading(true);
      setWeatherError(null);

      try {
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            trimmed,
          )}&count=1&language=zh&format=json`,
          { signal },
        );

        if (!geoResponse.ok) {
          throw new Error("地理定位服務暫時無法使用");
        }

        const geoData = (await geoResponse.json()) as GeoApiResponse;

        if (!geoData?.results?.length) {
          throw new Error("找不到對應的地點，請嘗試輸入更完整的名稱。");
        }

        const [location] = geoData.results;

        const [forecastResult, airQualityResult, timeResult] =
          await Promise.allSettled([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure,pressure_msl,precipitation,uv_index,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=${days}&timezone=${encodeURIComponent(
                location.timezone ?? "auto",
              )}`,
              { signal },
            ),
            fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=european_aqi,pm2_5,pm10`,
              { signal },
            ),
            fetch(
              `https://worldtimeapi.org/api/timezone/${encodeURIComponent(
                location.timezone ?? "Etc/UTC",
              )}`,
              { signal },
            ),
          ]);

        if (
          forecastResult.status !== "fulfilled" ||
          !forecastResult.value?.ok
        ) {
          throw new Error("無法取得天氣資訊，請稍後再試。");
        }

        const forecast =
          (await forecastResult.value.json()) as ForecastApiResponse;

        let airQualityPayload: AirQualityApiResponse["current"] | null = null;
        let airQualityUnits: AirQualityApiResponse["current_units"] | null =
          null;
        if (
          airQualityResult.status === "fulfilled" &&
          airQualityResult.value?.ok
        ) {
          try {
            const parsed =
              (await airQualityResult.value.json()) as AirQualityApiResponse;
            airQualityPayload = parsed.current ?? null;
            airQualityUnits = parsed.current_units ?? null;
          } catch (error) {
            console.error("airQualityPayload", error);
          }
        }

        let timePayload: TimeApiResponse | null = null;
        if (timeResult.status === "fulfilled" && timeResult.value?.ok) {
          try {
            timePayload = (await timeResult.value.json()) as TimeApiResponse;
          } catch (error) {
            console.error("timePayload", error);
          }
        }

        const resolvedTimezone =
          location.timezone ??
          timePayload?.timezone ??
          forecast.timezone ??
          "UTC";

        const normalizedQuery = trimmed;
        const nextData: WeatherData = {
          location: `${location.name}${location.country ? ` · ${location.country}` : ""}`,
          administrative: [
            location.admin1,
            location.admin2,
            location.admin3,
          ].filter((item): item is string => Boolean(item)),
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          timezone: resolvedTimezone,
          timezoneAbbreviation:
            timePayload?.abbreviation ??
            forecast.timezone_abbreviation ??
            resolvedTimezone,
          observationTime: forecast.current.time,
          temperature: forecast.current.temperature_2m,
          temperatureUnit: forecast.current_units?.temperature_2m ?? "°C",
          apparentTemperature: forecast.current.apparent_temperature,
          apparentTemperatureUnit:
            forecast.current_units?.apparent_temperature ?? "°C",
          humidity: forecast.current.relative_humidity_2m,
          humidityUnit: forecast.current_units?.relative_humidity_2m ?? "%",
          windSpeed: forecast.current.wind_speed_10m,
          windSpeedUnit: forecast.current_units?.wind_speed_10m ?? "m/s",
          pressure:
            forecast.current.surface_pressure ??
            forecast.current.pressure_msl ??
            Number.NaN,
          pressureUnit:
            forecast.current_units?.surface_pressure ??
            forecast.current_units?.pressure_msl ??
            "hPa",
          precipitation: forecast.current.precipitation,
          precipitationUnit: forecast.current_units?.precipitation ?? "mm",
          uvIndex: forecast.current.uv_index,
          uvIndexUnit: forecast.current_units?.uv_index ?? "",
          weatherCode: forecast.current.weather_code,
          isDay: forecast.current.is_day === 1,
          dailyHigh: forecast.daily?.temperature_2m_max?.[0] ?? Number.NaN,
          dailyLow: forecast.daily?.temperature_2m_min?.[0] ?? Number.NaN,
          dailyTemperatureUnit:
            forecast.daily_units?.temperature_2m_max ?? "°C",
          airQuality: airQualityPayload
            ? {
                aqi: airQualityPayload.european_aqi,
                aqiUnit: airQualityUnits?.european_aqi ?? "",
                pm25: airQualityPayload.pm2_5,
                pm25Unit: airQualityUnits?.pm2_5 ?? "µg/m³",
                pm10: airQualityPayload.pm10,
                pm10Unit: airQualityUnits?.pm10 ?? "µg/m³",
                time: airQualityPayload.time,
              }
            : null,
          localTime: timePayload?.datetime ?? null,
          utcOffset: timePayload?.utc_offset ?? null,
          dayOfWeek: Number.isFinite(timePayload?.day_of_week)
            ? (timePayload?.day_of_week as number)
            : null,
          dailyForecast: (forecast.daily?.time ?? []).map((date, index) => ({
            date,
            high: forecast.daily?.temperature_2m_max?.[index] ?? 0,
            low: forecast.daily?.temperature_2m_min?.[index] ?? 0,
          })),
        };

        setWeatherQuery(normalizedQuery);
        setWeatherData(nextData);
        persistWeather({ query: normalizedQuery, data: nextData });
      } catch (error) {
        if (
          signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        console.error("fetchWeather", error);
        setWeatherData(null);
        const message =
          error instanceof Error
            ? error.message
            : "無法取得天氣資訊，請稍後再試。";
        setWeatherError(message);
      } finally {
        if (signal.aborted) {
          return;
        }
        setWeatherLoading(false);
      }
    },
    [persistWeather, forecastDays],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storages: Array<{ name: "local" | "session"; storage: Storage }> = [
      { name: "local", storage: window.localStorage },
      { name: "session", storage: window.sessionStorage },
    ];

    for (const { name, storage } of storages) {
      try {
        const raw = storage.getItem(WEATHER_STORAGE_KEY);
        if (!raw) {
          continue;
        }

        const parsed = parseWeatherPayload(JSON.parse(raw) as unknown);
        if (parsed) {
          setWeatherQuery(parsed.query);
          setWeatherData(parsed.data);
          storageRef.current = name;
          break;
        }
      } catch (error) {
        console.error("Failed to restore weather payload", error);
      }
    }

    setHydrated(true);
  }, [parseWeatherPayload]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    // Initial fetch or when query/days changes
    fetchWeather(weatherQuery);
  }, [fetchWeather, hydrated, weatherQuery, forecastDays]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleWeatherSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      fetchWeather(weatherQuery);
    },
    [fetchWeather, weatherQuery],
  );

  const handleWeatherPreset = useCallback(
    (preset: string) => {
      setWeatherQuery(preset);
      fetchWeather(preset);
    },
    [fetchWeather],
  );

  const [geolocating, setGeolocating] = useState(false);

  const handleGeolocate = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setWeatherError("您的瀏覽器不支援地理位置功能");
      return;
    }

    setGeolocating(true);
    setWeatherError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
          });
        },
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get location name
      const reverseGeoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=zh&format=json`,
      );

      let locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

      if (reverseGeoResponse.ok) {
        const reverseGeoData = await reverseGeoResponse.json();
        if (reverseGeoData?.results?.[0]?.name) {
          locationName = reverseGeoData.results[0].name;
        }
      }

      setWeatherQuery(locationName);
      await fetchWeather(locationName);
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setWeatherError("位置存取權限被拒絕，請在瀏覽器設定中允許");
            break;
          case error.POSITION_UNAVAILABLE:
            setWeatherError("無法取得位置資訊");
            break;
          case error.TIMEOUT:
            setWeatherError("取得位置逾時，請再試一次");
            break;
          default:
            setWeatherError("取得位置時發生錯誤");
        }
      } else {
        setWeatherError("取得位置時發生錯誤");
      }
    } finally {
      setGeolocating(false);
    }
  }, [fetchWeather]);

  return {
    weatherQuery,
    setWeatherQuery,
    weatherData,
    weatherLoading,
    weatherError,
    fetchWeather,
    handleWeatherSubmit,
    handleWeatherPreset,
    handleGeolocate,
    geolocating,
    forecastDays,
    setForecastDays,
  };
}
