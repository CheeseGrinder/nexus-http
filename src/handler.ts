import { HttpResponse } from './response';
import { HttpEvent } from './types';

type HttpHandlerInit<T = any> = (value: HttpResponse<T>) => void | VoidFunction;
export type HttpObserver<T> = HttpEvent<T> | HttpHandlerInit<T>;

type HandlerEvent = 'success' | 'error' | 'complete';

export class HttpHandler<T> {
  private subscribers: Partial<Record<HandlerEvent, HttpHandlerInit[]>> = {};

  emit(event: HandlerEvent, data?: HttpResponse): void {
    this.subscribers[event]?.forEach(cb => cb?.(data));
  }

  handler(handler: HttpObserver<T>): void {
    if (typeof handler === 'function') {
      return this.subscribe('success', handler);
    }

    this.subscribe('success', handler.success);
    this.subscribe('error', handler.error);
    this.subscribe('complete', handler.complete);
  }

  private subscribe(event: string, callback: HttpHandlerInit): void {
    this.subscribers[event] ??= [];
    this.subscribers[event].push(callback);
  }
}

export interface HttpResponseHandler<T> {
  handle: (handler: HttpObserver<T>) => void;
}
