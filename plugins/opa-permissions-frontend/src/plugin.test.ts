import { opaPermissionsFrontendPlugin } from './plugin';

describe('opa-permissions-frontend', () => {
  it('should export plugin', () => {
    expect(opaPermissionsFrontendPlugin).toBeDefined();
  });
});
