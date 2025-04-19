import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkillMatrixComponent } from './skill-matrix.component';
import { ActionsComponent } from './actions/actions.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { OjtPlanComponent } from './ojt-plan/ojt-plan.component';
import { WorkforceDeploymentComponent } from './workforce-deployment/workforce-deployment.component';
import { CertificatesComponent } from './certificates/certificates.component';

const routes: Routes = [
  {
    path: '',
    component: SkillMatrixComponent
  },
  {
    path: 'home',
    component: SkillMatrixComponent
  },
  {
    path: 'actions',
    component: ActionsComponent
  },
  {
    path: 'ojt_plan',
    loadChildren: () => import('./ojt-plan/ojt-plan.module').then(m => m.OjtPlanModule)
  },
  {
    path: 'ojt_registration',
    loadChildren: () => import('./ojt-registration/ojt-registration.module').then(m => m.OjtRegistrationModule)
  },
  {
    path: 'workforce_Deployment',
    component: WorkforceDeploymentComponent
  },
  {
    path: 'assessments',
    component: AssessmentsComponent
  },
  {
    path: 'certificates',
    component: CertificatesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillMatrixRoutingModule { }
