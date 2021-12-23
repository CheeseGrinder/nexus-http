import type { ResponseInterceptor } from '.';
import { HttpStatusCode } from '../status-code';
import type { HttpMethod } from '../types';
import { ResponseInterceptorContext } from './context';

export class NotFoundInterceptor implements ResponseInterceptor {
  allowedMethod: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  private handler: VoidFunction;

  constructor(handler: VoidFunction, methods?: HttpMethod[]) {
    this.handler = handler;
    if (methods) this.allowedMethod = methods;
  }

  handleResponse(context: ResponseInterceptorContext<unknown>): void | Promise<void> {
    if (context.status === HttpStatusCode.NOT_FOUND) {
      this.handler();
    }
  }

  /**
   *
   * @param handler
   * @param methods override default method
   * @returns new instance of NotFoundInterceptor
   */
  static config(handler: VoidFunction, methods?: HttpMethod[]): NotFoundInterceptor {
    return new NotFoundInterceptor(handler, methods);
  }
}

export class ForbiddenInterceptor implements ResponseInterceptor {
  allowedMethod: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  private handler: VoidFunction;

  constructor(handler: VoidFunction, methods?: HttpMethod[]) {
    this.handler = handler;
    if (methods) this.allowedMethod = methods;
  }

  handleResponse(context: ResponseInterceptorContext<unknown>): void | Promise<void> {
    if (context.status === HttpStatusCode.FORBIDDEN) {
      this.handler();
    }
  }

  /**
   *
   * @param handler
   * @param methods override default method
   * @returns new instance of ForbiddenInterceptor
   */
  static config(handler: VoidFunction, methods?: HttpMethod[]): ForbiddenInterceptor {
    return new ForbiddenInterceptor(handler, methods);
  }
}

export class UnauthorizedInterceptor implements ResponseInterceptor {
  allowedMethod: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  private handler: VoidFunction;

  constructor(handler: VoidFunction, methods?: HttpMethod[]) {
    this.handler = handler;
    if (methods) this.allowedMethod = methods;
  }

  handleResponse(context: ResponseInterceptorContext<unknown>): void | Promise<void> {
    if (context.status === HttpStatusCode.UNAUTHORIZED) {
      this.handler();
    }
  }

  /**
   *
   * @param handler
   * @param methods override default method
   * @returns new instance of UnauthorizedInterceptor
   */
  static config(handler: VoidFunction, methods?: HttpMethod[]): UnauthorizedInterceptor {
    return new UnauthorizedInterceptor(handler, methods);
  }
}

export class InternalServerErrorInterceptor implements ResponseInterceptor {
  allowedMethod: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  private handler: VoidFunction;

  constructor(handler: VoidFunction, methods?: HttpMethod[]) {
    this.handler = handler;
    if (methods) this.allowedMethod = methods;
  }

  handleResponse(context: ResponseInterceptorContext<unknown>): void | Promise<void> {
    if (context.status === HttpStatusCode.INTERNAL_SERVER_ERROR) {
      this.handler();
    }
  }

  /**
   *
   * @param handler
   * @param methods override default method
   * @returns new instance of InternalServerErrorInterceptor
   */
  static config(handler: VoidFunction, methods?: HttpMethod[]): InternalServerErrorInterceptor {
    return new InternalServerErrorInterceptor(handler, methods);
  }
}
