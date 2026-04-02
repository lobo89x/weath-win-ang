import { Component, signal } from '@angular/core';
import { CitySearchComponent } from './features/weather/city-search/city-search.component';
import { SkyAmbienceLayerComponent } from './features/weather/sky-ambience-layer/sky-ambience-layer.component';
import { WeatherPageComponent } from './features/weather/weather-page/weather-page.component';
import type { SelectedLocation } from './models/selected-location.model';

@Component({
  selector: 'app-root',
  imports: [CitySearchComponent, SkyAmbienceLayerComponent, WeatherPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Weather');

  protected readonly location = signal<SelectedLocation>({
    lat: 33.749,
    lon: -84.388,
    label: 'Atlanta, GA',
  });

  protected onLocationSelected(loc: SelectedLocation): void {
    this.location.set(loc);
  }
}
