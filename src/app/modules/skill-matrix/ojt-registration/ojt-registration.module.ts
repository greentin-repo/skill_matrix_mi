import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { OjtRegistrationRoutingModule } from './ojt-registration-routing.module';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { CONSTANT } from '../skill-matrix.constant';
import { OjtRegistrationComponent } from './ojt-registration.component';
import { OjtRegistrationDetailsComponent } from './ojt-registration-details/ojt-registration-details.component';

export const MY_YEAR_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
}
export const MY_MONTH_FORMATS = {
  parse: {
    dateInput: 'MM-YYYY',
  },
  display: {
    dateInput: 'MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}
@NgModule({
  declarations: [OjtRegistrationComponent, OjtRegistrationDetailsComponent],
  imports: [
    CommonModule,
    OjtRegistrationRoutingModule,
    SharedModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MomentDateModule,
  ],
  providers: [
    { provide: MY_MONTH_FORMATS, useValue: MY_YEAR_FORMATS },
    { provide: 'Constant', useValue: CONSTANT },
  ]
})
export class OjtRegistrationModule { }
