import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MySkillingComponent } from './my-skilling.component';
import { ActionsComponent } from './actions/actions.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { SkillMatrixComponent } from './skill-matrix/skill-matrix.component';

const routes: Routes = [
  {
    path: '',
    component: MySkillingComponent
  },
  {
    path: 'actions',
    component: ActionsComponent
  },
  {
    path: 'assessments',
    component: AssessmentsComponent
  },
  {
    path: 'certificates',
    component: CertificatesComponent
  },
  {
    path: 'skillMatrix',
    component: SkillMatrixComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MySkillingRoutingModule { }
