import { HttpMethod } from '../types';
import { RequestInterceptorContext, ResponseInterceptorContext } from './context';

interface InterceptorBase {
  /** Allows to define on which methods the interceptors will be called. */
  allowedMethod: HttpMethod[];
}

export interface RequestInterceptor extends InterceptorBase {
  /**
   * Allows you to configure the request before it is executed.
   *
   * @param context The request context.
   */
  handleRequest(context: RequestInterceptorContext): Promise<RequestInterceptorContext> | RequestInterceptorContext;
}

export interface ResponseInterceptor extends InterceptorBase {
  /**
   * Allows to get information from the response before the user receives it.
   *
   * @param context The response context.
   */
  handleResponse(context: ResponseInterceptorContext): Promise<void> | void;
}

export interface Interceptor extends InterceptorBase {
  /**
   * Allows you to configure the request before it is executed.
   *
   * @param context The request context.
   */
  handleRequest?(context: RequestInterceptorContext): Promise<RequestInterceptorContext> | RequestInterceptorContext;

  /**
   * Allows to get information from the response before the user receives it.
   *
   * @param context The response context.
   */
  handleResponse?(context: ResponseInterceptorContext): Promise<void> | void;
}
