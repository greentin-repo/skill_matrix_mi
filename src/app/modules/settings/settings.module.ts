import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { CONSTANT } from './setting-constant';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class SettingsModule { }
