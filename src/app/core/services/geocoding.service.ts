import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { GeocodingDirectItem } from '../../models/geocoding-api.model';
import { WeatherApiError } from '../../models/weather-api-error';
import type { CitySearchResult } from '../../models/weather-ui.model';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);

  readonly lastError = signal<string | null>(null);

  /** Direct geocoding — suitable for debounced typeahead (debounce in the component later). */
  searchCities(query: string, limit = 5): Observable<CitySearchResult[]> {
    const q = query.trim();
    if (!q) {
      return of([]);
    }

    this.lastError.set(null);

    const params = new HttpParams()
      .set('q', q)
      .set('limit', String(limit))
      .set('appid', environment.openWeatherApiKey);

    const url = `${environment.geocodingBaseUrl}/direct`;

    return this.http.get<GeocodingDirectItem[]>(url, { params }).pipe(
      map((items) => items.map((item) => this.toSearchResult(item))),
      catchError((err) => {
        const mapped = this.toApiError(err);
        this.lastError.set(mapped.message);
        return throwError(() => mapped);
      }),
    );
  }

  /** First match only — city name → coordinates. */
  resolveCityToCoordinates(
    query: string,
  ): Observable<{ lat: number; lon: number } | null> {
    return this.searchCities(query, 1).pipe(
      map((results) => {
        const first = results[0];
        return first ? { lat: first.lat, lon: first.lon } : null;
      }),
    );
  }

  /** Reverse geocoding — lat/lon → place (for browser geolocation). */
  reverseGeocode(
    lat: number,
    lon: number,
    limit = 1,
  ): Observable<CitySearchResult[]> {
    this.lastError.set(null);

    const params = new HttpParams()
      .set('lat', String(lat))
      .set('lon', String(lon))
      .set('limit', String(limit))
      .set('appid', environment.openWeatherApiKey);

    const url = `${environment.geocodingBaseUrl}/reverse`;

    return this.http.get<GeocodingDirectItem[]>(url, { params }).pipe(
      map((items) => items.map((item) => this.toSearchResult(item))),
      catchError((err) => {
        const mapped = this.toApiError(err);
        this.lastError.set(mapped.message);
        return throwError(() => mapped);
      }),
    );
  }

  private toSearchResult(item: GeocodingDirectItem): CitySearchResult {
    const label = [item.name, item.state, item.country].filter(Boolean).join(', ');
    return {
      name: item.name,
      state: item.state,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      label,
    };
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
        detail || 'Geocoding request failed',
        err.status ?? undefined,
      );
    }
    return new WeatherApiError('Geocoding request failed');
  }
}
