import { computed, Injectable, signal } from '@angular/core';
import type {
  RainIntensityLevel,
  UiCurrentWeather,
} from '../../models/weather-ui.model';

export interface VisualWeatherTestPreset {
  readonly cloudPercent: number;
  readonly rainLevel: RainIntensityLevel;
  readonly anchorTempF: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherAmbienceService {
  private readonly lastLive = signal<{
    cloudPercent: number;
    rainLevel: RainIntensityLevel;
    temp: number;
  } | null>(null);

  readonly visualTestActive = signal(false);
  readonly visualTest = signal<VisualWeatherTestPreset | null>(null);

  /** Called when live One Call data arrives (skipped while a visual test is active). */
  applyLiveFromCurrent(current: UiCurrentWeather): void {
    if (this.visualTestActive()) {
      return;
    }
    this.lastLive.set({
      cloudPercent: current.cloudPercent,
      rainLevel: current.rainLevel,
      temp: current.temp,
    });
  }

  readonly effectiveCloudPercent = computed(() => {
    const v = this.visualTest();
    if (this.visualTestActive() && v) {
      return v.cloudPercent;
    }
    return this.lastLive()?.cloudPercent ?? 0;
  });

  readonly effectiveRainLevel = computed((): RainIntensityLevel => {
    const v = this.visualTest();
    if (this.visualTestActive() && v) {
      return v.rainLevel;
    }
    return this.lastLive()?.rainLevel ?? 'none';
  });

  /** Page / window anchor temperature while visual test overrides theme. */
  readonly effectiveAnchorTempF = computed((): number | null => {
    const v = this.visualTest();
    if (this.visualTestActive() && v) {
      return v.anchorTempF;
    }
    return this.lastLive()?.temp ?? null;
  });

  readonly cloudDensityClass = computed(() =>
    cloudDensityClassFromPercent(this.effectiveCloudPercent()),
  );

  setVisualTestCloudy(): void {
    this.visualTest.set({
      cloudPercent: 92,
      rainLevel: 'none',
      anchorTempF: 68,
    });
    this.visualTestActive.set(true);
  }

  setVisualTestLightRain(): void {
    this.visualTest.set({
      cloudPercent: 55,
      rainLevel: 'light',
      anchorTempF: 62,
    });
    this.visualTestActive.set(true);
  }

  setVisualTestHeavyRain(): void {
    this.visualTest.set({
      cloudPercent: 96,
      rainLevel: 'heavy',
      anchorTempF: 58,
    });
    this.visualTestActive.set(true);
  }

  setVisualTestClouds75(): void {
    this.visualTest.set({
      cloudPercent: 75,
      rainLevel: 'none',
      anchorTempF: 70,
    });
    this.visualTestActive.set(true);
  }

  setVisualTestClouds2(): void {
    this.visualTest.set({
      cloudPercent: 2,
      rainLevel: 'none',
      anchorTempF: 74,
    });
    this.visualTestActive.set(true);
  }

  clearVisualTest(): void {
    this.visualTestActive.set(false);
    this.visualTest.set(null);
  }
}

/** 0–10 clear … 86–100 overcast */
export function cloudDensityClassFromPercent(p: number): string {
  if (p <= 10) {
    return 'sky-ambience--clouds-clear';
  }
  if (p <= 35) {
    return 'sky-ambience--clouds-sparse';
  }
  if (p <= 65) {
    return 'sky-ambience--clouds-moderate';
  }
  if (p <= 85) {
    return 'sky-ambience--clouds-heavy';
  }
  return 'sky-ambience--clouds-overcast';
}
