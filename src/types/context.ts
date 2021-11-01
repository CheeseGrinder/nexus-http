import { HttpHeaders } from '../headers';
import { HttpMethod } from '../method.enum';
import { HttpResponseType } from '../response';
import { HttpStatusCode } from '../status-code.enum';
import { HttpHeadersInit } from './headers';
import { HttpInterceptor } from './interceptor';

export interface RequestContextInit {
  url: string;
  method: HttpMethod;
  headers?: HttpHeaders | HttpHeadersInit;
  interceptors?: HttpInterceptor[];
  responseType?: HttpResponseType;
  isDebugEnabled?: boolean;
}

export interface RequestContext extends RequestContextInit {
  headers?: HttpHeaders;
}
export interface InterceptorBeforeContext {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: HttpHeaders;
  readonly isDebugEnabled: boolean;
  readonly responseType: HttpResponseType;
}

export interface InterceptorAfterContext extends InterceptorBeforeContext {
  readonly statusCode: HttpStatusCode;
  readonly ok: boolean;
}
