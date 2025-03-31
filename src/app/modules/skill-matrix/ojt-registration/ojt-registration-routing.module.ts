import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OjtRegistrationComponent } from './ojt-registration.component';
//import { OjtPlanComponent } from './ojt-registration.component';
//import { AddOjtPlanComponent } from './add-ojt-registration/add-ojt-registration.component';

const routes: Routes = [
  {
    path: '',
    component: OjtRegistrationComponent
  },
  // {
  //   path: 'add-ojt-plan',
  //   component: AddOjtPlanComponent
  // }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OjtRegistrationRoutingModule { }
