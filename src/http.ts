import { Client, FetchClient, XmlClient } from './client';
import type { Interceptor } from './interceptors/interceptor';
import type {
  Activator,
  Constructor,
  HttpOptions,
  HttpResponse,
  RequestBody,
  RequestOptions,
  ResponseValidator
} from './types';
import { ResponseType } from './types';

const defaultResponseValidator: ResponseValidator = status => status >= 200 && status <= 299;

interface NexusHttpInit {
  client?: Client | Constructor<Client>;
  baseUrl?: string | URL;
  interceptors?: Interceptor[];
  responseType?: ResponseType;
  responseValidator?: ResponseValidator;
}

export class NexusHttp {
  private client: Client;
  private baseUrl?: string;
  private interceptors: Interceptor[] = [];
  private defaultResponseType?: ResponseType;
  private responseValidator: ResponseValidator;

  constructor(init?: NexusHttpInit) {
    init ||= {};
    init.baseUrl && this.setBaseUrl(init.baseUrl);
    init.interceptors && this.addGlobalIntercaptors(...init.interceptors);
    init.responseType && this.setDefaultResponseType(init.responseType);
    init.responseValidator && this.setDefaultResponseType(init.responseType);

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
  get<T, Path extends string = string>(url: Path, options?: HttpOptions<Path>): Promise<HttpResponse<T>> {
    return this.request(url, {
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
  post<T, Path extends string = string>(
    url: Path,
    options?: HttpOptions<Path> & RequestBody
  ): Promise<HttpResponse<T>> {
    return this.request(url, {
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
  patch<T, Path extends string = string>(
    url: Path,
    options?: HttpOptions<Path> & RequestBody
  ): Promise<HttpResponse<T>> {
    return this.request(url, {
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
  put<T, Path extends string = string>(url: Path, options?: HttpOptions<Path> & RequestBody): Promise<HttpResponse<T>> {
    return this.request(url, {
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
  delete<T, Path extends string = string>(url: Path, options?: HttpOptions<Path>): Promise<HttpResponse<T>> {
    return this.request(url, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Makes an HTTP request.
   * @param options The request options.
   * @returns A promise resolving to the response.
   */
  async request<T, Path extends string = string>(url: Path, options: RequestOptions<Path>): Promise<HttpResponse<T>> {
    options.timeout ??= null;
    options.interceptors ??= [];
    options.responseType ??= this.defaultResponseType ?? ResponseType.NONE;
    options.validator ??= this.responseValidator ?? defaultResponseValidator;

    const client: Client = Object.assign(Object.create(Object.getPrototypeOf(this.client)), this.client);
    let requestUrl: URL;

    if (this.baseUrl) {
      if (url.startsWith('/')) url = url.slice(1) as Path;

      requestUrl = new URL(this.baseUrl);
      if (this.baseUrl.endsWith('/')) {
        requestUrl.pathname += url;
      } else {
        requestUrl.pathname += `/${url}`;
      }
    } else {
      requestUrl = new URL(url);
    }
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        requestUrl.searchParams.append(key, value.toString());
      }
    }
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        requestUrl.pathname = requestUrl.pathname.replace(new RegExp(`:${key}`, 'g'), value.toString());
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
        if (options.validator(response.status)) {
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
    type ||= ResponseType.NONE;
    this.defaultResponseType = type;
    return this;
  }

  /**
   *
   * @param validator
   * @returns The current Http instance.
   */
  setDefaultResponseValidator(validator: ResponseValidator): NexusHttp {
    validator ||= defaultResponseValidator;
    this.responseValidator = validator;
    return this;
  }
}

export const nexusHttp = new NexusHttp();
window['NexusHttp'] = NexusHttp;
window['nexusHttp'] = nexusHttp;

declare global {
  interface Window {
    /**
     * NexusHttp class
     */
    NexusHttp: Constructor<NexusHttp>;

    /**
     * Default instance of nexusHttp
     */
    nexusHttp: NexusHttp;
  }
}
