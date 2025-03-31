import { TopBarModule } from './topBar.module';

describe('dateRangePickerModule', () => {
  let topBarModule: TopBarModule;

  beforeEach(() => {
    topBarModule = new TopBarModule();
  });

  it('should create an instance', () => {
    expect(topBarModule).toBeTruthy();
  });
});
