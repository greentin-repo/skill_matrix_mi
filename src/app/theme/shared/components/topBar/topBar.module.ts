import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from './topBar.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    NgbDropdownModule
  ],
  declarations: [TopBarComponent],
  exports: [TopBarComponent],
  providers: []
})
export class TopBarModule { }
