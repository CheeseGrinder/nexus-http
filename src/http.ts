import { Client, Constructor, FetchClient, XmlClient } from './client';
import { Interceptor } from './interceptors/interceptor';
import { HttpOptions, RequestOptions, Response, ResponseType } from './types';

type Activator = boolean | (() => boolean);

export class NexusHttp {
  private client: Client;
  private baseUrl?: string;
  private interceptors: Interceptor[] = [];
  private defaultResponseType?: ResponseType;

  constructor() {
    if ('fetch' in window) {
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
  get<T = unknown>(url: string, options?: HttpOptions): Promise<Response<T>> {
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
  post<T = unknown>(url: string, options?: HttpOptions): Promise<Response<T>> {
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
  patch<T = unknown>(url: string, options?: HttpOptions): Promise<Response<T>> {
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
  put<T = unknown>(url: string, options?: HttpOptions): Promise<Response<T>> {
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
  delete<T = unknown>(url: string, options?: HttpOptions): Promise<Response<T>> {
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
  async request<T = unknown>(options: RequestOptions): Promise<Response<T>> {
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

    this.client.configure({
      ...options,
      url: requestUrl.toString(),
      responseType: options.responseType ?? this.defaultResponseType ?? ResponseType.NONE,
      interceptors: [...this.interceptors, ...(options.interceptors ?? [])]
    });
    this.client.callRequestInterceptors();

    return this.client
      .fetch<T>()
      .then(response => {
        if (response.status >= 200 && response.status <= 299) {
          this.client.callResponseInterceptors(response);
          return Promise.resolve(response);
        }
        return Promise.reject(response);
      })
      .catch(response => {
        this.client.callResponseInterceptors(response);
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
    if (activator) this.interceptors = [...new Set([...this.interceptors, interceptor])];
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
window['nexusHttp'] = nexusHttp;
