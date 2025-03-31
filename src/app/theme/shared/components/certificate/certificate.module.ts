import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateComponent } from './certificate.component';



@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CertificateComponent],
  exports:[CertificateComponent],
})
export class CertificateModule { }
