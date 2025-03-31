import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './loader.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LoadingComponent],
  exports: [LoadingComponent],
  providers: []
})
export class LoadingModule { }
