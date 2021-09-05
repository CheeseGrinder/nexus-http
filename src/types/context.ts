import { HttpHeaders } from '../headers';
import { HttpMethod } from '../method.enum';
import { HttpResponseType } from '../response';
import { HttpInterceptor } from './interceptor';

export interface RequestContext {
  url: string;
  method: HttpMethod;
  isDebugEnabled?: boolean;
  responseType?: HttpResponseType;
  interceptors: HttpInterceptor[];
}

export interface InterceptorContext {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: HttpHeaders;
  readonly isDebugEnabled: boolean;
  readonly responseType: HttpResponseType;
}
