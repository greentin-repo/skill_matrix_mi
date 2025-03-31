import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertModule, BreadcrumbModule, DateRangePickerModule, TopBarModule, PaginationModule, LoadingModule, LoginInfoModule, GlobalLoaderModule} from './components';
import { AssessessmentDetailModalModule } from './components';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ClickOutsideModule } from 'ng-click-outside';

import { SpinnerComponent } from './components/spinner/spinner.component';
import { MatSortModule } from '@angular/material/sort';
import { CertificateModule } from './components/certificate/certificate.module';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    BreadcrumbModule,
    ClickOutsideModule,
    DateRangePickerModule,
    TopBarModule,
    PaginationModule,
    LoadingModule,
    GlobalLoaderModule,
    LoginInfoModule,
    MatSortModule,
    CertificateModule,
    AssessessmentDetailModalModule

  ],
  exports: [
    CommonModule,
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    BreadcrumbModule,
    ClickOutsideModule,
    SpinnerComponent,
    DateRangePickerModule,
    TopBarModule,
    PaginationModule,
    LoadingModule,
    GlobalLoaderModule,
    LoginInfoModule,
    MatSortModule,
    CertificateModule,
    AssessessmentDetailModalModule

  ],
  declarations: [
    SpinnerComponent

  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule { }
