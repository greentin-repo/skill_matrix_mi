import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRangePickerComponent } from './dateRangePicker.component';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}

@NgModule({
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbModule,
    MatInputModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MomentDateModule
  ],
  declarations: [DateRangePickerComponent],
  exports: [DateRangePickerComponent,
    MatInputModule, 
    MatDatepickerModule,
    MomentDateModule,
    MatNativeDateModule,],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class DateRangePickerModule { }
