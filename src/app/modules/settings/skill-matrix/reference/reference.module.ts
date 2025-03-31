import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferenceRoutingModule } from './reference-routing.module';
import { ReferenceModelComponent } from './reference-model/reference-model.component';
import { ReferenceGapReasonComponent } from './reference-gap-reason/reference-gap-reason.component';
import { ReferenceShiftComponent } from './reference-shift/reference-shift.component';
import { ReferenceComponent } from './reference.component';
import { ReferenceLevelComponent } from './reference-level/reference-level.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [ReferenceComponent, ReferenceModelComponent, ReferenceGapReasonComponent, ReferenceShiftComponent, ReferenceLevelComponent],
  imports: [
    CommonModule,
    ReferenceRoutingModule,
    SharedModule,
    NgMultiSelectDropDownModule,
    NgbPaginationModule
  ]
})
export class ReferenceModule { }
