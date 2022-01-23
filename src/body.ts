import type { BodyType } from './types';

type Part = string | number[];

export class Body {
  type: BodyType;
  payload: unknown;

  private constructor(type: BodyType, payload: unknown) {
    this.type = type;
    this.payload = payload;
  }

  /**
   * Creates a new form data body.
   * @param data The body data.
   * @return The body object ready to be used on the POST and PUT requests.
   */
  static form(data: Record<string, Part> | FormData): Body {
    return new Body('Form', data);
  }

  /**
   * Creates a new JSON body.
   * @param data The body JSON object.
   * @return The body object ready to be used on the POST and PUT requests.
   */
  static json(data: Record<string, unknown>): Body {
    return new Body('Json', JSON.stringify(data));
  }

  /**
   * Creates a new UTF-8 string body.
   * @param value The body string.
   * @return The body object ready to be used on the POST and PUT requests.
   */
  static text(value: string): Body {
    return new Body('Text', value);
  }

  /**
   * Creates a new byte array body.
   * @param bytes The body byte array.
   * @return The body object ready to be used on the POST and PUT requests.
   */
  static blob(data: Blob): Body {
    return new Body('Blob', data);
  }
}
