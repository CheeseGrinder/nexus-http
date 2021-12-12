import { Body } from './body';
import { Interceptor } from './interceptors/interceptor';
import { HttpStatusCode } from './status-code';

export enum ResponseType {
  JSON = 'json',
  TEXT = 'text',
  BLOB = 'blob',
  ARRAY_BUFFER = 'arraybuffer',
  NONE = ''
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';
export type BodyType = 'Form' | 'Json' | 'Text' | 'Blob';

export interface HttpOptions {
  method: HttpMethod;
  url: string;
  responseType?: ResponseType;
  query?: Record<string, any>;
  body?: Body;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  interceptors?: Interceptor[];
}

export type RequestOptions = Omit<HttpOptions, 'method' | 'url'>;

export interface Response<T> {
  readonly url: string;
  readonly method: HttpMethod;
  readonly status: HttpStatusCode;
  readonly headers: Headers;
  readonly data: T;
}

export interface HttpError {
  name: string;
  message: string;
}
