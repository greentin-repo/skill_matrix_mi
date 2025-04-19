import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDirective } from './custom.directive';



@NgModule({
  declarations: [CustomDirective],
  exports: [CustomDirective],
  imports: [
    CommonModule
  ]
})
export class CustomDirectiveModule { }
