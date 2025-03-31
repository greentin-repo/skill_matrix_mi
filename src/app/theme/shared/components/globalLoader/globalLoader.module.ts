import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalLoaderComponent } from './globalLoader.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [GlobalLoaderComponent],
  exports: [GlobalLoaderComponent],
  providers: []
})
export class GlobalLoaderModule { }
