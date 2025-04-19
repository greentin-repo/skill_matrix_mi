import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddOjtCheckSheetRoutingModule } from './add-ojt-check-sheet-routing.module';
import { AddCheckSheetParameterComponent } from './add-check-sheet-parameter/add-check-sheet-parameter.component';
import { AddCheckSheetPointsComponent } from './add-check-sheet-points/add-check-sheet-points.component';
import { AddOjtCheckSheetComponent } from './add-ojt-check-sheet.component';
import { LoginInfoModule, TopBarModule } from 'src/app/theme/shared/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedModule } from 'src/app/theme/shared/shared.module';


@NgModule({
  declarations: [AddCheckSheetParameterComponent, AddCheckSheetPointsComponent, AddOjtCheckSheetComponent],
  imports: [
    CommonModule,
    SharedModule,
    AddOjtCheckSheetRoutingModule,
    TopBarModule,
    LoginInfoModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    PerfectScrollbarModule
  ]
})
export class AddOjtCheckSheetModule { }
