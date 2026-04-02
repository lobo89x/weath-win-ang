import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    if (!environment.production) {
      void import('./app/core/dev/weather-api-smoke').then((m) =>
        m.runWeatherApiSmokeTest(appRef.injector),
      );
    }
  })
  .catch((err) => console.error(err));
