export function mockFetch(): Promise<any> {
  return Promise.resolve(() => ({
    json: Promise.resolve({ data: 'test' })
  }));
}
