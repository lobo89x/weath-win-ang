/** Subset of OpenWeather One Call API 3.0 JSON — only fields we consume. */

export interface OneCallWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OneCallCurrent {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  clouds: number;
  uvi: number;
  visibility?: number;
  wind_speed: number;
  wind_deg: number;
  weather: OneCallWeatherCondition[];
}

export interface OneCallDailyTemp {
  min: number;
  max: number;
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export interface OneCallDailyFeelsLike {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export interface OneCallDaily {
  dt: number;
  summary: string;
  sunrise: number;
  sunset: number;
  temp: OneCallDailyTemp;
  feels_like: OneCallDailyFeelsLike;
  pressure: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  weather: OneCallWeatherCondition[];
  clouds: number;
  pop: number;
  uvi: number;
  rain?: number;
  snow?: number;
}

export interface OneCallHourly {
  dt: number;
  pop: number;
}

export interface OneCallAlert {
  sender_name?: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags?: string[];
}

export interface OneCallApiResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: OneCallCurrent;
  hourly?: OneCallHourly[];
  daily: OneCallDaily[];
  alerts?: OneCallAlert[];
}
