import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { GeocodingService } from './core/services/geocoding.service';
import { WeatherService } from './core/services/weather.service';
import type { UiDailyForecast, WeatherOverview } from './models/weather-ui.model';

function mockDaily(i: number): UiDailyForecast {
  return {
    dateUtc: 1_700_000_000 + i * 86_400,
    description: 'clear sky',
    summary: 'Clear conditions.',
    iconCode: '01d',
    iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    tempMin: 58 + i,
    tempMax: 72 + i,
    feelsLikeDay: 70 + i,
    precipitationProbability: 0.1 + i * 0.02,
    humidityPercent: 50 + i,
    windSpeed: 5 + i,
    uvi: 4 + i * 0.1,
  };
}

const mockOverview: WeatherOverview = {
  coordinates: { lat: 33.749, lon: -84.388 },
  timezone: 'America/New_York',
  current: {
    timestampUtc: 1_700_000_000,
    temp: 72,
    feelsLike: 70,
    description: 'clear sky',
    iconCode: '01d',
    iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    precipitationProbability: 0.1,
    humidityPercent: 55,
    windSpeed: 6,
    windDeg: 200,
    cloudPercent: 10,
    uvi: 4,
  },
  daily: Array.from({ length: 8 }, (_, i) => mockDaily(i)),
  alerts: [],
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getWeatherOverview: () => of(mockOverview),
            loading: signal(false),
            lastError: signal(null),
          },
        },
        {
          provide: GeocodingService,
          useValue: {
            searchCities: () => of([]),
            reverseGeocode: () => of([]),
            resolveCityToCoordinates: () => of(null),
            lastError: signal(null),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render header brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Weather');
  });
});
