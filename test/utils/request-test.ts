import { RequestContext } from 'types';

export interface RequestTest {
  context: RequestContext;

  requestInit: RequestInit;
}
