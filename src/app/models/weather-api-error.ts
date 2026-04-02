export class WeatherApiError extends Error {
  override readonly name = 'WeatherApiError';

  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}
