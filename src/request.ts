import { BodyError } from './errors';
import { HttpHandler, HttpObserver } from './handler';
import { HttpHeaders } from './headers';
import { HttpMethod } from './method.enum';
import { HttpResponse, HttpResponseType } from './response';
import { HttpBodyInit, HttpHeadersInit } from './types';

export interface RequestContext {
  url: string;
  method: HttpMethod;
  enableDebug: boolean;
  responseType?: HttpResponseType;
}

interface RequestConfigOptions extends Partial<Omit<RequestInit, 'body' | 'method' | 'window' | 'headers'>> {
  headers?: HttpHeaders | HttpHeadersInit;

  /**
   * @default 'json'
   */
  responseType?: HttpResponseType;
}

interface HttpRequestHandler<T> {
  handle: (handler: HttpObserver<T>) => void;
}

export class HttpRequest<T = any> {

  private context: RequestContext = {} as RequestContext;
  private requestInit: RequestInit = {};

  constructor(context: RequestContext) {
    this.context = context;
    this.requestInit.method = this.context.method;
    this.initHeaders();
  }

  body(data: HttpBodyInit): HttpRequest<T> {
    if (![HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, ].includes(this.context.method))
      throw new BodyError({ method: this.context.method });

    this.requestInit.body = JSON.stringify(data);

    return this;
  }

  configure(options: RequestConfigOptions): HttpRequest<T> {
    Object.entries(options)
      .filter(([key]) => !['headers', 'responseType'].includes(key))
      .forEach(([key, value]) => this.requestInit[key] = value);

    if (options.headers) {
      if (!(options.headers instanceof HttpHeaders)) options.headers = new HttpHeaders(options.headers);

      this.initHeaders();
      options.headers.foreach((name, values) => {
        (this.requestInit.headers as Headers).set(name, values.join(', '));
      });
    }
    this.context.responseType = options.responseType ?? 'json';

    return this;
  }

  fetch(): HttpRequestHandler<T> {
    const { enableDebug, url } = this.context;
    const emmiter = new HttpHandler<T>();
    const request = new Request(url, this.requestInit);

    fetch(request)
      .then(response => HttpResponse.fromResponse<T>(response, this.context))
      .then(response => {
        const event = (response.ok) ? 'success' : 'error';
        enableDebug && console.log('[client] emit', event);
        emmiter.emit(event, response);
      })
      .catch(err => {
        enableDebug && console.log('[client] emit error');
        emmiter.emit('error', err);
      })
      .finally(() => {
        enableDebug && console.log('[client] emit complete');
        emmiter.emit('complete');
      });

      return {
        handle: emmiter.handler.bind(emmiter)
      }
  }

  private initHeaders() {
    const headers = new Headers();
    headers.append('Accept', 'application/json, text/plain, */*');
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    this.requestInit.headers = headers;
  }
}
