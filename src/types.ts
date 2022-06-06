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
  url: string;
}

export interface RequestWithoutDataOptions extends RequestBase {
  method: 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';
}

export interface RequestWithDataOptions extends RequestBase {
  method: 'POST' | 'PATCH' | 'PUT';
  body?: Body;
}

export type RequestOptions<Path extends string> = (RequestWithDataOptions | RequestWithoutDataOptions) & {
  params?: PathArgs<Path>;
};

export type HttpOptions<Path extends string> = Omit<RequestOptions<Path>, 'url' | 'method'> & {
  params?: PathArgs<Path>;
};

type PathParams<Path extends string> = Path extends `:${infer Param}/${infer Rest}`
  ? Param | PathParams<Rest>
  : Path extends `:${infer Param}`
  ? Param
  : // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Path extends `${infer _Prefix}:${infer Rest}`
  ? PathParams<`:${Rest}`>
  : never;

export type PathArgs<Path extends string> = { [K in PathParams<Path>]: any };

export type HttpResponse<T = unknown> = {
  readonly url: string;
  readonly method: HttpMethod;
  readonly status: HttpStatusCode;
  readonly headers: HttpHeaders;
  readonly data: T;
};

export interface HttpError {
  name: string;
  message: string;
}

export type Activator = boolean | (() => boolean);
