import { HttpInterceptor } from './types';
import { BodyError } from './errors';
import { HttpHandler, HttpResponseHandler } from './handler';
import { HttpHeaders } from './headers';
import { HttpMethod } from './method.enum';
import { HttpResponse, HttpResponseType } from './response';
import { HttpBodyInit, HttpHeadersInit, RequestContext, InterceptorContext } from './types';
import { InitHeadersInterceptor } from 'interceptors';

interface RequestConfigOptions extends Partial<Omit<RequestInit, 'body' | 'method' | 'window' | 'headers'>> {
  headers?: HttpHeaders | HttpHeadersInit;

  /**
   * @default 'json'
   */
  responseType?: HttpResponseType;
}

export class HttpRequest<T = any> {
  private context: RequestContext = {} as RequestContext;
  private requestInit: RequestInit = {};

  constructor(context: RequestContext) {
    this.context = context;
    this.context.interceptors ??= [];
    this.requestInit.method = this.context.method;
    this.requestInit.headers = new Headers();
  }

  body(data: HttpBodyInit): HttpRequest<T> {
    if (![HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].includes(this.context.method))
      throw new BodyError({ method: this.context.method });

    this.requestInit.body = JSON.stringify(data);

    return this;
  }

  configure(options: RequestConfigOptions): HttpRequest<T> {
    Object.entries(options)
      .filter(([key]) => !['headers', 'responseType'].includes(key))
      .forEach(([key, value]) => (this.requestInit[key] = value));

    if (options.headers) {
      if (!(options.headers instanceof HttpHeaders)) options.headers = new HttpHeaders(options.headers);

      this.httpHeadersToHeaders(options.headers);
    }
    this.context.responseType = options.responseType ?? 'json';

    return this;
  }

  addInterceptors(...interceptors: HttpInterceptor[]): ThisType<this> {
    this.context.interceptors.push(...interceptors);
    return this;
  }

  fetch(): HttpResponseHandler<T> {
    this.context.interceptors.unshift(new InitHeadersInterceptor());
    this.invokeInterceptorsBeforeMethod();

    const { isDebugEnabled, url } = this.context;
    const emmiter = new HttpHandler<T>();
    const request = new Request(url, this.requestInit);

    fetch(request)
      .then(response => HttpResponse.fromResponse<T>(response, this.context))
      .then(response => {
        this.invokeInterceptorsAfterMethod(response);

        const event = response.ok ? 'success' : 'error';
        isDebugEnabled && console.log('[client] emit', event);
        emmiter.emit(event, response);
      })
      .catch(err => {
        isDebugEnabled && console.log('[client] emit error');
        emmiter.emit('error', err);
      })
      .finally(() => {
        isDebugEnabled && console.log('[client] emit complete');
        emmiter.emit('complete');
      });

    return {
      handle: emmiter.handler.bind(emmiter),
    };
  }

  private invokeInterceptorsBeforeMethod(): void {
    this.context.interceptors.forEach(i => {
      const context = i.before?.({
        url: this.context.url,
        method: this.context.method,
        isDebugEnabled: this.context.isDebugEnabled,
        responseType: this.context.responseType,
        headers: HttpHeaders.fromHeaders(this.requestInit.headers as Headers),
      });
      this.httpHeadersToHeaders(context.headers);
    });
  }

  private invokeInterceptorsAfterMethod(response: HttpResponse): void {
    const context: InterceptorContext = {
      url: response.url,
      method: response.method,
      isDebugEnabled: this.context.isDebugEnabled,
      responseType: response.type,
      headers: response.headers,
    };

    this.context.interceptors.forEach(i => i.after?.(context));
  }

  private httpHeadersToHeaders(headers: HttpHeaders): void {
    headers.foreach((name, values) => {
      (this.requestInit.headers as Headers).set(name, values.join('; '));
    });
  }
}
