import { NexusClient } from 'client';
import { ClientTest } from './utils/client-test';

describe('client', () => {
  let client: NexusClient;

  beforeEach(() => {
    client = NexusClient.create({
      baseUrl: 'http://localhost/'
    });
  });

  afterEach(() => {
    client = void 0;
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  describe('method: buildUrlWithQuery()', () => {
    it('should be return the same url if no params is given', () => {
      const received = (client as any as ClientTest).buildUrlWithQuery('/test');

      expect(received).toBeDefined();
      expect(received).toBe('http://localhost/test');
    });

    it('should be return url with query params', () => {
      const received = (client as any as ClientTest).buildUrlWithQuery('/test', {
        page: 1,
        limit: 10,
        test: 'string'
      });

      expect(received).toBeDefined();
      expect(received).toBe('http://localhost/test?page=1&limit=10&test=string');
    });

    it('should be add query params when url end with question mark', () => {
      const received = (client as any as ClientTest).buildUrlWithQuery('/test?', {
        page: 1,
        limit: 10,
        test: 'string'
      });

      expect(received).toBeDefined();
      expect(received).toBe('http://localhost/test?page=1&limit=10&test=string');
    });

    it('should be add query params in url', () => {
      const received = (client as any as ClientTest).buildUrlWithQuery('/test?test=string', {
        page: 1,
        limit: 10
      });

      expect(received).toBeDefined();
      expect(received).toBe('http://localhost/test?test=string&page=1&limit=10');
    });
  });

  describe('method: formatUrl()', () => {
    it('should be add an "/"', () => {
      client = NexusClient.create({
        baseUrl: 'http://localhost'
      });
      const received = (client as any as ClientTest).formatUrl('test');

      expect(received).toBeDefined();
      expect(received).toBe('http://localhost/test');
    });

    it('should be concat baseUrl & given url, when baseUrl end with "/"', () => {
      const received = (client as any as ClientTest).formatUrl('test');

      expect(received).toBeDefined();
      expect(received).toBe('http://localhost/test');
    });

    it('should be concat baseUrl & given url, when url end with "/"', () => {
      client = NexusClient.create({
        baseUrl: 'http://localhost'
      });
      const received = (client as any as ClientTest).formatUrl('/test');

      expect(received).toBeDefined();
      expect(received).toBe('http://localhost/test');
    });

    it('should be have one "/" when baseUrl end with "/" & url start with "/"', () => {
      const received = (client as any as ClientTest).formatUrl('/test');

      expect(received).toBeDefined();
      expect(received).toBe('http://localhost/test');
    });
  });
});
