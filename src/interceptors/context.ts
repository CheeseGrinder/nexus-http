import { HttpStatusCode } from '../status-code';
import type { HttpMethod } from '../types';

interface InterceptorContextInit {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: Headers;
}

export class InterceptorContext {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: Headers;

  constructor(context: InterceptorContextInit) {
    this.url = context.url;
    this.method = context.method;
    this.headers = context.headers;
  }
}

export class RequestInterceptorContext extends InterceptorContext {
  constructor(context: InterceptorContextInit) {
    super(context);
  }
}

interface ResponseInterceptorInit<T> extends InterceptorContextInit {
  status: HttpStatusCode;
  data: T;
}

export class ResponseInterceptorContext<T = unknown> extends InterceptorContext {
  readonly status: HttpStatusCode;
  readonly data: T;
  readonly ok: boolean;

  constructor(context: ResponseInterceptorInit<T>) {
    super(context);

    this.status = context.status;
    this.data = context.data;
    this.ok = this.is2xx();
  }

  is2xx(): boolean {
    return this.status >= 200 && this.status <= 299;
  }

  is3xx(): boolean {
    return this.status >= 300 && this.status <= 399;
  }

  is4xx(): boolean {
    return this.status >= 400 && this.status <= 499;
  }

  is5xx(): boolean {
    return this.status >= 500 && this.status <= 599;
  }
}
