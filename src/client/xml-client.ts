import { Response } from '../types';
import { Client } from './client';

export class XmlClient extends Client {
  async fetch<T>(): Promise<Response<T>> {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      if (this.timeout > 0) {
        setTimeout(() => {
          controller.abort();
        }, this.timeout);
      }
      const abortListener = () => xhr.abort();
      controller.signal.addEventListener('abort', abortListener);
      this.signal?.addEventListener('abort', abortListener);

      const xhr = new XMLHttpRequest();
      xhr.open(this.method, this.url, true);
      xhr.responseType = this.responseType ?? '';
      xhr.timeout = this.timeout;
      xhr.addEventListener('load', () => {
        this.signal?.removeEventListener('abort', abortListener);
        const response: Response<T> = {
          url: this.url,
          method: this.method,
          status: xhr.status,
          headers: new Headers(),
          data: xhr.response
        };
        for (const header of xhr.getAllResponseHeaders().split('\r\n')) {
          if (!header) continue;

          const [headerName] = header.match(/^[a-z-]+/i);
          response.headers.append(headerName, xhr.getResponseHeader(headerName));
        }

        return resolve(response);
      });
      xhr.addEventListener('abort', () => {
        this.signal?.removeEventListener('abort', abortListener);
        return Promise.reject({
          url: this.url,
          method: this.method,
          status: null,
          headers: new Headers(),
          data: {
            name: 'AbortError',
            message: 'Request aborted'
          }
        });
      });
      xhr.addEventListener('timeout', () => {
        this.signal?.removeEventListener('abort', abortListener);
        return reject({
          url: this.url,
          method: this.method,
          status: null,
          headers: new Headers(),
          data: {
            name: 'TimeoutError',
            message: 'Timeout error'
          }
        });
      });
      xhr.addEventListener('error', () => {
        this.signal?.removeEventListener('abort', abortListener);
        return reject({
          url: this.url,
          method: this.method,
          status: null,
          headers: new Headers(),
          data: {
            name: 'NetworkError',
            message: 'Network error'
          }
        });
      });

      let body = this.body?.payload;
      if (this.body?.type === 'Json') {
        body = JSON.stringify(body);
      }

      this.headers.forEach((value, key) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(body as any);
    });
  }
}
