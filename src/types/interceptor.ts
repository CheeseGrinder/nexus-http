import { HttpMethod } from '../method.enum';
import { InterceptorBeforeContext, InterceptorAfterContext } from './context';

export interface HttpInterceptor {
  /**
   * interceptor ID
   */
  name: string;

  /**
   * Allows to define on which methods the interceptors will be called.
   */
  allowedMethod: HttpMethod[];

  /**
   * Allows you to configure the request before it is executed.
   *
   * @param {InterceptorContext} context The request context.
   */
  before?: (context: InterceptorBeforeContext) => InterceptorBeforeContext;

  /**
   * Allows to get information from the response before the user receives it.
   *
   * @param {InterceptorContext} context The response context.
   */
  after?: (context: InterceptorAfterContext) => void;
}
