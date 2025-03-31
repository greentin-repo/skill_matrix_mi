import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentRoutingModule } from './assessment-routing.module';
import { AssessmentComponent } from './assessment.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LoginInfoModule, TopBarModule } from 'src/app/theme/shared/components';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CustomPipeModule } from 'src/app/shared/pipe/custom-pipe.module';
import { AssessmentDetailModule } from './assessment-detail/assessment-detail.module';
import { CONSTANT } from './assessment.constant';

@NgModule({
  declarations: [AssessmentComponent],
  imports: [
    CommonModule,
    AssessmentRoutingModule,
    SharedModule,
    TopBarModule,
    LoginInfoModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    CustomPipeModule,
    AssessmentDetailModule

  ],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class AssessmentModule { }
