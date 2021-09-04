import { HttpQueryParam } from 'client';

export interface ClientTest {
  buildUrlWithQuery: (url: string, query?: HttpQueryParam) => string;

  formatUrl: (url: string) => string;
}
