import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OjtCheckSheetComponent } from './ojt-check-sheet.component';

const routes: Routes = [
  {
    path: '',
    component: OjtCheckSheetComponent
  },
  {
    path: 'add-ojt-check-sheet',
    loadChildren: () => import('./add-ojt-check-sheet/add-ojt-check-sheet.module').then(m => m.AddOjtCheckSheetModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OjtCheckSheetRoutingModule { }
