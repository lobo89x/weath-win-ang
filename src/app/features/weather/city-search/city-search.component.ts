import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FAVORITE_PLACES } from '../../../core/data/favorite-locations';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { RecentLocationSearchesService } from '../../../core/services/recent-location-searches.service';
import { WeatherAmbienceService } from '../../../core/services/weather-ambience.service';
import type { CitySearchResult } from '../../../models/weather-ui.model';
import type { SelectedLocation } from '../../../models/selected-location.model';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-city-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './city-search.component.html',
  styleUrl: './city-search.component.scss',
})
export class CitySearchComponent {
  private readonly geocoding = inject(GeocodingService);
  private readonly recentSearches = inject(RecentLocationSearchesService);
  protected readonly ambience = inject(WeatherAmbienceService);

  /** Keeps the input label in sync when the parent location changes. */
  readonly selectedLocation = input<SelectedLocation | null>(null);

  readonly locationSelected = output<SelectedLocation>();

  protected readonly favorites = FAVORITE_PLACES;
  protected readonly recent = this.recentSearches.recent;

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly suggestions = signal<CitySearchResult[]>([]);
  protected readonly suggestLoading = signal(false);
  protected readonly geolocateLoading = signal(false);
  protected readonly hint = signal<string | null>(null);

  constructor() {
    effect(() => {
      const s = this.selectedLocation();
      if (s) {
        this.searchControl.setValue(s.label, { emitEvent: false });
      }
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        map((v) => v.trim()),
        distinctUntilChanged(),
        tap(() => this.hint.set(null)),
        switchMap((q) => {
          if (!q) {
            this.suggestions.set([]);
            this.suggestLoading.set(false);
            return of<CitySearchResult[]>([]);
          }
          this.suggestLoading.set(true);
          return this.geocoding.searchCities(q, 8).pipe(
            tap((rows) => this.suggestions.set(rows)),
            catchError(() => {
              this.suggestions.set([]);
              return of<CitySearchResult[]>([]);
            }),
            finalize(() => this.suggestLoading.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected pickFavorite(place: (typeof FAVORITE_PLACES)[number]): void {
    this.hint.set(null);
    this.geocoding.searchCities(place.query, 1).subscribe({
      next: (hits) => {
        const hit = hits[0];
        if (!hit) {
          this.hint.set(`No match for ${place.display}.`);
          return;
        }
        this.applySelection({
          lat: hit.lat,
          lon: hit.lon,
          label: hit.label,
        });
      },
      error: () => {
        this.hint.set('Could not load that favorite.');
      },
    });
  }

  protected pickSuggestion(hit: CitySearchResult): void {
    this.applySelection({ lat: hit.lat, lon: hit.lon, label: hit.label });
  }

  protected pickRecent(loc: SelectedLocation): void {
    this.applySelection(loc);
  }

  protected useMyLocation(): void {
    this.hint.set(null);
    if (!globalThis.navigator?.geolocation) {
      this.hint.set('Geolocation is not supported in this browser.');
      return;
    }

    this.geolocateLoading.set(true);
    globalThis.navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.geocoding.reverseGeocode(latitude, longitude, 1).subscribe({
          next: (hits) => {
            this.geolocateLoading.set(false);
            const hit = hits[0];
            if (hit) {
              this.applySelection({
                lat: hit.lat,
                lon: hit.lon,
                label: hit.label,
              });
            } else {
              this.applySelection({
                lat: latitude,
                lon: longitude,
                label: 'My location',
              });
            }
          },
          error: () => {
            this.geolocateLoading.set(false);
            this.applySelection({
              lat: latitude,
              lon: longitude,
              label: 'My location',
            });
          },
        });
      },
      (err: GeolocationPositionError) => {
        this.geolocateLoading.set(false);
        const msg =
          err.code === 1
            ? 'Location permission denied.'
            : err.message || 'Could not get your location.';
        this.hint.set(msg);
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 },
    );
  }

  private applySelection(loc: SelectedLocation): void {
    this.recentSearches.remember(loc);
    this.searchControl.setValue(loc.label, { emitEvent: false });
    this.suggestions.set([]);
    this.locationSelected.emit(loc);
  }

  protected testCloudy(): void {
    this.ambience.setVisualTestCloudy();
  }

  protected testLightRain(): void {
    this.ambience.setVisualTestLightRain();
  }

  protected testHeavyRain(): void {
    this.ambience.setVisualTestHeavyRain();
  }

  protected testClouds75(): void {
    this.ambience.setVisualTestClouds75();
  }

  protected testClouds2(): void {
    this.ambience.setVisualTestClouds2();
  }

  protected clearVisualTest(): void {
    this.ambience.clearVisualTest();
  }
}
