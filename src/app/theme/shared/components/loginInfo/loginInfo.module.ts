import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginInfoComponent } from './loginInfo.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    NgbDropdownModule
  ],
  declarations: [LoginInfoComponent],
  exports: [LoginInfoComponent],
  providers: []
})
export class LoginInfoModule { }
