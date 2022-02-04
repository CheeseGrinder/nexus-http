import { Body } from './body';
import { HttpHeaders, HttpHeadersInit } from './headers';
import type { Interceptor } from './interceptors/interceptor';
import { HttpStatusCode } from './status-code';

export interface Constructor<T> {
  new (): T;
}

export enum ResponseType {
  JSON = 'json',
  TEXT = 'text',
  BLOB = 'blob',
  ARRAY_BUFFER = 'arraybuffer',
  NONE = ''
}

export type ResponseValidator = (status: HttpStatusCode) => boolean;

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';
export type BodyType = 'Form' | 'Json' | 'Text' | 'Blob';

export interface RequestBase {
  method: HttpMethod;
  url: string;
  responseType?: ResponseType;
  query?: Record<string, any>;
  headers?: HttpHeadersInit;
  timeout?: number;
  signal?: AbortSignal;
  interceptors?: Interceptor[];
  validator?: ResponseValidator;
}

export interface RequestBody {
  body?: Body;
}

export interface ClientOptions extends RequestBase {
  body?: Body;
}

export interface RequestWithoutDataOptions extends RequestBase {
  method: 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';
}

export interface RequestWithDataOptions extends RequestBase {
  method: 'POST' | 'PATCH' | 'PUT';
  body?: Body;
}

export type RequestOptions = RequestWithDataOptions | RequestWithoutDataOptions;
export type HttpOptions = Omit<RequestOptions, 'url' | 'method'>;

/**
 * @deprecated use HttpResponse instead
 */
export interface Response<T = unknown> {
  readonly url: string;
  readonly method: HttpMethod;
  readonly status: HttpStatusCode;
  readonly headers: HttpHeaders;
  readonly data: T;
}

export type HttpResponse<T = unknown> = Response<T>;

export interface HttpError {
  name: string;
  message: string;
}

export type Activator = boolean | (() => boolean);
