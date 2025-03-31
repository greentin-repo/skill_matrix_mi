import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MySkillingRoutingModule } from './my-skilling-routing.module';
import { MySkillingComponent } from './my-skilling.component';
import { ActionsComponent } from './actions/actions.component';
import { SkillMatrixComponent } from './skill-matrix/skill-matrix.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { StageFourComponent } from './actions/stage-four/stage-four.component';
import { StageFiveComponent } from './actions/stage-five/stage-five.component';
import { ActionDetCycleComponent } from './actions/action-det-cycle/action-det-cycle.component';
import { CustomPipeModule } from 'src/app/shared/pipe/custom-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionDetComponent } from './actions/stage-one/stage-one.component';
import { StageTwoComponent } from './actions/stage-two/stage-two.component';
import { StageThreeComponent } from './actions/stage-three/stage-three.component';
import { StageTwoVerificationComponent } from './actions/stage-two-verification/stage-two-verification.component';
import { SkillMatrixDetailsComponent } from './skill-matrix/skill-matrix-details/skill-matrix-details.component';
@NgModule({
  declarations: [MySkillingComponent, ActionsComponent, SkillMatrixComponent, SkillMatrixDetailsComponent,CertificatesComponent, AssessmentsComponent, StageFourComponent, StageFiveComponent, ActionDetCycleComponent, ActionDetComponent, StageTwoComponent, StageTwoVerificationComponent, StageThreeComponent],
  imports: [
    CommonModule,
    MySkillingRoutingModule,
    SharedModule,
    NgMultiSelectDropDownModule,
    CustomPipeModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class MySkillingModule { }
