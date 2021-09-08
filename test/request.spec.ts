import { BodyError } from 'errors';
import { HttpHeaders } from 'headers';
import { HttpMethod } from 'method.enum';
import { HttpRequest } from 'request';
import { Headers } from './mocks/headers';
import { RequestTest } from './utils/request-test';

describe('request', () => {
  let request: HttpRequest;

  beforeEach(() => {
    global.Headers = jest.fn().mockImplementation(() => Headers);

    request = new HttpRequest({
      url: 'http://localhost/test',
      method: HttpMethod.POST,
      interceptors: []
    });
  });

  afterEach(() => {
    request = void 0;

    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(request).toBeDefined();
  });

  describe('method: body()', () => {
    it('should add data to body on "POST" method', () => {
      const data = { username: 'CheeseGrinder' };
      request.body(data);

      const requestTest: RequestTest = request as any;
      expect(requestTest.requestInit.body).toBeDefined();
      expect(requestTest.requestInit.body).toBe(JSON.stringify(data));
    });

    it('should add data to body on "PUT" method', () => {
      (request as any as RequestTest).context.method = HttpMethod.PUT;

      const data = { username: 'CheeseGrinder' };
      request.body(data);

      const requestTest: RequestTest = request as any;
      expect(requestTest.requestInit.body).toBeDefined();
      expect(requestTest.requestInit.body).toBe(JSON.stringify(data));
    });

    it('should add data to body on "PATCH" method', () => {
      (request as any as RequestTest).context.method = HttpMethod.PATCH;

      const data = { username: 'CheeseGrinder' };
      request.body(data);

      const requestTest: RequestTest = request as any;
      expect(requestTest.requestInit.body).toBeDefined();
      expect(requestTest.requestInit.body).toBe(JSON.stringify(data));
    });

    it('should throw an error on "GET" method', () => {
      (request as any as RequestTest).context.method = HttpMethod.GET;

      const data = { username: 'CheeseGrinder' };
      const toThrow = () => request.body(data);

      expect(toThrow).toThrow();
      expect(toThrow).toThrowError(new BodyError({ method: HttpMethod.GET }));
    });

    it('should throw an error on "DELETE" method', () => {
      (request as any as RequestTest).context.method = HttpMethod.DELETE;

      const data = { username: 'CheeseGrinder' };
      const toThrow = () => request.body(data);

      expect(toThrow).toThrow();
      expect(toThrow).toThrowError(new BodyError({ method: HttpMethod.DELETE }));
    });

    it('should throw an error on "HEAD" method', () => {
      (request as any as RequestTest).context.method = HttpMethod.HEAD;

      const data = { username: 'CheeseGrinder' };
      const toThrow = () => request.body(data);

      expect(toThrow).toThrow();
      expect(toThrow).toThrowError(new BodyError({ method: HttpMethod.HEAD }));
    });

    it('should throw an error on "OPTIONS" method', () => {
      (request as any as RequestTest).context.method = HttpMethod.OPTIONS;

      const data = { username: 'CheeseGrinder' };
      const toThrow = () => request.body(data);

      expect(toThrow).toThrow();
      expect(toThrow).toThrowError(new BodyError({ method: HttpMethod.OPTIONS }));
    });

    it('should throw an error on "TRACE" method', () => {
      (request as any as RequestTest).context.method = HttpMethod.TRACE;

      const data = { username: 'CheeseGrinder' };
      const toThrow = () => request.body(data);

      expect(toThrow).toThrow();
      expect(toThrow).toThrowError(new BodyError({ method: HttpMethod.TRACE }));
    });
  });

  describe('method: configure()', () => {
    it('should set the responseType to "text"', () => {
      request.configure({
        responseType: 'text'
      });

      const requestTest: RequestTest = request as any;
      expect(requestTest.context).toBeDefined();
      expect(requestTest.context.responseType).toBeDefined();
      expect(requestTest.context.responseType).toBe('text');
    });

    it('should set request headers from HttpHeaders', () => {
      request.configure({
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      });

      const requestTest: RequestTest = request as any;
      const headers = requestTest.context.headers as HttpHeaders;
      expect(requestTest.context).toBeDefined();
      expect(requestTest.context.headers).toBeDefined();
      expect(headers.get('Content-Type')).toBeDefined();
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should set request headers from HttpHeadersInit', () => {
      request.configure({
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const requestTest: RequestTest = request as any;
      const headers = requestTest.context.headers as HttpHeaders;
      expect(requestTest.context).toBeDefined();
      expect(requestTest.context.headers).toBeDefined();
      expect(headers.get('Content-Type')).toBeDefined();
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });
});
