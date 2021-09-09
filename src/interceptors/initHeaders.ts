import { HttpInterceptor, InterceptorContext } from '../types';

export class InitHeadersInterceptor implements HttpInterceptor {
  name = 'nexus-init-headers';

  // This is a hack because we add it directly in request
  allowedMethod = [];

  before(context: InterceptorContext): InterceptorContext {
    context.headers.append('Accept', 'application/json, text/plain, */*');
    switch (context.responseType) {
      case 'blob':
      case 'arrayBuffer':
        context.headers.append('Content-Type', 'application/octet-stream');
        break;

      case 'text':
        context.headers.append('Content-Type', 'text/*');
        break;

      case 'json':
      default:
        context.headers.append('Content-Type', 'application/json');
        break;
    }
    context.headers.append('Content-Type', 'charset=UTF-8');
    return context;
  }
}
