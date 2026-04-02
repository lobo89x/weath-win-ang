# Weather House (Angular)

Mobile-first weather UI built with **Angular 21** (standalone components), **Bootstrap 5**, and the **OpenWeather One Call API 3.0** plus **Geocoding API**. It shows current conditions, a seven-day outlook in a “house windows” layout, city search with favorites, browser geolocation, and temperature-based theming.

## Prerequisites

- **Node.js** (LTS recommended) and **npm**
- An **OpenWeather** account with API access to **One Call API 3.0** and **Geocoding**

## Setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. **Add your API key** (do not commit real keys):

   Open `src/environments/environment.ts` (and `environment.production.ts` for production builds). Replace the placeholder:

   ```ts
   openWeatherApiKey: 'YOUR_OPENWEATHER_API_KEY',
   ```

   with your key, or inject the value at build time via your CI/CD pipeline and keep secrets out of git.

3. Start the dev server:

   ```bash
   npm start
   ```

   The app is served at `http://localhost:4200/`.

## Scripts

| Command       | Description                    |
| ------------- | ------------------------------ |
| `npm start`   | Dev server (`ng serve`)        |
| `npm run build` | Production build (`ng build`) |
| `npm test`    | Unit tests (Vitest)            |

## How data is loaded

- **Single shared cache** (`WeatherOverviewCacheService`) deduplicates **One Call** requests for the same coordinates and reuses responses for **10 minutes** (in-memory, per session).
- **Concurrent requests** for the same `lat`/`lon` share one in-flight HTTP call.
- On failure, the UI can fall back to the **last successful** overview for that location with a clear notice.
- **Last updated** (footer under the house) reflects the cache timestamp for the active location.

## Project layout (high level)

- `src/app/core` — HTTP services, mappers, utilities, weather overview cache
- `src/app/features/weather` — city search, current weather, weekly forecast, weather page shell
- `src/app/models` — TypeScript models / UI types
- `src/environments` — API base URLs and `openWeatherApiKey`

## Capacitor / Android packaging (notes)

This repo is a standard **Angular** web app. To ship it on Android with **Capacitor**:

1. Build the web assets:

   ```bash
   npm run build
   ```

2. In the project root (once), add Capacitor core and the Android platform (versions per [Capacitor docs](https://capacitorjs.com/docs)):

   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init
   ```

   Point Capacitor’s `webDir` at Angular’s output folder (e.g. `dist/weath-win-ang/browser` — confirm the exact path in `angular.json` for your project name).

3. Add the Android platform and sync:

   ```bash
   npx cap add android
   npx cap sync
   ```

4. Open Android Studio:

   ```bash
   npx cap open android
   ```

5. **Geolocation**: ensure `AndroidManifest.xml` includes fine/coarse location permissions if you use **Use my location**. On recent Android versions you must request runtime permission from the WebView / native layer; Capacitor’s **Geolocation** plugin is the usual approach for reliable prompts.

6. **Cleartext / HTTPS**: production APIs use **HTTPS**. Avoid cleartext HTTP in release builds.

7. **API keys**: do not embed production keys in the client if you need to hide them; prefer a small backend or build-time secrets policy. For local/dev, `environment.ts` is fine.

## Additional resources

- [Angular documentation](https://angular.dev)
- [OpenWeather One Call 3.0](https://openweathermap.org/api/one-call-3)
- [OpenWeather Geocoding](https://openweathermap.org/api/geocoding-api)
