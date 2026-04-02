import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, tap } from 'rxjs';
import type { WeatherOverview } from '../../models/weather-ui.model';
import { WeatherService } from './weather.service';

const TTL_MS = 10 * 60 * 1000;
const MAX_KEYS = 24;

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

export interface WeatherOverviewCacheEntry {
  data: WeatherOverview;
  fetchedAt: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherOverviewCacheService {
  private readonly weather = inject(WeatherService);

  private readonly entries = new Map<string, WeatherOverviewCacheEntry>();
  private readonly inFlight = new Map<string, Observable<WeatherOverview>>();
  private readonly version = signal(0);

  /**
   * One Call overview with TTL + in-flight deduplication (shared request per lat/lon).
   * @param bypassCache Force a new network request and refresh the entry.
   */
  fetch(
    lat: number,
    lon: number,
    options?: { bypassCache?: boolean },
  ): Observable<WeatherOverview> {
    const key = cacheKey(lat, lon);

    if (!options?.bypassCache) {
      const hit = this.entries.get(key);
      if (hit && Date.now() - hit.fetchedAt < TTL_MS) {
        return of(hit.data);
      }
      const pending = this.inFlight.get(key);
      if (pending) {
        return pending;
      }
    } else {
      this.entries.delete(key);
      this.inFlight.delete(key);
    }

    const shared$ = this.weather.getWeatherOverview(lat, lon).pipe(
      tap((data) => {
        this.setEntry(key, { data, fetchedAt: Date.now() });
      }),
      catchError((err) => {
        this.inFlight.delete(key);
        return throwError(() => err);
      }),
      finalize(() => {
        this.inFlight.delete(key);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.inFlight.set(key, shared$);
    return shared$;
  }

  fetchedAtFor(lat: number, lon: number): number | null {
    this.version();
    return this.entries.get(cacheKey(lat, lon))?.fetchedAt ?? null;
  }

  /** Last successful payload for this key, ignoring TTL (for error fallback UI). */
  peekStale(lat: number, lon: number): WeatherOverviewCacheEntry | null {
    this.version();
    return this.entries.get(cacheKey(lat, lon)) ?? null;
  }

  private setEntry(key: string, entry: WeatherOverviewCacheEntry): void {
    if (this.entries.size >= MAX_KEYS && !this.entries.has(key)) {
      const first = this.entries.keys().next().value as string | undefined;
      if (first) {
        this.entries.delete(first);
      }
    }
    this.entries.set(key, entry);
    this.version.update((v) => v + 1);
  }
}
