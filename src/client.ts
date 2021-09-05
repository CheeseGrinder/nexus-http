import { HttpMethod } from './method.enum';
import { HttpRequest } from './request';
import { HttpInterceptor } from './types';

type HttpQueryParamValue = string | number | bigint | boolean;
export type HttpQueryParam = Record<string, HttpQueryParamValue> | { [key: string]: HttpQueryParamValue };

interface CreateOptions {
  baseUrl?: string;
  isDebugEnabled?: boolean;
}

interface PrepareOptions {
  url: string;
  method: HttpMethod;
}

export class NexusClient {
  static create(options: CreateOptions = {} as CreateOptions): NexusClient {
    const client = new NexusClient();
    client.baseUrl = options.baseUrl ?? '';
    client.isDebugEnabled = options.isDebugEnabled ?? false;

    return client;
  }

  static copy(other: NexusClient): NexusClient {
    const client = new NexusClient();
    client.baseUrl = other.baseUrl;
    client.isDebugEnabled = other.isDebugEnabled;

    return client;
  }

  protected baseUrl: string;
  protected isDebugEnabled = false;
  protected interceptors: HttpInterceptor[] = [];

  get<T>(url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.makeRequest<T>(HttpMethod.GET, url, query);
  }

  post<T>(url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.makeRequest<T>(HttpMethod.POST, url, query);
  }

  put<T>(url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.makeRequest<T>(HttpMethod.PUT, url, query);
  }

  patch<T>(url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.makeRequest<T>(HttpMethod.PATCH, url, query);
  }

  delete<T>(url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.makeRequest<T>(HttpMethod.DELETE, url, query);
  }

  head<T>(url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.makeRequest<T>(HttpMethod.HEAD, url, query);
  }

  options<T>(url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.makeRequest<T>(HttpMethod.OPTIONS, url, query);
  }

  trace<T>(url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.makeRequest<T>(HttpMethod.TRACE, url, query);
  }

  makeRequest<T>(method: HttpMethod, url: string, query?: HttpQueryParam): HttpRequest<T> {
    return this.prepare({
      url: this.buildUrlWithQuery(url, query),
      method: method,
    });
  }

  addGlobalInterceptor(...interceptors: HttpInterceptor[]): ThisType<this> {
    this.interceptors.push(...interceptors);
    return this;
  }

  private buildUrlWithQuery(url: string, query: HttpQueryParam = {}): string {
    if (Object.keys(query).length === 0) return this.formatUrl(url);

    const queryParam = Object.entries(query)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    const urlHasParam = url.indexOf('?') !== -1;
    const urlEndWithMark = url.indexOf('?') === url.length - 1;

    if (urlHasParam && urlEndWithMark) return this.formatUrl(url + queryParam);
    if (urlHasParam && !urlEndWithMark) return this.formatUrl(`${url}&${queryParam}`);
    if (!urlHasParam) return this.formatUrl(`${url}?${queryParam}`);
  }

  private formatUrl(url: string): string {
    const { baseUrl } = this;
    if (!baseUrl) return url;

    const urlStartWithSlash = url.indexOf('/') === 0;
    const baseEndWithSlashIndex = baseUrl.lastIndexOf('/') === baseUrl.length - 1;

    if (baseEndWithSlashIndex && urlStartWithSlash) return `${baseUrl}${url.slice(1)}`;
    if (!baseEndWithSlashIndex && urlStartWithSlash) return baseUrl + url;
    if (baseEndWithSlashIndex && !urlStartWithSlash) return baseUrl + url;
    if (!baseEndWithSlashIndex && !urlStartWithSlash) return `${baseUrl}/${url}`;
  }

  private prepare<T>(options: PrepareOptions): HttpRequest<T> {
    const interceptors = this.interceptors.filter(i => i.allowedMethod.includes(options.method));

    return new HttpRequest<T>({
      ...options,
      isDebugEnabled: this.isDebugEnabled,
      responseType: 'json',
      interceptors: interceptors,
    });
  }
}
