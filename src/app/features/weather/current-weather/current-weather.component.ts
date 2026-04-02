import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
} from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, finalize, of, switchMap, tap } from 'rxjs';
import { TemperatureThemeService } from '../../../core/services/temperature-theme.service';
import { WeatherAmbienceService } from '../../../core/services/weather-ambience.service';
import { WeatherOverviewCacheService } from '../../../core/services/weather-overview-cache.service';
import { getFallbackWeatherAdvisory } from '../../../core/utils/weather-advisory';
import { WeatherApiError } from '../../../models/weather-api-error';
import type { WeatherOverview } from '../../../models/weather-ui.model';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-weather.component.html',
  styleUrl: './current-weather.component.scss',
})
export class CurrentWeatherComponent {
  private readonly overviewCache = inject(WeatherOverviewCacheService);
  private readonly temperatureTheme = inject(TemperatureThemeService);
  protected readonly ambience = inject(WeatherAmbienceService);

  /** Location to load (parent supplies until city search exists). */
  readonly lat = input.required<number>();
  readonly lon = input.required<number>();

  protected readonly overview = signal<WeatherOverview | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly dataNotice = signal<string | null>(null);
  protected readonly loading = signal(false);

  private readonly refreshCount = signal(0);

  private readonly requestKey = computed(() => ({
    lat: this.lat(),
    lon: this.lon(),
    refresh: this.refreshCount(),
  }));

  protected readonly officialAlerts = computed(
    () => this.overview()?.alerts ?? [],
  );

  protected readonly fallbackAdvisory = computed(() => {
    const o = this.overview();
    if (!o || o.alerts.length > 0) {
      return null;
    }
    return getFallbackWeatherAdvisory(o.current);
  });

  protected readonly precipPercentLabel = computed(() => {
    const p = this.overview()?.current.precipitationProbability;
    if (p === null || p === undefined) {
      return '—';
    }
    return `${Math.round(p * 100)}%`;
  });

  constructor() {
    effect(() => {
      this.lat();
      this.lon();
      untracked(() => this.refreshCount.set(0));
    });

    effect(() => {
      const o = this.overview();
      const active = this.ambience.visualTestActive();
      const vt = this.ambience.visualTest();
      if (active && vt) {
        this.temperatureTheme.setPageAnchorTemp(vt.anchorTempF);
      } else {
        this.temperatureTheme.setPageAnchorTemp(o?.current.temp ?? null);
      }
    });

    toObservable(this.requestKey)
      .pipe(
        distinctUntilChanged(
          (a, b) =>
            a.lat === b.lat && a.lon === b.lon && a.refresh === b.refresh,
        ),
        tap(() => {
          this.loadError.set(null);
          this.dataNotice.set(null);
          this.loading.set(true);
        }),
        switchMap(({ lat, lon, refresh }) =>
          this.overviewCache.fetch(lat, lon, { bypassCache: refresh > 0 }).pipe(
            tap({
              next: (data) => {
                this.overview.set(data);
                this.dataNotice.set(null);
                this.ambience.applyLiveFromCurrent(data.current);
              },
            }),
            catchError((err: unknown) => {
              const msg =
                err instanceof WeatherApiError
                  ? err.message
                  : 'Could not load weather.';
              const stale = this.overviewCache.peekStale(lat, lon);
              if (stale) {
                this.overview.set(stale.data);
                this.ambience.applyLiveFromCurrent(stale.data.current);
                this.dataNotice.set(
                  `${msg} Showing saved conditions from your last successful load. Try again, or check your API key in src/environments/environment.ts.`,
                );
                this.loadError.set(null);
                return of(null);
              }
              this.overview.set(null);
              this.loadError.set(
                `${msg} Check your connection and OpenWeather API key in src/environments/environment.ts.`,
              );
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected retry(): void {
    this.refreshCount.update((n) => n + 1);
  }
}
