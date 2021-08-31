export type HttpHeadersInit =
  | string
  | Record<string, string | string[]>
  | { [header: string]: string | string[] }
  | [string, string | string[]][];
