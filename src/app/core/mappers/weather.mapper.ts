import type { OneCallCurrent, OneCallApiResponse } from '../../models/one-call-api.model';
import type {
  RainIntensityLevel,
  UiCurrentWeather,
  UiDailyForecast,
  UiWeatherAlert,
  WeatherOverview,
} from '../../models/weather-ui.model';

const ICON_URL = (code: string) =>
  `https://openweathermap.org/img/wn/${code}@2x.png`;

function primaryCondition(weather: { description: string; icon: string }[]): {
  description: string;
  icon: string;
} {
  const w = weather[0];
  return {
    description: w?.description ?? '',
    icon: w?.icon ?? '01d',
  };
}

function deriveRainLevel(current: OneCallCurrent): RainIntensityLevel {
  const main = (current.weather[0]?.main ?? '').toLowerCase();
  const rainMm = current.rain?.['1h'] ?? 0;
  const snowMm = current.snow?.['1h'] ?? 0;
  const mm = rainMm + snowMm;

  if (main === 'thunderstorm' || mm >= 2.5) {
    return 'heavy';
  }
  if (mm >= 0.15) {
    return mm >= 1 ? 'heavy' : 'light';
  }
  if (main === 'drizzle' || main === 'rain') {
    return 'light';
  }
  return 'none';
}

function currentPrecipProbability(
  hourly: OneCallApiResponse['hourly'],
  daily: OneCallApiResponse['daily'],
): number | null {
  const fromHourly = hourly?.[0]?.pop;
  if (typeof fromHourly === 'number') {
    return fromHourly;
  }
  const fromDaily = daily?.[0]?.pop;
  if (typeof fromDaily === 'number') {
    return fromDaily;
  }
  return null;
}

export function mapOneCallToOverview(res: OneCallApiResponse): WeatherOverview {
  const { description, icon } = primaryCondition(res.current.weather);
  const precipProb = currentPrecipProbability(res.hourly, res.daily);
  const rainLevel = deriveRainLevel(res.current);
  const hasPrecipitationActive =
    rainLevel !== 'none' ||
    (typeof precipProb === 'number' && precipProb >= 0.15);

  const current: UiCurrentWeather = {
    timestampUtc: res.current.dt,
    temp: res.current.temp,
    feelsLike: res.current.feels_like,
    description,
    iconCode: icon,
    iconUrl: ICON_URL(icon),
    precipitationProbability: precipProb,
    humidityPercent: res.current.humidity,
    windSpeed: res.current.wind_speed,
    windDeg: res.current.wind_deg,
    cloudPercent: res.current.clouds,
    rainLevel,
    hasPrecipitationActive,
    uvi: res.current.uvi,
  };

  const daily: UiDailyForecast[] = (res.daily ?? []).map((d) => {
    const cond = primaryCondition(d.weather);
    return {
      dateUtc: d.dt,
      description: cond.description,
      summary: d.summary,
      iconCode: cond.icon,
      iconUrl: ICON_URL(cond.icon),
      tempMin: d.temp.min,
      tempMax: d.temp.max,
      feelsLikeDay: d.feels_like.day,
      precipitationProbability: d.pop,
      humidityPercent: d.humidity,
      windSpeed: d.wind_speed,
      uvi: d.uvi,
    };
  });

  const alerts: UiWeatherAlert[] = (res.alerts ?? []).map((a) => ({
    event: a.event,
    startUtc: a.start,
    endUtc: a.end,
    description: a.description,
    senderName: a.sender_name,
    tags: a.tags ?? [],
  }));

  return {
    coordinates: { lat: res.lat, lon: res.lon },
    timezone: res.timezone,
    current,
    daily,
    alerts,
  };
}
