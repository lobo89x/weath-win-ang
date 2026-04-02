import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import {
  PAGE_TEMPERATURE_CSS_VARS,
  resolveTemperatureTheme,
} from '../utils/temperature-theme';

const BODY_HOT = 'weather-extreme-hot';
const BODY_COLD = 'weather-extreme-cold';

/** Applies page-level CSS variables + body classes from a single anchor temperature (°F). */
@Injectable({ providedIn: 'root' })
export class TemperatureThemeService {
  private readonly doc = inject(DOCUMENT);

  private readonly anchorTempF = signal<number | null>(null);

  constructor() {
    effect(() => {
      const t = this.anchorTempF();
      const root = this.doc.documentElement;
      const body = this.doc.body;

      body.classList.remove(BODY_HOT, BODY_COLD);

      if (t === null) {
        for (const name of PAGE_TEMPERATURE_CSS_VARS) {
          root.style.removeProperty(name);
        }
        return;
      }

      const theme = resolveTemperatureTheme(t);
      root.style.setProperty(
        '--weather-page-bg-start',
        theme.pageBgStart,
      );
      root.style.setProperty('--weather-page-bg-end', theme.pageBgEnd);

      if (theme.extremeHot) {
        body.classList.add(BODY_HOT);
      }
      if (theme.extremeCold) {
        body.classList.add(BODY_COLD);
      }
    });
  }

  /** Drive the shell background from current conditions (e.g. `overview.current.temp`). */
  setPageAnchorTemp(tempFahrenheit: number | null): void {
    this.anchorTempF.set(tempFahrenheit);
  }
}
