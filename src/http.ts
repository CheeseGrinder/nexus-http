import { Client, FetchClient, XmlClient } from './client';
import type { Interceptor } from './interceptors/interceptor';
import type { Activator, Constructor, HttpOptions, RequestBody, RequestOptions, HttpResponse } from './types';
import { ResponseType } from './types';

interface NexusHttpInit {
  client?: Client | Constructor<Client>;
  baseUrl?: string | URL;
  interceptors?: Interceptor[];
  defaultResponseType?: ResponseType;
}

export class NexusHttp {
  private client: Client;
  private baseUrl?: string;
  private interceptors: Interceptor[] = [];
  private defaultResponseType?: ResponseType;

  constructor(init?: NexusHttpInit) {
    init ||= {};
    init.baseUrl && this.setBaseUrl(init.baseUrl);
    init.interceptors && this.addGlobalIntercaptors(...init.interceptors);
    init.defaultResponseType && this.setDefaultResponseType(init.defaultResponseType);

    if (init.client) {
      this.useClient(init.client);
    } else if ('fetch' in window) {
      this.useClient(FetchClient);
    } else {
      this.useClient(XmlClient);
    }
  }

  /**
   * Makes an GET request.
   * @param {string} url The request URL.
   * @param options The request options.
   * @returns A promise resolving to the response.
   */
  get<T = unknown>(url: string, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request({
      url: url,
      method: 'GET',
      ...options
    });
  }

  /**
   * Makes an POST request.
   * @param {string} url The request URL.
   * @param options The request options.
   * @returns A promise resolving to the response.
   */
  post<T = unknown>(url: string, options?: HttpOptions & RequestBody): Promise<HttpResponse<T>> {
    return this.request({
      url: url,
      method: 'POST',
      ...options
    });
  }

  /**
   * Makes an PATCH request.
   * @param {string} url The request URL.
   * @param options The request options.
   * @returns A promise resolving to the response.
   */
  patch<T = unknown>(url: string, options?: HttpOptions & RequestBody): Promise<HttpResponse<T>> {
    return this.request({
      url: url,
      method: 'PATCH',
      ...options
    });
  }

  /**
   * Makes an PUT request.
   * @param {string} url The request URL.
   * @param options The request options.
   * @returns A promise resolving to the response.
   */
  put<T = unknown>(url: string, options?: HttpOptions & RequestBody): Promise<HttpResponse<T>> {
    return this.request({
      url: url,
      method: 'PUT',
      ...options
    });
  }

  /**
   * Makes an DELETE request.
   * @param {string} url The request URL.
   * @param options The request options.
   * @returns A promise resolving to the response.
   */
  delete<T = unknown>(url: string, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request({
      url: url,
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Makes an HTTP request.
   * @param options The request options.
   * @returns A promise resolving to the response.
   */
  async request<T = unknown>(options: RequestOptions): Promise<HttpResponse<T>> {
    options.timeout ??= null;
    options.interceptors ??= [];
    options.responseType ??= this.defaultResponseType ?? ResponseType.NONE;

    const client: Client = Object.assign(Object.create(Object.getPrototypeOf(this.client)), this.client);
    let requestUrl: URL;

    if (this.baseUrl) {
      if (options.url.startsWith('/')) options.url = options.url.slice(1);

      requestUrl = new URL(this.baseUrl);
      if (this.baseUrl.endsWith('/')) {
        requestUrl.pathname += options.url;
      } else {
        requestUrl.pathname += `/${options.url}`;
      }
    } else {
      requestUrl = new URL(options.url);
    }
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        requestUrl.searchParams.append(key, value.toString());
      }
    }

    client.configure({
      ...options,
      url: requestUrl.toString(),
      responseType: options.responseType,
      interceptors: [...this.interceptors, ...options.interceptors]
    });
    await client.callRequestInterceptors();

    return client
      .fetch<T>()
      .then(async response => {
        if (response.status >= 200 && response.status <= 299) {
          await client.callResponseInterceptors(response);
          return Promise.resolve(response);
        }
        return Promise.reject(response);
      })
      .catch(async response => {
        await client.callResponseInterceptors(response);
        return Promise.reject(response);
      });
  }

  /**
   * For use specific client
   * @param client The client class or instance
   * @returns The current Http instance.
   */
  useClient(client: Client | Constructor<Client>, activator: Activator = true): NexusHttp {
    if (!client) {
      if ('fetch' in window) {
        this.useClient(FetchClient);
      } else {
        this.useClient(XmlClient);
      }
    }
    if (typeof activator === 'function') activator = activator();
    if (activator) this.client = client instanceof Client ? client : new client();

    return this;
  }

  /**
   * `baseURL` will be prepended to `url` unless `url` is absolute.
   * @param url
   * @returns The current Http instance.
   */
  setBaseUrl(baseUrl: string | URL): NexusHttp {
    if (typeof baseUrl === 'string') {
      baseUrl = new URL(baseUrl);
    }
    this.baseUrl = baseUrl.origin + baseUrl.pathname;

    return this;
  }

  /**
   *
   * @param interceptors
   * @returns The current Http instance.
   */
  addGlobalIntercaptors(...interceptors: Interceptor[]): NexusHttp {
    this.interceptors = [...new Set([...this.interceptors, ...interceptors])];
    return this;
  }

  /**
   *
   * @param interceptors
   * @returns The current Http instance.
   */
  addGlobalIntercaptor(interceptor: Interceptor, activator: Activator = true): NexusHttp {
    if (typeof activator === 'function') activator = activator();
    if (activator) this.addGlobalIntercaptors(interceptor);
    return this;
  }

  /**
   *
   * @param type
   * @returns The current Http instance.
   */
  setDefaultResponseType(type: ResponseType): NexusHttp {
    if (!type) type = ResponseType.NONE;
    this.defaultResponseType = type;
    return this;
  }
}

export const nexusHttp = new NexusHttp();
window['NexusHttp'] = NexusHttp;
window['nexusHttp'] = nexusHttp;

declare global {
  interface Window {
    NexusHttp: Constructor<NexusHttp>;
    nexusHttp: NexusHttp;
  }
}
