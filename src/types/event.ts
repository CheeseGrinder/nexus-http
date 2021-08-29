import { HttpResponse } from '../response';

interface HttpError {
  message: string;
  error: Error | any;
}

export interface HttpEvent<T> {
  success: (value: HttpResponse<T>) => void;
  error?: (err: HttpResponse<HttpError>) => void;
  complete?: () => void;
}
