import type { HttpError, Response } from '../types';
import { Client } from './client';

export class FetchClient extends Client {
  async fetch<T>(): Promise<Response<T>> {
    const controller = new AbortController();
    if (this.timeout > 0) {
      setTimeout(() => {
        controller.abort();
      }, this.timeout);
    }
    this.signal?.addEventListener('abort', () => {
      controller.abort();
    });

    let body = this.body?.payload;
    if (this.body?.type === 'Json') {
      body = JSON.stringify(body);
    }

    return fetch(this.url, {
      method: this.method,
      body: body as any,
      headers: this.headers,
      signal: controller.signal
    })
      .then(async response => {
        let data = null;
        if (this.responseType) {
          try {
            data = await response[this.responseType]();
          } catch (error) {
            data = { error };
          }
        }

        return Promise.resolve({
          url: this.url,
          method: this.method,
          status: response.status,
          headers: response.headers,
          data: data
        });
      })
      .catch(err => {
        const data = {} as HttpError;
        if (err.name === 'AbortError') {
          if (this.timeout) {
            data.name = 'TimeoutError';
            data.message = 'Timeout error';
          } else {
            data.name = err.name;
            data.message = 'Request aborted';
          }
        } else if (err.name === 'Failed to fetch') {
          data.name = 'FetchError';
          data.message = 'Failed to fetch';
        }

        return Promise.reject({
          url: this.url,
          method: this.method,
          status: null,
          headers: new Headers(),
          data: data
        });
      });
  }
}
