import { HttpMethod } from '../method.enum';

interface BodyErrorOptions {
  method: HttpMethod;
}

export class BodyError extends Error {

  readonly method: HttpMethod;

  constructor(options: BodyErrorOptions) {
    super(`can't add body on method '${options.method}'`);
    this.method = options.method;
  }
}
