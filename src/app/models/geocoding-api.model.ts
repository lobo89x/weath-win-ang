/** OpenWeather Geocoding API 1.0 — direct geocoding item. */

export interface GeocodingDirectItem {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
