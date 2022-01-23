import { Body } from '../body';
import { HttpHeaders } from '../headers';
import { RequestInterceptorContext, ResponseInterceptorContext } from '../interceptors/context';
import type { Interceptor, RequestInterceptor, ResponseInterceptor } from '../interceptors/interceptor';
import type { ClientOptions, HttpMethod, HttpResponse } from '../types';
import { ResponseType } from '../types';

const CONTENT_TYPE = 'Content-Type';
const ACCEPT = 'Accept';

export abstract class Client {
  protected url: string;
  protected method: HttpMethod;
  protected body: Body;
  protected headers: HttpHeaders;
  protected responseType: ResponseType;
  protected timeout: number;
  protected signal: AbortSignal;

  private requestInterceptors: RequestInterceptor[];
  private responseInterceptors: ResponseInterceptor[];

  /**
   * @internal
   */
  configure(options: ClientOptions): void {
    this.url = options.url;
    this.method = options.method;
    this.body = options.body;
    this.headers = new HttpHeaders(options.headers);
    this.responseType = options.responseType;
    this.timeout = options.timeout;
    this.signal = options.signal;
    this.addInterceptors(...options.interceptors);
  }

  /**
   * @internal
   */
  addInterceptors(...interceptors: Interceptor[]): Client {
    this.requestInterceptors =
      (interceptors?.filter(interceptor => {
        return !!interceptor.handleRequest && interceptor.allowedMethod.includes(this.method);
      }) as RequestInterceptor[]) ?? [];
    this.responseInterceptors =
      (interceptors?.filter(interceptor => {
        return !!interceptor.handleResponse && interceptor.allowedMethod.includes(this.method);
      }) as ResponseInterceptor[]) ?? [];

    return this;
  }

  /**
   * @internal
   */
  async callRequestInterceptors(): Promise<void> {
    switch (this.body?.type) {
      case 'Json':
        this.headers.set(CONTENT_TYPE, 'application/json');
        break;

      default:
        break;
    }
    if (this.headers.has(CONTENT_TYPE) && this.headers.getAll(CONTENT_TYPE).includes('application/json')) {
      this.headers.append(CONTENT_TYPE, 'charset=UTF-8');
    }

    for (const interceptor of this.requestInterceptors) {
      let context = new RequestInterceptorContext({
        url: this.url,
        method: this.method,
        headers: new HttpHeaders()
      });

      if (this.isPromise(interceptor.handleRequest)) {
        context = await interceptor.handleRequest(context);
      } else {
        context = interceptor.handleRequest(context) as RequestInterceptorContext;
      }

      context.headers.forEach(this.headers.append);
    }

    if (this.headers.has(ACCEPT)) return;
    switch (this.responseType) {
      case ResponseType.JSON:
        this.headers.set(ACCEPT, 'application/json');
        break;
      case ResponseType.TEXT:
        this.headers.set(ACCEPT, 'text/*');
        break;
      case ResponseType.BLOB:
      case ResponseType.ARRAY_BUFFER:
        this.headers.set(ACCEPT, 'application/octet-stream');
        break;

      default:
        this.headers.set(ACCEPT, '*/*');
        break;
    }
  }

  /**
   * @internal
   */
  async callResponseInterceptors(response: HttpResponse): Promise<void> {
    const context = new ResponseInterceptorContext(response);

    for (const interceptor of this.responseInterceptors) {
      if (this.isPromise(interceptor.handleResponse)) {
        await interceptor.handleResponse(context);
      } else {
        interceptor.handleResponse(context);
      }
    }
  }

  fetch<T>(): Promise<HttpResponse<T>> {
    throw new Error('Not implemented');
  }

  private isPromise(value: any): value is Promise<any> {
    return value[Symbol.toStringTag] === 'AsyncFunction';
  }
}
