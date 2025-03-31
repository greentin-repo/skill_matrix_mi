import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkillMatrixRoutingModule } from './skill-matrix-routing.module';
import { SkillMatrixComponent } from './skill-matrix.component';
import { ActionsComponent } from './actions/actions.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { WorkforceDeploymentComponent } from './workforce-deployment/workforce-deployment.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CustomPipeModule } from 'src/app/shared/pipe/custom-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CONSTANT } from './skill-matrix.constant';
import { AddViewWorkforceComponent } from './workforce-deployment/add-view-workforce/add-view-workforce.component';

import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
// import { AssessessmentDetailModalComponent } from 'src/app/theme/shared/components/assessessment-detail-modal/assessessment-detail-modal.component';

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
  declarations: [SkillMatrixComponent, ActionsComponent, AssessmentsComponent, CertificatesComponent, WorkforceDeploymentComponent, AddViewWorkforceComponent],
  imports: [
    CommonModule,
    SkillMatrixRoutingModule,
    SharedModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    CustomPipeModule,
    MatInputModule,
    MatDatepickerModule,
    MomentDateModule
  ],
  providers: [
    { provide: 'Constant', useValue: CONSTANT },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class SkillMatrixModule { }
