import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { ReportComponent } from './report.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PlantvsactualcomplitionComponent } from './plantvsactualcomplition/plantvsactualcomplition.component';
import { AssessmentPassFailComponent } from './assessment-pass-fail/assessment-pass-fail.component';
import { EmployeeWisePlanComponent } from './employee-wise-plan/employee-wise-plan.component';
import { CellLevelAdherenceComponent } from './cell-level-adherence/cell-level-adherence.component';
import { PlantLevelAdherenceComponent } from './plant-level-adherence/plant-level-adherence.component';
import { CellwiseMultitaskingComponent } from './cellwise-multitasking/cellwise-multitasking.component';
import { PlantwiseMultitaskingComponent } from './plantwise-multitasking/plantwise-multitasking.component';
import { AverageTimeTakenComponent } from './average-time-taken/average-time-taken.component';
import { SkillMatrixCellwisePlantwiseComponent } from './skill-matrix-cellwise-plantwise/skill-matrix-cellwise-plantwise.component';
import { SkillGapCellwiseComponent } from './skill-gap-cellwise/skill-gap-cellwise.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [ReportComponent, PlantvsactualcomplitionComponent, AssessmentPassFailComponent, EmployeeWisePlanComponent, CellLevelAdherenceComponent, PlantLevelAdherenceComponent, CellwiseMultitaskingComponent, PlantwiseMultitaskingComponent, AverageTimeTakenComponent, SkillMatrixCellwisePlantwiseComponent, SkillGapCellwiseComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedModule,
    NgMultiSelectDropDownModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReportModule { }
