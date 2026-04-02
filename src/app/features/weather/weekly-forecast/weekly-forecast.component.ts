import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
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
import { WeatherOverviewCacheService } from '../../../core/services/weather-overview-cache.service';
import { WeatherApiError } from '../../../models/weather-api-error';
import type {
  UiDailyForecast,
  WeatherOverview,
} from '../../../models/weather-ui.model';
import { WeatherWindowCardComponent } from '../weather-window-card/weather-window-card.component';

@Component({
  selector: 'app-weekly-forecast',
  standalone: true,
  imports: [CommonModule, WeatherWindowCardComponent],
  templateUrl: './weekly-forecast.component.html',
  styleUrl: './weekly-forecast.component.scss',
  host: {
    '[class.weekly-forecast--house]': `variant() === 'house'`,
  },
})
export class WeeklyForecastComponent {
  private readonly overviewCache = inject(WeatherOverviewCacheService);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly lat = input.required<number>();
  readonly lon = input.required<number>();
  /** `house`: embedded in the weather-house facade (no duplicate section title). */
  readonly variant = input<'default' | 'house'>('default');

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

  protected readonly timezone = computed(
    () => this.overview()?.timezone ?? 'UTC',
  );

  protected readonly dailySeven = computed(() =>
    (this.overview()?.daily ?? []).slice(0, 7),
  );

  protected readonly selectedDay = signal<UiDailyForecast | null>(null);

  constructor() {
    effect(() => {
      this.lat();
      this.lon();
      untracked(() => this.refreshCount.set(0));
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
              },
            }),
            catchError((err: unknown) => {
              const msg =
                err instanceof WeatherApiError
                  ? err.message
                  : 'Could not load forecast.';
              const stale = this.overviewCache.peekStale(lat, lon);
              if (stale) {
                this.overview.set(stale.data);
                this.dataNotice.set(
                  `${msg} Showing saved forecast from your last successful load.`,
                );
                this.loadError.set(null);
                return of(null);
              }
              this.overview.set(null);
              this.loadError.set(
                `${msg} Check your connection and API key in src/environments/environment.ts.`,
              );
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    effect(() => {
      const open = this.selectedDay() !== null;
      const body = this.doc.body;
      body.style.overflow = open ? 'hidden' : '';
    });

    this.destroyRef.onDestroy(() => {
      this.doc.body.style.overflow = '';
    });
  }

  protected openDayDetail(day: UiDailyForecast): void {
    this.selectedDay.set(day);
  }

  protected closeDayDetail(): void {
    this.selectedDay.set(null);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDayDetail();
    }
  }

  protected retry(): void {
    this.refreshCount.update((n) => n + 1);
  }

  protected modalPrecipPercent(day: UiDailyForecast): string {
    return `${Math.round(day.precipitationProbability * 100)}%`;
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.selectedDay()) {
      this.closeDayDetail();
    }
  }
}
