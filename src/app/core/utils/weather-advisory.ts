import type { UiCurrentWeather } from '../../models/weather-ui.model';

/**
 * Heuristic advisory when there are no official NWS-style alerts in the API response.
 * Assumes `current.temp` / `feelsLike` match the units used by One Call (`imperial` = °F).
 */
export function getFallbackWeatherAdvisory(current: UiCurrentWeather): string | null {
  const t = current.temp;
  const feels = current.feelsLike;

  if (t >= 98) {
    return 'Extreme heat: limit time outside, stay hydrated, and check on vulnerable neighbors.';
  }
  if (t >= 90) {
    return 'Hot conditions: drink water, take shade breaks, and watch for heat exhaustion.';
  }
  if (t <= 32) {
    return 'Freezing temperatures: dress in layers and use caution on roads and walkways.';
  }
  if (feels <= 32 && t > 32) {
    return 'It may feel at or below freezing; cover exposed skin and limit prolonged exposure.';
  }
  if (current.uvi >= 8) {
    return 'Very high UV — use sunscreen, a hat, and shade during midday hours.';
  }
  return null;
}
