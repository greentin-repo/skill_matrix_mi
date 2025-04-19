import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AssessmentConfigurationComponent } from './assessment-configuration/assessment-configuration.component';
import { StagelabelComponent } from './stagelabel/stagelabel.component';
import { CustomPipeModule } from 'src/app/shared/pipe/custom-pipe.module';
import { ConfigurationComponent } from './configuration.component';
import { LevelComponent } from './level/level.component';
import { ReferenceGapReasonComponent } from './reference-gap-reason/reference-gap-reason.component';
import { ReferenceModelComponent } from './reference-model/reference-model.component';
import { ReferenceShiftComponent } from './reference-shift/reference-shift.component';
import { DocumentNumberComponent } from './document-number/document-number.component';//   Aniket :- Get Document modal

@NgModule({
  declarations: [ConfigurationComponent,AssessmentConfigurationComponent,StagelabelComponent, LevelComponent, ReferenceGapReasonComponent, ReferenceModelComponent, ReferenceShiftComponent, DocumentNumberComponent],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    SharedModule,
    NgMultiSelectDropDownModule,
    CustomPipeModule
  ]
})
export class ConfigurationModule { }
