import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import {
  resolveTemperatureTheme,
  themeToWindowCssVars,
} from '../../../core/utils/temperature-theme';
import type { UiDailyForecast } from '../../../models/weather-ui.model';

@Component({
  selector: 'app-weather-window-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-window-card.component.html',
  styleUrl: './weather-window-card.component.scss',
})
export class WeatherWindowCardComponent {
  readonly day = input.required<UiDailyForecast>();
  /** IANA zone from One Call (e.g. `America/New_York`) for calendar date labels. */
  readonly timezone = input<string>('UTC');

  /** Thicker frame + mullions when embedded in the house facade. */
  readonly houseWindow = input(false, { transform: booleanAttribute });

  readonly feelsLikeClick = output<void>();

  protected readonly themeForDay = computed(() => {
    const d = this.day();
    const mid = (d.tempMin + d.tempMax) / 2;
    return resolveTemperatureTheme(mid);
  });

  protected readonly cardSurfaceStyle = computed(() =>
    themeToWindowCssVars(this.themeForDay()),
  );

  protected openFeelsLike(): void {
    this.feelsLikeClick.emit();
  }
}
