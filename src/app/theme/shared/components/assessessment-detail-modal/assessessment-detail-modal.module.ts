import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessessmentDetailModalComponent } from './assessessment-detail-modal.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import {CONSTANT} from './assessment.constant'

@NgModule({
  declarations: [AssessessmentDetailModalComponent],
  imports: [
    CommonModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    FormsModule,
    PerfectScrollbarModule,
  ],
  exports:[AssessessmentDetailModalComponent],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class AssessessmentDetailModalModule { }
