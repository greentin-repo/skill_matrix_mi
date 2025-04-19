import { DateRangePickerModule } from './dateRangePicker.module';

describe('dateRangePickerModule', () => {
  let dateRangePickerModule: DateRangePickerModule;

  beforeEach(() => {
    dateRangePickerModule = new DateRangePickerModule();
  });

  it('should create an instance', () => {
    expect(dateRangePickerModule).toBeTruthy();
  });
});
