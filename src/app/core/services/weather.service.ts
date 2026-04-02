import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { mapOneCallToOverview } from '../mappers/weather.mapper';
import type { OneCallApiResponse } from '../../models/one-call-api.model';
import { WeatherApiError } from '../../models/weather-api-error';
import type { WeatherOverview } from '../../models/weather-ui.model';

export type WeatherUnits = 'imperial' | 'metric' | 'standard';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  /** True while a One Call request is in flight. */
  readonly loading = signal(false);
  readonly lastError = signal<string | null>(null);

  /**
   * Current conditions + daily forecast + alerts (One Call 3.0).
   * Excludes `minutely` only; keeps `hourly` for a better “now” precipitation probability.
   */
  getWeatherOverview(
    lat: number,
    lon: number,
    units: WeatherUnits = 'imperial',
  ): Observable<WeatherOverview> {
    this.lastError.set(null);
    this.loading.set(true);

    const params = new HttpParams()
      .set('lat', String(lat))
      .set('lon', String(lon))
      .set('appid', environment.openWeatherApiKey)
      .set('units', units)
      .set('exclude', 'minutely');

    const url = `${environment.oneCallBaseUrl}/onecall`;

    return this.http.get<OneCallApiResponse>(url, { params }).pipe(
      map(mapOneCallToOverview),
      catchError((err) => {
        const mapped = this.toApiError(err);
        this.lastError.set(mapped.message);
        return throwError(() => mapped);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  private toApiError(err: unknown): WeatherApiError {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string } | string | null | undefined;
      const detail =
        typeof body === 'object' && body && 'message' in body && body.message
          ? String(body.message)
          : typeof body === 'string'
            ? body
            : err.message;
      return new WeatherApiError(
        detail || 'Weather request failed',
        err.status ?? undefined,
      );
    }
    return new WeatherApiError('Weather request failed');
  }
}
