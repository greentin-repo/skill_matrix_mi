import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkillMatrixComponent } from './skill-matrix.component';
import { CertificateComponent } from './certificate/certificate.component';
import { StakeHolderComponent } from './stake-holder/stake-holder.component';
import { WorkStationComponent } from './work-station/work-station.component';
import { StageAndWorkflowComponent } from './stage-and-workflow/stage-and-workflow.component';

const routes: Routes = [
  {
    path: '',
    component: SkillMatrixComponent
  },
  {
    path: 'configuration',
    loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule)
  },
  
  {
    path: 'workflow',
    component: StageAndWorkflowComponent
  },
  {
    path: 'workstation',
    component: WorkStationComponent
  },
  {
    path: 'stakeholder',
    component: StakeHolderComponent
  },
  {
    path: 'reference',
    // component: ReferenceComponent
    loadChildren: () => import('./reference/reference.module').then(m => m.ReferenceModule)
  },
  {
    path: 'assessment',
    loadChildren: () => import('./assessment/assessment.module').then(m => m.AssessmentModule)
  },
  {
    path: 'ojtchecksheet',
    loadChildren: () => import('./ojt-check-sheet/ojt-check-sheet.module').then(m => m.OjtCheckSheetModule)
  },
  {
    path: 'certificates',
    component: CertificateComponent
  },
  {
    path: 'workflow',
    component: StageAndWorkflowComponent
  },
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillMatrixRoutingModule { }
