import { HttpHeaders } from 'headers';

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
});
