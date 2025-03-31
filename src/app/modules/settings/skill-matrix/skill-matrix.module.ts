import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkillMatrixRoutingModule } from './skill-matrix-routing.module';
import { SkillMatrixComponent } from './skill-matrix.component';
import { WorkStationComponent } from './work-station/work-station.component';
import { StakeHolderComponent } from './stake-holder/stake-holder.component';
import { CertificateComponent } from './certificate/certificate.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { StageAndWorkflowComponent } from './stage-and-workflow/stage-and-workflow.component';
import { CustomPipeModule } from 'src/app/shared/pipe/custom-pipe.module';
import { ConfigurationComponent } from './configuration/configuration.component';
import { AssessmentConfigurationComponent } from './configuration/assessment-configuration/assessment-configuration.component';

@NgModule({
  declarations: [SkillMatrixComponent, StakeHolderComponent, CertificateComponent, WorkStationComponent, StageAndWorkflowComponent],
  imports: [
    CommonModule,
    SkillMatrixRoutingModule,
    SharedModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    CustomPipeModule,
  ]
})
export class SkillMatrixModule { }
