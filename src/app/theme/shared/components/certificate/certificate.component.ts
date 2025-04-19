import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-viewCertificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit {
  @Input() selectedDet;
  selectedCert: any = {}
  userDet: any = {};
  downloadLoader: boolean = false;
  constructor(private modalService: NgbModal,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log(this.selectedDet)
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    console.log(this.userDet.organization.logo)
  }
  closeModal() {
    this.modalService.dismissAll();

  }
  downloadCertificate() {
    this.downloadLoader = true;
    const DATA = document.getElementById('certModalBody');
    if (DATA) {
      html2canvas(DATA, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "transparent",
        scale: 2 // Increase scale for better quality
      }).then(canvas => {
        console.log(canvas);
        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('l', 'mm', 'a4');
        let width = PDF.internal.pageSize.getWidth();
        let height = PDF.internal.pageSize.getHeight();
        PDF.addImage(FILEURI, 'PNG', 0, 0, width, height, '', 'FAST');
        PDF.save(`${this.selectedDet.empName}_certificate.pdf`);
        this.downloadLoader = false;
      }).catch(error => {
        console.error('Error generating PDF: ', error);
        this.downloadLoader = false;
      });
    } else {
      console.error('Element not found!');
      this.downloadLoader = false;
    }
  }

  screenWidth: number = window.innerWidth;

  // Other component code

  // Update the screenWidth property on window resize
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;
    console.log(this.screenWidth);
    // Call the method to update the dynamic width
    // You can also use ChangeDetectorRef to trigger change detection if needed
    this.calculateDynamicWidth();
    this.cdr.detectChanges(); // Trigger change detection
    console.log(this.screenWidth)
  }

  calculateDynamicWidth(): string {
    // Your logic to determine the dynamic width based on screenWidth
    // For example, you can have different width values for different screen sizes
    console.log(this.screenWidth)
    if (this.screenWidth <= 600) {
      return '85%';
    } else if (this.screenWidth <= 800) {
      return '90%';
    } else if (this.screenWidth <= 992) {
      return '95%';
    } else {
      return '100%';
    }
  }
}
