import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OjtCheckSheetRoutingModule } from './ojt-check-sheet-routing.module';
import { OjtCheckSheetComponent } from './ojt-check-sheet.component';
import { LoadingModule, LoginInfoModule, TopBarModule } from 'src/app/theme/shared/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PaginationModule } from "../../../../theme/shared/components/pagination/pagination.module";
import { SharedModule } from 'src/app/theme/shared/shared.module';


@NgModule({
    declarations: [OjtCheckSheetComponent],
    imports: [
        CommonModule,
        SharedModule,
        OjtCheckSheetRoutingModule,
        TopBarModule,
        LoginInfoModule,
        FormsModule,
        NgMultiSelectDropDownModule,
        ReactiveFormsModule,
        PaginationModule,
        SharedModule,
        LoadingModule
    ]
})
export class OjtCheckSheetModule { }
