import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { WeatherOverviewCacheService } from '../../../core/services/weather-overview-cache.service';
import { CurrentWeatherComponent } from '../current-weather/current-weather.component';
import { WeeklyForecastComponent } from '../weekly-forecast/weekly-forecast.component';

@Component({
  selector: 'app-weather-page',
  standalone: true,
  imports: [CommonModule, CurrentWeatherComponent, WeeklyForecastComponent],
  templateUrl: './weather-page.component.html',
  styleUrl: './weather-page.component.scss',
})
export class WeatherPageComponent {
  private readonly overviewCache = inject(WeatherOverviewCacheService);

  readonly lat = input.required<number>();
  readonly lon = input.required<number>();

  protected readonly lastUpdatedAt = computed(() =>
    this.overviewCache.fetchedAtFor(this.lat(), this.lon()),
  );
}
