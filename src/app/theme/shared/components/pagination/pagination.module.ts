import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from './pagination.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbPaginationModule
  ],
  declarations: [PaginationComponent],
  exports: [PaginationComponent],
  providers: []
})
export class PaginationModule { }
