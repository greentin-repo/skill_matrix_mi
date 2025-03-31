import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiKitRoutingModule } from './ui-kit-routing.module';
import { UiKitComponent } from './ui-kit.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [UiKitComponent],
  imports: [
    CommonModule,
    UiKitRoutingModule,
    SharedModule,
    NgMultiSelectDropDownModule
  ]
})
export class UiKitModule { }
