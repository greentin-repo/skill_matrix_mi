import { PaginationModule } from './pagination.module';

describe('paginationModule', () => {
  let paginationModule: PaginationModule;

  beforeEach(() => {
    paginationModule = new PaginationModule();
  });

  it('should create an instance', () => {
    expect(paginationModule).toBeTruthy();
  });
});
