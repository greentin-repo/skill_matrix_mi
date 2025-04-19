import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkillMatrixComponent } from './skill-matrix.component';

const routes: Routes = [
  {
    path: '',
    component: SkillMatrixComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillMatrixRoutingModule { }
