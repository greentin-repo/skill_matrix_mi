import { LoadingModule } from './loading.module';

describe('loadingModule', () => {
  let loadingModule: LoadingModule;

  beforeEach(() => {
    loadingModule = new LoadingModule();
  });

  it('should create an instance', () => {
    expect(loadingModule).toBeTruthy();
  });
});
