import { HttpStatusCode } from './status-code.enum';
import { HttpHeaders } from './headers';
import { HttpMethod } from './method.enum';
import { RequestContext } from './types';

export type HttpResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer';

interface HttpResponseInit<T> {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: HttpHeaders;
  readonly ok: boolean;
  readonly status: HttpStatusCode;
  readonly statusText: string;
  readonly body: T;
  readonly type: HttpResponseType;
}

export class HttpResponse<T = any> implements HttpResponseInit<T> {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: HttpHeaders;
  readonly ok: boolean;
  readonly status: HttpStatusCode;
  readonly statusText: string;
  readonly body: T;
  readonly type: HttpResponseType;

  constructor(init: HttpResponseInit<T>) {
    this.url = init.url;
    this.method = init.method;
    this.headers = init.headers;
    this.ok = init.ok;
    this.status = init.status;
    this.statusText = init.statusText;
    this.body = init.body;
    this.type = init.type;
  }

  static async fromResponse<T>(response: Response, context: RequestContext): Promise<HttpResponse<T>> {
    context.isDebugEnabled && console.log('[Client] Build response');

    const headers = HttpHeaders.fromHeaders(response.headers);
    const body = await response[context.responseType]();
    const hasErrorField = !!body.error;

    return new HttpResponse<T>({
      url: context.url,
      method: context.method,
      ok: response.ok,
      headers: headers,
      status: hasErrorField ? body.status ?? response.status : response.status,
      statusText: hasErrorField ? body.statusText ?? response.statusText : response.statusText,
      type: context.responseType,
      body: hasErrorField
        ? {
            message: body.message,
            error: body.error,
          }
        : body,
    });
  }
}
