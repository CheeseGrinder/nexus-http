export type HttpHeadersInit = string | Record<string, string | string[]> | [string, string | string[]][] | HttpHeaders;

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
    } else if (headers instanceof HttpHeaders) {
      this.headers = headers.headers;
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
   * @param values The value or values to set or overide for the given header.
   */
  set(name: string, values: string | string[]): HttpHeaders {
    this.delete(name);
    this.append(name, values);

    return this;
  }

  /**
   * Deletes values for a given header
   *
   * @param {string} name The header name.
   * @param {string | string[]} [values] The value or values to delete for the given header.
   */
  delete(name: string, values?: string | string[]): HttpHeaders {
    const trimedName = name.trim();
    if (!this.headers.has(trimedName)) return this;
    if (!values) {
      this.headers.delete(trimedName);
      return this;
    }
    if (!Array.isArray(values)) values = [values];

    const residual = this.headers.get(trimedName).filter(h => !values.includes(h));
    residual.length === 0 ? this.headers.delete(trimedName) : this.headers.set(trimedName, residual);

    return this;
  }

  /**
   * Add a value for a given header.
   * If the header doesn't exists, its will create it.
   *
   * @param name The header name.
   * @param values The value or values to set or overide for the given header.
   */
  append(name: string, values: string | string[]): HttpHeaders {
    const trimedName = name.trim();
    if (!this.headers.has(trimedName)) this.headers.set(trimedName, []);
    if (!Array.isArray(values)) values = values.split(/;\s?/);

    const actual = this.headers.get(trimedName);
    actual.push(...values.filter(v => !actual.includes(v)));
    return this;
  }

  forEach(callback: (name: string, values: string[]) => void): void {
    [...this.headers.keys()].forEach(key => callback(key, this.headers.get(key)));
  }

  toHeaders(): Record<string, string> {
    const headers = {};
    this.forEach((name, values) => {
      headers[name] = values.join('; ');
    });
    return headers;
  }

  static fromHeaders(other: Headers): HttpHeaders {
    const headers = new HttpHeaders();
    if (!other) return headers;

    other.forEach((value, key) => headers.set(key, value));

    return headers;
  }
}
