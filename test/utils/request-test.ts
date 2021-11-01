import { RequestContext } from '../../src/types';

export interface RequestTest {
  context: RequestContext;

  requestInit: RequestInit;
}
