import { LoginInfoModule } from './loginInfo.module';

describe('LoginInfoModule', () => {
  let loginInfoModule: LoginInfoModule;

  beforeEach(() => {
    loginInfoModule = new LoginInfoModule();
  });

  it('should create an instance', () => {
    expect(loginInfoModule).toBeTruthy();
  });
});
