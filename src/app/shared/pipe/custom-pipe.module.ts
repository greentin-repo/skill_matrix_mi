import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterByPipe } from './filterBy.pipe';
import { OrderByPipe } from './order-by.pipe';



@NgModule({
  declarations: [FilterByPipe, OrderByPipe],
  exports: [FilterByPipe, OrderByPipe],
  imports: [
    CommonModule
  ]
})
export class CustomPipeModule { }
