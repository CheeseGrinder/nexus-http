import { Body } from '../body';
import { RequestInterceptorContext, ResponseInterceptorContext } from '../interceptors/context';
import type { Interceptor, RequestInterceptor, ResponseInterceptor } from '../interceptors/interceptor';
import type { ClientOptions, HttpMethod, Response } from '../types';
import { ResponseType } from '../types';

export abstract class Client {
  protected url: string;
  protected method: HttpMethod;
  protected body: Body;
  protected headers: Headers;
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
    this.headers = new Headers(options.headers);
    this.responseType = options.responseType;
    this.timeout = options.timeout ?? null;
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
    for (const interceptor of this.requestInterceptors) {
      let context = new RequestInterceptorContext({
        url: this.url,
        method: this.method,
        headers: new Headers()
      });

      if (this.isPromise(interceptor.handleRequest)) {
        context = await interceptor.handleRequest(context);
      } else {
        context = interceptor.handleRequest(context) as RequestInterceptorContext;
      }

      context.headers.forEach((value, key) => {
        this.headers.append(key, value);
      });
    }

    const bodyType = this.body?.type;
    switch (bodyType) {
      case 'Json':
        this.headers.set('Content-Type', 'application/json');
        break;
      case 'Text':
        this.headers.set('Content-Type', 'text/*');
        break;
      case 'Form':
        this.headers.set('Content-Type', 'multipart/form-data');
        break;
      case 'Blob':
        this.headers.set('Content-Type', 'application/octet-stream');
        break;

      default:
        break;
    }
    this.headers.append('Content-Type', 'charset=UTF-8');

    if (this.headers.has('Accept')) return;

    switch (this.responseType) {
      case ResponseType.JSON:
        this.headers.set('Accept', 'application/json');
        break;
      case ResponseType.TEXT:
        this.headers.set('Accept', 'text/*');
        break;
      case ResponseType.BLOB:
      case ResponseType.ARRAY_BUFFER:
        this.headers.set('Accept', 'application/octet-stream');
        break;

      default:
        this.headers.set('Accept', '*/*');
        break;
    }
  }

  /**
   * @internal
   */
  async callResponseInterceptors(response: Response<any>): Promise<void> {
    const context = new ResponseInterceptorContext(response);

    for (const interceptor of this.responseInterceptors) {
      if (this.isPromise(interceptor.handleResponse)) {
        await interceptor.handleResponse(context);
      } else {
        interceptor.handleResponse(context);
      }
    }
  }

  fetch<T>(): Promise<Response<T>> {
    throw new Error('Not implemented');
  }

  private isPromise(value: any): value is Promise<any> {
    return value[Symbol.toStringTag] === 'AsyncFunction';
  }
}
