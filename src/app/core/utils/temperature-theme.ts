/**
 * Maps air temperature (°F, matching One Call `imperial`) to theme tokens.
 * Used for page background (anchor temp) and per-window surfaces (cards + modal).
 */

export interface ResolvedTemperatureTheme {
  pageBgStart: string;
  pageBgEnd: string;
  /** Three-stop “glass sky” gradient for window surfaces. */
  cardBgA: string;
  cardBgC: string;
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

/** Shared window/card/modal surface variables (avoid duplicating bindings). */
export function themeToWindowCssVars(
  theme: ResolvedTemperatureTheme,
): Record<string, string> {
  return {
    '--tw-card-bg-a': theme.cardBgA,
    '--tw-card-bg-c': theme.cardBgC,
    '--tw-card-bg-b': theme.cardBgB,
    '--tw-card-border': theme.cardBorder,
    '--tw-card-accent': theme.cardAccent,
  };
}

export function resolveTemperatureTheme(tempF: number): ResolvedTemperatureTheme {
  const extremeHot = tempF >= 98;
  const extremeCold = tempF <= 32;
  const t = tempF;

  let pageBgStart: string;
  let pageBgEnd: string;
  let cardBgA: string;
  let cardBgC: string;
  let cardBgB: string;
  let cardBorder: string;
  let cardAccent: string;

  if (t <= 32) {
    pageBgStart = '#b8dcff';
    pageBgEnd = '#6bb8ff';
    cardBgA = '#c8ecff';
    cardBgC = '#7ec8ff';
    cardBgB = '#a8dfff';
    cardBorder = 'rgba(20, 90, 180, 0.55)';
    cardAccent = '#0d4a9c';
  } else if (t <= 45) {
    pageBgStart = '#b8d6ff';
    pageBgEnd = '#7eb6f0';
    cardBgA = '#cce4ff';
    cardBgC = '#7eb8f5';
    cardBgB = '#a8d2ff';
    cardBorder = 'rgba(30, 100, 190, 0.48)';
    cardAccent = '#1356a8';
  } else if (t <= 58) {
    pageBgStart = '#c5ebe0';
    pageBgEnd = '#7dd3b8';
    cardBgA = '#dff5ec';
    cardBgC = '#6fcfaf';
    cardBgB = '#a8e6d4';
    cardBorder = 'rgba(20, 120, 95, 0.45)';
    cardAccent = '#0d6b52';
  } else if (t <= 72) {
    pageBgStart = '#c9e0fb';
    pageBgEnd = '#9dc4f2';
    cardBgA = '#e2f0ff';
    cardBgC = '#7eb6f0';
    cardBgB = '#c5ddfa';
    cardBorder = 'rgba(40, 100, 190, 0.38)';
    cardAccent = '#1a5f9a';
  } else if (t <= 82) {
    pageBgStart = '#ffe6a8';
    pageBgEnd = '#ffc14d';
    cardBgA = '#fff0c2';
    cardBgC = '#ffb84a';
    cardBgB = '#ffd978';
    cardBorder = 'rgba(200, 120, 0, 0.5)';
    cardAccent = '#a65c00';
  } else if (t <= 97) {
    pageBgStart = '#ffd2a3';
    pageBgEnd = '#ff8a3d';
    cardBgA = '#ffe0b8';
    cardBgC = '#ff9a40';
    cardBgB = '#ffc46e';
    cardBorder = 'rgba(210, 80, 20, 0.55)';
    cardAccent = '#c44a08';
  } else {
    pageBgStart = '#ffb8a0';
    pageBgEnd = '#ff5c38';
    cardBgA = '#ffc8b0';
    cardBgC = '#ff7840';
    cardBgB = '#ff9a6a';
    cardBorder = 'rgba(180, 40, 20, 0.58)';
    cardAccent = '#b02810';
  }

  return {
    pageBgStart,
    pageBgEnd,
    cardBgA,
    cardBgC,
    cardBgB,
    cardBorder,
    cardAccent,
    extremeHot,
    extremeCold,
  };
}
