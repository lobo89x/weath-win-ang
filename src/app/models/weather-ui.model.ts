/** Normalized shapes for UI (mapper output). */

export interface UiCurrentWeather {
  timestampUtc: number;
  temp: number;
  feelsLike: number;
  description: string;
  iconCode: string;
  iconUrl: string;
  /** 0–1 probability; from nearest hourly slice or today’s daily `pop` fallback. */
  precipitationProbability: number | null;
  humidityPercent: number;
  windSpeed: number;
  windDeg: number;
  cloudPercent: number;
  uvi: number;
}

export interface UiDailyForecast {
  dateUtc: number;
  description: string;
  summary: string;
  iconCode: string;
  iconUrl: string;
  tempMin: number;
  tempMax: number;
  feelsLikeDay: number;
  precipitationProbability: number;
  humidityPercent: number;
  windSpeed: number;
  uvi: number;
}

export interface UiWeatherAlert {
  event: string;
  startUtc: number;
  endUtc: number;
  description: string;
  senderName?: string;
  tags: string[];
}

export interface WeatherOverview {
  coordinates: { lat: number; lon: number };
  timezone: string;
  current: UiCurrentWeather;
  daily: UiDailyForecast[];
  alerts: UiWeatherAlert[];
}

export interface CitySearchResult {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  /** Ready for list / typeahead display */
  label: string;
}
