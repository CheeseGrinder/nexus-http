import { NexusClient } from 'client';
import { HttpMethod } from 'method.enum';
import { HttpInterceptor, InterceptorBeforeContext } from 'types';
import { mockFetch } from './mocks/fetch';
import { Headers } from './mocks/headers';
import { Request } from './mocks/request';

class TestInterceptor implements HttpInterceptor {
  name = 'test-interceptor';
  allowedMethod = [HttpMethod.GET];

  before(context: InterceptorBeforeContext): InterceptorBeforeContext {
    return context;
  }
}

describe('interceptors', () => {
  let interceptor: HttpInterceptor;
  let http: NexusClient;

  beforeEach(() => {
    global.Headers = jest.fn().mockImplementation(() => Headers);
    global.Request = jest.fn().mockImplementation(() => Request);
    global.fetch = jest.fn().mockImplementation(mockFetch);

    interceptor = new TestInterceptor();
    http = NexusClient.create({
      baseUrl: 'http://localhost/'
    });
    http.addGlobalInterceptor(interceptor);
  });

  afterEach(() => {
    interceptor = void 0;
    http = void 0;

    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('before request', () => {
    it('should be call the interceptor on "GET" method', () => {
      const spy = jest.spyOn(interceptor, 'before');

      http.get('/test').fetch();
      expect(spy).toBeCalled();
      expect(spy).toBeCalledTimes(1);
    });

    it('should be not call the interceptor on "POST" method', () => {
      const spy = jest.spyOn(interceptor, 'before');

      http.post('/test').fetch();
      expect(spy).not.toBeCalled();
    });

    it('should be not call the interceptor on "PUT" method', () => {
      const spy = jest.spyOn(interceptor, 'before');

      http.put('/test').fetch();
      expect(spy).not.toBeCalled();
    });

    it('should be not call the interceptor on "PATCH" method', () => {
      const spy = jest.spyOn(interceptor, 'before');

      http.patch('/test').fetch();
      expect(spy).not.toBeCalled();
    });

    it('should be not call the interceptor on "DELETE" method', () => {
      const spy = jest.spyOn(interceptor, 'before');

      http.delete('/test').fetch();
      expect(spy).not.toBeCalled();
    });

    it('should be not call the interceptor on "OPTIONS" method', () => {
      const spy = jest.spyOn(interceptor, 'before');

      http.options('/test').fetch();
      expect(spy).not.toBeCalled();
    });

    it('should be not call the interceptor on "TRACE" method', () => {
      const spy = jest.spyOn(interceptor, 'before');

      http.trace('/test').fetch();
      expect(spy).not.toBeCalled();
    });
  });
});
