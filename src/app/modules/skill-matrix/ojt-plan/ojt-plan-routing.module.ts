import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OjtPlanComponent } from './ojt-plan.component';
import { AddOjtPlanComponent } from './add-ojt-plan/add-ojt-plan.component';

const routes: Routes = [
  {
    path: '',
    component: OjtPlanComponent
  },
  {
    path: 'add-ojt-plan',
    component: AddOjtPlanComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OjtPlanRoutingModule { }
