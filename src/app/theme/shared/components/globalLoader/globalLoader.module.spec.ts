import { GlobalLoaderModule } from './globalLoader.module';

describe('globalLoaderModule', () => {
  let globalLoaderModule: GlobalLoaderModule;

  beforeEach(() => {
    globalLoaderModule = new GlobalLoaderModule();
  });

  it('should create an instance', () => {
    expect(globalLoaderModule).toBeTruthy();
  });
});
