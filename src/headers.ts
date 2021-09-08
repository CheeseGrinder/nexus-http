import { HttpHeadersInit } from './types';

type HttpHeadersValue = string | string[];

export class HttpHeaders {
  private headers: Map<string, string[]> = new Map();

  /** Constructs a new HTTP header object with the given values. */
  constructor(headers?: HttpHeadersInit) {
    if (typeof headers === 'string') {
      headers
        .split('\n')
        .filter(h => h.indexOf(':') > 0)
        .forEach(header => {
          const index = header.indexOf(':');
          const key = header.slice(0, index);
          const value = header.slice(index + 1).trim();

          this.append(key, value);
        });
    } else if (typeof headers === 'object') {
      const _headers = Array.isArray(headers) ? headers : Object.entries(headers);

      _headers.filter(([k, v]) => k && v).forEach(([key, value]) => this.append(key, value));
    }
  }

  /**
   * Checks for existence of a given header.
   *
   * @param {string} name The header name to check for existence.
   *
   * @returns `true` if the header exists, `false` otherwise.
   */
  has(name: string): boolean {
    return this.headers.has(name.trim());
  }

  /**
   * Retrieves the first value of a given header.
   *
   * @param {string} name The header name.
   *
   * @returns The value string if the header exists, `null` otherwise
   */
  get(name: string): string | null {
    const values = this.headers.get(name.trim());
    return values?.[0] ?? null;
  }

  /**
   * Retrieves the names of the headers.
   *
   * @returns A list of header names.
   */
  keys(): string[] {
    return [...this.headers.keys()];
  }

  /**
   * Retrieves a list of values for a given header.
   *
   * @param {string} name The header name from which to retrieve values.
   *
   * @returns A string of values if the header exists, null otherwise.
   */
  getAll(name: string): string[] | null {
    return this.headers.get(name.trim()) || null;
  }

  /**
   * Sets a value for a given header.
   * If the header already exists, its value is replaced with the given value.
   *
   * @param name The header name.
   * @param value The value or values to set or overide for the given header.
   */
  set(name: string, value: HttpHeadersValue): HttpHeaders {
    this.delete(name);
    this.append(name, value);

    return this;
  }

  /**
   * Deletes values for a given header
   *
   * @param {string} name The header name.
   * @param {string | string[]} [value] The value or values to delete for the given header.
   */
  delete(name: string, value?: HttpHeadersValue): HttpHeaders {
    const trimedName = name.trim();
    if (!this.headers.has(trimedName)) return this;
    if (!value) {
      this.headers.delete(trimedName);
      return this;
    }
    if (!Array.isArray(value)) value = [value];

    const values = this.headers.get(trimedName).filter(h => !value.includes(h));
    values.length === 0 ? this.headers.delete(trimedName) : this.headers.set(trimedName, values);

    return this;
  }

  /**
   * Add a value for a given header.
   * If the header doesn't exists, its will create it.
   *
   * @param name The header name.
   * @param value The value or values to set or overide for the given header.
   */
  append(key: string, value: HttpHeadersValue): HttpHeaders {
    const trimedKey = key.trim();
    if (!this.headers.has(trimedKey)) this.headers.set(trimedKey, []);
    if (!Array.isArray(value)) value = [value];

    this.headers.get(trimedKey).push(...value);
    return this;
  }

  foreach(callback: (name: string, values: string[]) => void): void {
    [...this.headers.keys()].forEach(key => callback(key, this.headers.get(key)));
  }

  static fromHeaders(other: Headers): HttpHeaders {
    const headers = new HttpHeaders();
    if (!other) return headers;

    other.forEach((value, key) => headers.set(key, value));

    return headers;
  }
}
