import { HttpHeaders } from 'headers';
import { HttpInterceptor } from 'types/interceptor';
import { HttpMethod } from 'method.enum';
import { HttpResponseType } from 'response';

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
