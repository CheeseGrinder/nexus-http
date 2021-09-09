import { HttpError } from '../errors';
import { HttpResponse } from '../response';

export interface HttpEvent<T> {
  success: (value: HttpResponse<T>) => void;
  error?: (err: HttpResponse<HttpError>) => void;
  complete?: () => void;
}
