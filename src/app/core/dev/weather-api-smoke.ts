import type { Injector } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeocodingService } from '../services/geocoding.service';
import { WeatherService } from '../services/weather.service';

/**
 * Dev-only: geocode + One Call, then log a mapped `WeatherOverview`.
 * Skips if the API key placeholder is still set.
 */
export async function runWeatherApiSmokeTest(injector: Injector): Promise<void> {
  if (environment.openWeatherApiKey === 'YOUR_OPENWEATHER_API_KEY') {
    console.warn(
      '[weather-api-smoke] Skipped: set `openWeatherApiKey` in src/environments/environment.ts',
    );
    return;
  }

  const geo = injector.get(GeocodingService);
  const weather = injector.get(WeatherService);

  try {
    const cities = await firstValueFrom(geo.searchCities('Atlanta, GA', 1));
    console.log('[weather-api-smoke] Geocoding (first hit):', cities[0] ?? null);

    const hit = cities[0];
    if (!hit) {
      console.warn('[weather-api-smoke] No geocoding results for sample query.');
      return;
    }

    const overview = await firstValueFrom(
      weather.getWeatherOverview(hit.lat, hit.lon),
    );
    console.log('[weather-api-smoke] Mapped WeatherOverview:', overview);
  } catch (e) {
    console.error('[weather-api-smoke] Failed:', e);
  }
}
