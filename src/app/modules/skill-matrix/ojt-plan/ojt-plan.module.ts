import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { OjtPlanRoutingModule } from './ojt-plan-routing.module';
import { OjtPlanComponent } from './ojt-plan.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AddOjtPlanComponent } from './add-ojt-plan/add-ojt-plan.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { OjtRegisterComponent } from './ojt-register/ojt-register.component';
import { CONSTANT } from '../skill-matrix.constant';
import { MatSelectModule } from '@angular/material/select';

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
  declarations: [OjtPlanComponent, AddOjtPlanComponent, OjtRegisterComponent],
  imports: [
    CommonModule,
    OjtPlanRoutingModule,
    SharedModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MomentDateModule,
    MatSelectModule
  ],
  providers: [
    { provide: MY_MONTH_FORMATS, useValue: MY_YEAR_FORMATS },
    { provide: 'Constant', useValue: CONSTANT },
  ]
})
export class OjtPlanModule { }
