import { HttpHeaders } from '../src/headers';

describe('Headers', () => {
  let emptyHeaders: HttpHeaders;

  beforeEach(() => {
    emptyHeaders = new HttpHeaders();
  });

  afterEach(() => {
    emptyHeaders = void 0;
  });

  it('should be defined', () => {
    expect(emptyHeaders).toBeDefined();
  });

  describe('method: has()', () => {
    it('should be not have "Content-Type"', () => {
      const received = emptyHeaders.has('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe(false);
    });

    it('should be have "Content-Type"', () => {
      emptyHeaders.set('Content-Type', 'application/json');
      const received = emptyHeaders.has('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe(true);
    });
  });

  describe('method: get()', () => {
    it('should be null', () => {
      const received = emptyHeaders.get('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBeNull();
    });

    it('should be not null', () => {
      emptyHeaders.set('Content-Type', 'application/json');
      const received = emptyHeaders.get('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe('application/json');
    });
  });

  describe('method: keys()', () => {
    it('should be empty array', () => {
      const received = emptyHeaders.keys();

      expect(received).toBeDefined();
      expect(received).toBeInstanceOf(Array);
      expect(received.length).toBe(0);
    });

    it('should be array with "Content-Type"', () => {
      emptyHeaders.set('Content-Type', 'application/json');
      const received = emptyHeaders.keys();

      expect(received).toBeDefined();
      expect(received).toBeInstanceOf(Array);
      expect(received.length).toBe(1);
      expect(received[0]).toBe('Content-Type');
    });
  });

  describe('method: getAll()', () => {
    it('should be null', () => {
      const received = emptyHeaders.getAll('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBeNull();
    });

    it('should be return an array', () => {
      emptyHeaders.set('Content-Type', 'application/json');
      const received = emptyHeaders.getAll('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBeInstanceOf(Array);
      expect(received.length).toBe(1);
      expect(received[0]).toBe('application/json');
    });
  });

  describe('method: set()', () => {
    it('should be set the value', () => {
      emptyHeaders.set('Content-Type', 'application/json');
      const received = emptyHeaders.get('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe('application/json');
    });

    it('should be replace the actual value', () => {
      emptyHeaders.set('Content-Type', 'bad-value');
      emptyHeaders.set('Content-Type', 'application/json');
      const received = emptyHeaders.get('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe('application/json');
    });
  });

  describe('method: delete()', () => {
    beforeEach(() => {
      emptyHeaders.set('Content-Type', ['application/json', 'application/pdf', 'application/x-json']);
    });

    it('should be delete all value', () => {
      emptyHeaders.delete('Content-Type');
      const received = emptyHeaders.has('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe(false);
    });

    it('should be delete given value', () => {
      emptyHeaders.delete('Content-Type', 'application/pdf');
      const received = emptyHeaders.has('Content-Type');
      const values = emptyHeaders.getAll('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe(true);
      expect(values).toBeInstanceOf(Array);
      expect(values.length).toBe(2);
      expect(values[0]).toBe('application/json');
      expect(values[1]).toBe('application/x-json');
    });

    it('should be delete given values', () => {
      emptyHeaders.delete('Content-Type', ['application/pdf', 'application/x-json']);
      const received = emptyHeaders.has('Content-Type');
      const values = emptyHeaders.getAll('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe(true);
      expect(values).toBeInstanceOf(Array);
      expect(values.length).toBe(1);
      expect(values[0]).toBe('application/json');
    });
  });

  describe('method: append()', () => {
    it('should be defined "Content-Type"', () => {
      emptyHeaders.append('Content-Type', 'application/json');
      const received = emptyHeaders.has('Content-Type');
      const values = emptyHeaders.getAll('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe(true);
      expect(values).toBeInstanceOf(Array);
      expect(values.length).toBe(1);
      expect(values[0]).toBe('application/json');
    });

    it('should be add a value on "Content-Type"', () => {
      emptyHeaders.set('Content-Type', 'application/json');
      emptyHeaders.append('Content-Type', 'application/x-json');
      const received = emptyHeaders.has('Content-Type');
      const values = emptyHeaders.getAll('Content-Type');

      expect(received).toBeDefined();
      expect(received).toBe(true);
      expect(values).toBeInstanceOf(Array);
      expect(values.length).toBe(2);
      expect(values[0]).toBe('application/json');
      expect(values[1]).toBe('application/x-json');
    });
  });
});
