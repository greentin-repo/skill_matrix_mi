import { Component, OnInit, Input, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { SkillMatrixService } from '../../skill-matrix.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/theme/shared/components';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-document-number',
  templateUrl: './document-number.component.html',
  styleUrls: ['./document-number.component.scss']
})
export class DocumentNumberComponent implements OnInit {
  @Input() branchId: any;
  @ViewChild('DocInputField') DocInputField: ElementRef;

  modalTitle: string;
  addEditReferenceDocName: any = {};
  formdata: FormGroup;
  isFormSubmitted: boolean;
  documentList: any;
  currentlyEditedDocument: any = null;
  currentlyEditedDocumentId: number | null = null;

  constructor(
    private skillMatrixService: SkillMatrixService,
    modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.branchId && !changes.branchId.firstChange) {
      console.log(changes.branchId.currentValue[0])
      this.branchId = changes.branchId.currentValue[0].id;
      this.getDocumentList(this.branchId);
    }
  }
  ngOnInit(): void {
    if (this.branchId && this.branchId != null) {
      this.branchId = this.branchId[0].id;
      this.getDocumentList(this.branchId);
    }
    this.formdata = this.fb.group({
      docName: new FormControl('', Validators.required)
    });
    this.resetForm();
  }
  // Aniket :- Get Document List 
  getDocumentList(id) {
    console.log(id);
    var req = {
      "branchId": id
    }
    this.skillMatrixService.getDocumentList('apis/sm/getDocName', req).subscribe((response: any) => {
      if (response.result) {
        console.log(response);
        if (response.data != null) {
          this.documentList = [response.data]
        } else {
          this.documentList = []
        }
      }
      else {
        this.documentList = []
      }
    })
  }
  // Aniket :- Update Document Name 
  updateDocumentNumber(doc) {
    var req = {
      "branchId": doc.branchId,
      "id": doc.id,
      "docName": doc.docName,
    }
    this.skillMatrixService.updateDocumentNumber('apis/sm/updateDocName', req).subscribe((response: any) => {
      if (response.result) {
        console.log()
        this.alertService.success("Document name updated successfully");
        this.getDocumentList(this.branchId);
      }
      else {
        this.alertService.error('Error occurred while adding data. Please try again');
      }
    })
  }
  // Aniket :- Save Document Name 
  saveDocument(formdata) {
    this.isFormSubmitted = true;
    if (formdata.valid) {
      const trimmedDoc = this.addEditReferenceDocName.doc?.trim(); 
      if (trimmedDoc && trimmedDoc !== '') {
        this.addEditReferenceDocName.docName = trimmedDoc;
      } else {
        this.alertService.error('Enter a document name');
        return;
      }
      if (this.addEditReferenceDocName.branch != null && this.addEditReferenceDocName.branch != undefined) {
        this.addEditReferenceDocName.branchId = this.addEditReferenceDocName.branch;
      }
      else {
        this.alertService.error('Please select branch');
        return
      }
      let reqBody = {
        "branchId": this.addEditReferenceDocName.branchId,
        "docName": this.addEditReferenceDocName.docName,
      }
      this.skillMatrixService.saveDocument('apis/sm/saveDocName', reqBody).subscribe((response: any) => {
        if (response.result) {
          this.modalService.dismissAll();
          this.alertService.success("Document name added successfully");
          this.addEditReferenceDocName.branch = '';
          this.addEditReferenceDocName.modelName = '';
          this.getDocumentList(this.addEditReferenceDocName.branchId)
        }
        else {
          if (response.statusCode == 100) {
            this.alertService.error(response.reason);
            this.getDocumentList(this.addEditReferenceDocName.branchId)
          } else {
            this.alertService.error('Error occurred while adding data. Please try again');
            this.getDocumentList(this.addEditReferenceDocName.branchId)
          }
        }
      })
    }
  }
  // Aniket :- Delet Document Name 
  deleteDocument(document) {
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this document name ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7044cd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Remove It',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(document);
        var reqBody = {
          "branchId": document.branchId,
          "id": document.id,

        }
        this.skillMatrixService.deleteDocument('apis/sm/deleteDocName', reqBody).subscribe((response: any) => {
          if (response.result) {
            this.alertService.success("Document name deleted successfully");
            this.getDocumentList(document.branchId)
          } else {
            if (response.statusCode == 100) {
              this.alertService.error(response.reason);
              this.getDocumentList(document.branchId)
            } else {
              this.alertService.error('Error occurred while deleting data. Please try again');
              this.getDocumentList(document.branchId)
            }

          }

        })
      }
    })
  }
  // Aniket :- Show button 
  toggleEdit(Doc) {
    this.cancelEdit(this.currentlyEditedDocument);
    this.currentlyEditedDocumentId = Doc.id;
    this.currentlyEditedDocument = Doc;
    this.currentlyEditedDocument.isEditable = true;
    this.currentlyEditedDocument.originalDocLabel = this.currentlyEditedDocument.docName;

    setTimeout(() => {
      this.DocInputField.nativeElement.focus();
    }, 0);
  }
  // Aniket :- Cancel button
  cancelEdit(Doc) {
    if (Doc) {
      Doc.docName = this.currentlyEditedDocument.originalDocLabel;
      Doc.isEditable = false;
    }
    this.currentlyEditedDocumentId = null;
    this.currentlyEditedDocument = null;
    this.DocInputField = null;
  }
  // Aniket :- Show modal for add document 
  addRefShiftNoOpen(modal, popupClass) {
    console.log(this.branchId);
    this.modalTitle = "Add Document"
    this.addEditReferenceDocName.branch = this.branchId;
    this.addEditReferenceDocName.doc = '';
    this.resetForm();
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }
  resetForm() {
    this.formdata.reset();
    this.isFormSubmitted = false;
  }

}
