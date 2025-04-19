import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddOjtCheckSheetComponent } from './add-ojt-check-sheet.component';

const routes: Routes = [
  {
    path: '',
    component: AddOjtCheckSheetComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddOjtCheckSheetRoutingModule { }
