import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { WeatherAmbienceService } from '../../../core/services/weather-ambience.service';

@Component({
  selector: 'app-sky-ambience-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sky-ambience-layer.component.html',
  styleUrl: './sky-ambience-layer.component.scss',
})
export class SkyAmbienceLayerComponent {
  private readonly ambience = inject(WeatherAmbienceService);

  protected readonly layerClassList = computed(() => [
    'sky-ambience',
    this.ambience.cloudDensityClass(),
  ]);

  protected readonly showRainLight = computed(
    () => this.ambience.effectiveRainLevel() === 'light',
  );

  protected readonly showRainHeavy = computed(
    () => this.ambience.effectiveRainLevel() === 'heavy',
  );
}
