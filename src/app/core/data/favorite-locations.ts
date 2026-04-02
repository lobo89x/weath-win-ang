/** Pinned quick picks — resolved via direct geocoding with `query`. */
export interface FavoritePlace {
  readonly query: string;
  readonly display: string;
}

export const FAVORITE_PLACES: readonly FavoritePlace[] = [
  { query: 'Atlanta, GA, US', display: 'Atlanta, GA' },
  { query: 'Lawrenceville, GA, US', display: 'Lawrenceville, GA' },
  { query: 'Houston, TX, US', display: 'Houston, TX' },
  { query: 'Monrovia, Liberia', display: 'Monrovia, Liberia' },
  { query: 'New Orleans, LA, US', display: 'New Orleans, LA' },
] as const;
