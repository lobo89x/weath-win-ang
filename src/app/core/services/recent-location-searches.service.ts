import { Injectable, signal } from '@angular/core';
import type { SelectedLocation } from '../../models/selected-location.model';

const MAX_RECENT = 10;

function locationKey(loc: SelectedLocation): string {
  return `${loc.lat.toFixed(4)}:${loc.lon.toFixed(4)}`;
}

/** In-memory recent selections (session lifetime). */
@Injectable({ providedIn: 'root' })
export class RecentLocationSearchesService {
  private readonly items = signal<SelectedLocation[]>([]);

  readonly recent = this.items.asReadonly();

  remember(loc: SelectedLocation): void {
    const key = locationKey(loc);
    this.items.update((list) => {
      const filtered = list.filter((x) => locationKey(x) !== key);
      return [loc, ...filtered].slice(0, MAX_RECENT);
    });
  }
}
