import { BodyError } from './errors';
import { HttpHandler, HttpResponseHandler } from './handler';
import { HttpHeaders } from './headers';
import { InitHeadersInterceptor } from './interceptors';
import { HttpMethod } from './method.enum';
import { HttpResponse, HttpResponseType } from './response';
import {
  HttpBodyInit,
  HttpHeadersInit,
  HttpInterceptor,
  InterceptorContext,
  RequestContext,
  RequestContextInit
} from './types';

interface RequestConfigOptions extends Partial<Omit<RequestInit, 'body' | 'method' | 'window' | 'headers'>> {
  headers?: HttpHeaders | HttpHeadersInit;

  /**
   * @default 'json'
   */
  responseType?: HttpResponseType;
}

export class HttpRequest<T = unknown> {
  private context: RequestContext = {} as RequestContext;
  private requestInit: RequestInit = {};
  private finalHeaders: HttpHeaders = new HttpHeaders();

  constructor(context: RequestContextInit) {
    const { headers, ...rest } = context;

    this.context = rest;
    this.context.interceptors ??= [];
    this.context.headers = headers instanceof HttpHeaders ? headers : new HttpHeaders(headers);
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

      options.headers.foreach((name, values) => this.context.headers.append(name, values));
    }
    this.context.responseType = options.responseType ?? 'json';

    return this;
  }

  addInterceptors(...interceptors: HttpInterceptor[]): HttpRequest<T> {
    const requestInterceptor = interceptors
      .filter(i => i.allowedMethod.includes(this.context.method))
      .filter(i => this.context.interceptors.findIndex(gi => gi.name === i.name) === -1);
    this.context.interceptors.push(...requestInterceptor);
    return this;
  }

  fetch(): HttpResponseHandler<T> {
    this.context.interceptors.unshift(new InitHeadersInterceptor());
    this.invokeInterceptorsBeforeMethod();

    const { url } = this.context;
    const emmiter = new HttpHandler<T>();
    const request = new Request(url, this.requestInit);

    fetch(request)
      .then(response => HttpResponse.fromResponse<T>(response, this.context))
      .then(response => {
        this.invokeInterceptorsAfterMethod(response);

        const event = response.ok ? 'success' : 'error';
        this.debugLogs('[client] emit', event);
        emmiter.emit(event, response);
      })
      .catch(err => {
        this.debugLogs('[client] emit error');
        emmiter.emit('error', err);
      })
      .finally(() => {
        this.debugLogs('[client] emit complete');
        emmiter.emit('complete');
      });

    return {
      handle: emmiter.handler.bind(emmiter)
    };
  }

  private invokeInterceptorsBeforeMethod(): void {
    this.context.interceptors
      .filter(i => i.before)
      .forEach(interceptor => {
        this.debugLogs('[Before] Call interceptor: ', interceptor.name);
        const context = interceptor.before({
          url: this.context.url,
          method: this.context.method,
          isDebugEnabled: this.context.isDebugEnabled,
          responseType: this.context.responseType,
          headers: this.context.headers as HttpHeaders
        });
        context.headers.foreach((name, values) => this.finalHeaders.append(name, values));
      });
    const headers = {};
    this.finalHeaders.foreach((name, values) => {
      headers[name] = values.join('; ');
    });
    this.requestInit.headers = headers;
  }

  private invokeInterceptorsAfterMethod(response: HttpResponse): void {
    const context: InterceptorContext = {
      url: response.url,
      method: response.method,
      isDebugEnabled: this.context.isDebugEnabled,
      responseType: response.type,
      headers: response.headers
    };

    this.context.interceptors.forEach(i => {
      this.debugLogs('[After] Call interceptor: ', i.name);
      i.after?.(context);
    });
  }

  private debugLogs(...data: any[]): void {
    this.context.isDebugEnabled && console.log(...data);
  }
}
