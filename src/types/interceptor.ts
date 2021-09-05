import { HttpMethod } from '../method.enum';
import { InterceptorContext } from './context';

export interface HttpInterceptor {
  /**
   * Allows to define on which methods the interceptors will be called.
   */
  allowedMethod: HttpMethod[];

  /**
   * Allows you to configure the request before it is executed.
   *
   * @param {InterceptorContext} context The request context.
   */
  before?: (context: InterceptorContext) => InterceptorContext;

  /**
   * Allows to get information from the response before the user receives it.
   *
   * @param {InterceptorContext} context The response context.
   */
  after?: (context: InterceptorContext) => void;
}
