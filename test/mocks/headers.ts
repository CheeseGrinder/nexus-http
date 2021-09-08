type HttpHeadersValue = string | string[];

export class Headers {
  has(name: string): boolean {
    return !!name;
  }

  get(name: string): string | null {
    return name;
  }

  keys(): string[] {
    return [];
  }

  getAll(name: string): void {
    name;
  }

  set(name: string, value: HttpHeadersValue): void {
    name;
    value;
  }

  delete(name: string, value?: HttpHeadersValue): void {
    name;
    value;
  }

  append(name: string, value: HttpHeadersValue): void {
    name;
    value;
  }

  foreach(callback: (value: string, name: string) => void): void {
    callback;
  }
}
