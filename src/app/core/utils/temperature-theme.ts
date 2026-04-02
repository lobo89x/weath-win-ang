/**
 * Maps air temperature (°F, matching One Call `imperial`) to theme tokens.
 * Used for page background (anchor temp) and per-window-card styling (daily midpoint).
 */

export interface ResolvedTemperatureTheme {
  pageBgStart: string;
  pageBgEnd: string;
  cardBgA: string;
  cardBgB: string;
  cardBorder: string;
  cardAccent: string;
  extremeHot: boolean;
  extremeCold: boolean;
}

/** CSS custom properties applied on `document.documentElement` for the shell background. */
export const PAGE_TEMPERATURE_CSS_VARS = [
  '--weather-page-bg-start',
  '--weather-page-bg-end',
] as const;

export function resolveTemperatureTheme(tempF: number): ResolvedTemperatureTheme {
  const extremeHot = tempF >= 98;
  const extremeCold = tempF <= 32;
  const t = tempF;

  let pageBgStart: string;
  let pageBgEnd: string;
  let cardBgA: string;
  let cardBgB: string;
  let cardBorder: string;
  let cardAccent: string;

  if (t <= 32) {
    pageBgStart = '#cfe8ff';
    pageBgEnd = '#9fd6ff';
    cardBgA = '#d9efff';
    cardBgB = '#bfe0ff';
    cardBorder = 'rgba(30, 120, 200, 0.35)';
    cardAccent = '#1e6bc7';
  } else if (t <= 45) {
    pageBgStart = '#d6e9ff';
    pageBgEnd = '#c5dff8';
    cardBgA = '#e4f0fb';
    cardBgB = '#d2e7f7';
    cardBorder = 'rgba(70, 130, 200, 0.28)';
    cardAccent = '#2a6fb5';
  } else if (t <= 58) {
    pageBgStart = '#dceee9';
    pageBgEnd = '#d0e8e0';
    cardBgA = '#e8f4ef';
    cardBgB = '#dceee6';
    cardBorder = 'rgba(60, 140, 110, 0.25)';
    cardAccent = '#2d7a62';
  } else if (t <= 72) {
    pageBgStart = '#e3eef8';
    pageBgEnd = '#eef4fb';
    cardBgA = '#eef4fb';
    cardBgB = '#f6f9fd';
    cardBorder = 'rgba(80, 120, 180, 0.2)';
    cardAccent = '#3b6ea5';
  } else if (t <= 82) {
    pageBgStart = '#fff3d6';
    pageBgEnd = '#ffe9b8';
    cardBgA = '#fff6e0';
    cardBgB = '#ffefcc';
    cardBorder = 'rgba(210, 150, 40, 0.35)';
    cardAccent = '#c97800';
  } else if (t <= 97) {
    pageBgStart = '#ffe4cc';
    pageBgEnd = '#ffd0a6';
    cardBgA = '#ffe8d4';
    cardBgB = '#ffd9b8';
    cardBorder = 'rgba(220, 110, 40, 0.4)';
    cardAccent = '#d45a12';
  } else {
    pageBgStart = '#ffd0c2';
    pageBgEnd = '#ffb09a';
    cardBgA = '#ffd4c8';
    cardBgB = '#ffb8a4';
    cardBorder = 'rgba(200, 60, 40, 0.45)';
    cardAccent = '#c63d28';
  }

  return {
    pageBgStart,
    pageBgEnd,
    cardBgA,
    cardBgB,
    cardBorder,
    cardAccent,
    extremeHot,
    extremeCold,
  };
}
