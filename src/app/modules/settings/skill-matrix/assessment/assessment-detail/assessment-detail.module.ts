import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentDetailRoutingModule } from './assessment-detail-routing.module';
import { AssessmentDetailComponent } from './assessment-detail.component';
import { SharedModule } from '../../../../../theme/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CONSTANT } from '../assessment.constant';


@NgModule({
  declarations: [AssessmentDetailComponent],
  imports: [
    CommonModule,
    AssessmentDetailRoutingModule,
    SharedModule,
    NgMultiSelectDropDownModule
  ],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class AssessmentDetailModule { }
