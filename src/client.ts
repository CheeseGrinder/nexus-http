import { HttpMethod } from './method.enum';
import { HttpRequest } from './request';


type HttpQueryParamValue = string | number | bigint | boolean;
type HttpQueryParam = Record<string, HttpQueryParamValue> | { [key: string]: HttpQueryParamValue };

interface CreateOptions {
  baseUrl: string;
  enableDebug: boolean;
}

interface PrepareOptions {
  url: string;
  method: HttpMethod;
}

export class NexusClient {

  static create(options: CreateOptions = {} as CreateOptions): NexusClient {
    const client = new NexusClient();
    client.baseUrl = options.baseUrl ?? '';
    client.enableDebug = options.enableDebug ?? false;

    return client;
  }

  static copy(other: NexusClient): NexusClient {
    const client = new NexusClient();
    client.baseUrl = other.baseUrl;
    client.enableDebug = other.enableDebug;

    return client;
  }

  protected baseUrl: string;
  protected enableDebug: boolean = false;

  get<T>(url: string, query: HttpQueryParam = {}): HttpRequest<T> {
    return this.prepare<T>({
      url: this.buildUrlWithParams(url, query),
      method: HttpMethod.GET
    });
  }

  post<T>(url: string, query: HttpQueryParam = {}): HttpRequest<T> {
    return this.prepare<T>({
      url: this.buildUrlWithParams(url, query),
      method: HttpMethod.POST
    });
  }

  put<T>(url: string, query: HttpQueryParam = {}): HttpRequest<T> {
    return this.prepare<T>({
      url: this.buildUrlWithParams(url, query),
      method: HttpMethod.PUT
    });
  }

  patch<T>(url: string, query: HttpQueryParam = {}): HttpRequest<T> {
    return this.prepare<T>({
      url: this.buildUrlWithParams(url, query),
      method: HttpMethod.PATCH
    });
  }

  delete<T>(url: string, query: HttpQueryParam = {}): HttpRequest<T> {
    return this.prepare<T>({
      url: this.buildUrlWithParams(url, query),
      method: HttpMethod.DELETE
    });
  }

  head<T>(url: string, query: HttpQueryParam = {}): HttpRequest<T> {
    return this.prepare<T>({
      url: this.buildUrlWithParams(url, query),
      method: HttpMethod.HEAD
    });
  }

  options<T>(url: string, query: HttpQueryParam = {}): HttpRequest<T> {
    return this.prepare<T>({
      url: this.buildUrlWithParams(url, query),
      method: HttpMethod.OPTIONS
    });
  }

  trace<T>(url: string, query: HttpQueryParam = {}): HttpRequest<T> {
    return this.prepare<T>({
      url: this.buildUrlWithParams(url, query),
      method: HttpMethod.TRACE
    });
  }

  private buildUrlWithParams(url: string, query: HttpQueryParam): string {
    const hasParam = url.indexOf('?') !== -1;
    if (!hasParam) return this.formatUrl(url);

    const queryParam = Object.entries(query)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    if (url.endsWith('?')) return this.formatUrl(url + queryParam);
    return this.formatUrl(`${url}?${queryParam}`);
  }

  private formatUrl(url: string): string {
    const baseUrl = this.baseUrl;
    if (!baseUrl) return url;

    const slashIndex = url.indexOf('/');
    return (slashIndex === 0) ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  private prepare<T>(options: PrepareOptions): HttpRequest<T> {
    return new HttpRequest<T>({
      ...options,
      enableDebug: this.enableDebug,
      responseType: 'json',
    });
  }
}
