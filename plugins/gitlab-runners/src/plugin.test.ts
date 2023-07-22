import { gitlabRunnersPlugin } from './plugin';

describe('gitlab-runners', () => {
  it('should export plugin', () => {
    expect(gitlabRunnersPlugin).toBeDefined();
  });
});
