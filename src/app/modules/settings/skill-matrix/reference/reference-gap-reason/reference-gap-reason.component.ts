import { Component, OnInit } from '@angular/core';
import { SkillMatrixService } from '../../skill-matrix.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AlertService } from 'src/app/theme/shared/components';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';
@Component({
  selector: 'app-reference-gap-reason',
  templateUrl: './reference-gap-reason.component.html',
  styleUrls: ['./reference-gap-reason.component.scss']
})

export class ReferenceGapReasonComponent implements OnInit {
  searchDet: any = {};
  submitSpinner: boolean = false;
  formdata: FormGroup;
  filterData: FormGroup;
  refGapReasonList: any = [];
  SingleBranchDropdownSettings: IDropdownSettings = {};
  branchAccessList: any = [];
  referenceGapReason: any = {};
  userDet: any = {};
  reqBody: any;
  addEditReferenceGapReason: any = {};
  modalTitle: string;
  isFormSubmitted: boolean = false;
  gapReason: any;
  newGapReason: any;
  isGapListLoading: boolean = false;
  disableReferGap: boolean;
  sorting: any;
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0
  }

  constructor(
    modalConfig: NgbModalConfig,
    private skillMatrixService: SkillMatrixService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private fb: FormBuilder) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'))
    this.getBranchAccessList();
    this.SingleBranchDropdownSettings = {
      singleSelection: true,
      idField: 'branchId',
      textField: 'branchName',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.formdata = this.fb.group({
      // branch: new FormControl('', Validators.required),
      gapReason: new FormControl('', Validators.required)
    });
    this.resetForm();
  }

  getBranchAccessList() {
    this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((response: any) => {
      if (response.result) {
        if (response.branchAccessList != null && response.branchAccessList.length > 0) {
          /* Use For Add Screen */
          this.branchAccessList = response.branchAccessList;
          this.branchAccessList = this.setArray(this.branchAccessList, 'branchId', 'branchName');
          this.branchAccessList = this.sortFunction(this.branchAccessList, 'name');
          this.referenceGapReason.branch = [this.branchAccessList[0]];
        } else {
          /* Use For Add Screen */
          this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
        }
      } else {
        /* Use For Add Screen */
        this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
      }
      if (this.branchAccessList.length > 0) {
        this.referenceGapReason.branch = [this.branchAccessList[0]];
      }
      this.onChangeBranch(this.branchAccessList[0]);
    })
  }
  onChangeBranch(event: any) {
    if(event){
    this.referenceGapReason.branchId = event.branchId;
    this.disableReferGap = true;
    this.getRefGapReasonList();
    }
    else{
      this.disableReferGap = false;
      this.refGapReasonList = [];
    }
  }

  getRefGapReasonList() {
    this.isGapListLoading = true;
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
      'branchId': this.referenceGapReason.branchId
    }
    if (this.searchDet.searchInput && this.searchDet.searchInput != '') {
      req.search = this.searchDet.searchInput;
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active;
        req.orderType = this.sorting.direction.toUpperCase();
      }
    }
    console.log(req);
    this.skillMatrixService.getGapReasonListData('apis/sm/getGapReasonList', req).subscribe((response: any) => {
      if (response.result) {
        this.isGapListLoading = false;
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.refGapReasonList = response.dataList;
          this.staticPagination.listLength = this.refGapReasonList.length;
        } else {
          this.refGapReasonList = [];
          this.staticPagination.listLength = this.refGapReasonList.length;
          this.staticPagination.total = this.refGapReasonList.length;
        }
        // this.refGapReasonList = response.dataList
      } else {
        this.refGapReasonList = []
        this.staticPagination.listLength = this.refGapReasonList.length;
        this.staticPagination.total = this.refGapReasonList.length;
        this.isGapListLoading = false;
      }
    }, (error: any) => {
      this.refGapReasonList = [];
      this.isGapListLoading = false;

    })
  }

  openRefGapReasonModal(modal, popupClass) {
    this.modalTitle = "Add Gap Reason"
    this.addEditReferenceGapReason.branch = '';
    this.addEditReferenceGapReason.gapReason = '';
    this.resetForm();
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }
  resetForm() {
    this.formdata.reset();
    this.isFormSubmitted = false;
  }

  updateRefGapReason(modal, popupClass, refGapData) {
    this.modalTitle = "Update Gap Reason"
    this.addEditReferenceGapReason.gapReason = refGapData.reason;
    this.addEditReferenceGapReason.gapId = refGapData.id;
    for (let i = 0; i < this.branchAccessList.length; i++) {
      if (this.branchAccessList[i].branchId == refGapData.branchId) {
        this.addEditReferenceGapReason.branch = [this.branchAccessList[i]];
      }
    }
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }

  saveReferenceGapReason(formdata) {
    this.isFormSubmitted = true
    if (formdata.valid) {
      // for (let index = 0; index < this.refGapReasonList.length; index++) {
      //   this.gapReason = this.refGapReasonList[index].reason.toLowerCase();
      //   this.newGapReason = this.addEditReferenceGapReason.gapReason.toLowerCase();
      //   if (this.gapReason == this.newGapReason) {
      //     this.alertService.error("Gap reason already exist.");
      //     return;
      //   }
      // }
      if (this.addEditReferenceGapReason.gapId == undefined || this.addEditReferenceGapReason.gapId == '') {
        if (this.addEditReferenceGapReason.branch != null && this.addEditReferenceGapReason.branch.length > 0) {
          for (let i = 0; i < this.addEditReferenceGapReason.branch.length; i++) {
            this.addEditReferenceGapReason.branchId = this.addEditReferenceGapReason.branch[i].branchId;
          }
        }
        this.reqBody = {
          // "branchId": this.addEditReferenceGapReason.branchId,
          "branchId": this.referenceGapReason.branch[0].branchId,
          "reason": this.addEditReferenceGapReason.gapReason,
          "isActive": true,
          "createdBy": this.userDet.empId
        }
        this.skillMatrixService.saveReferenceGapReason('apis/sm/saveGapReason', this.reqBody).subscribe((response: any) => {
          console.log(response)
          if (response.result) {
            this.modalService.dismissAll();
            this.alertService.success("Gap reason added successfully");
            this.addEditReferenceGapReason.branch = '';
            this.addEditReferenceGapReason.gapReason = '';
            this.getRefGapReasonList();
          } else {
            if (response.statusCode == 100) {
              this.alertService.error(response.reason);
            } else {
              this.alertService.error('Error occurred while adding data. Please try again');
            }
          }
        })
      } else {
        if (this.addEditReferenceGapReason.branch != null && this.addEditReferenceGapReason.branch.length > 0) {
          for (let i = 0; i < this.addEditReferenceGapReason.branch.length; i++) {
            this.addEditReferenceGapReason.branchId = this.addEditReferenceGapReason.branch[i].branchId;
          }
        }
        // for (let index = 0; index < this.refGapReasonList.length; index++) {
        //   this.gapReason = this.refGapReasonList[index].modelName.toLowerCase();
        //   this.newGapReason = this.addEditReferenceGapReason.gapReason.toLowerCase();
        //   if (this.gapReason == this.newGapReason) {
        //     this.alertService.error("Gap reason already exist.");
        //     return;
        //   }
        // }
        this.reqBody = {
          "reasonId": this.addEditReferenceGapReason.gapId,
          "branchId": this.addEditReferenceGapReason.branchId,
          "reason": this.addEditReferenceGapReason.gapReason,
          "updatedBy": this.userDet.empId
        }
        this.skillMatrixService.updateGapDetails('apis/sm/updateGapReason', this.reqBody).subscribe((response: any) => {
          if (response.result) {
            this.modalService.dismissAll();
            this.alertService.success("Gap reason updated successfully");
            this.addEditReferenceGapReason.branch = '';
            this.addEditReferenceGapReason.gapReason = '';
            this.addEditReferenceGapReason.gapId = '';
            this.getRefGapReasonList();
          } else {
            if (response.statusCode == 100) {
              this.alertService.error(response.reason);
            } else {
              this.alertService.error('Error occurred while updating data. Please try again');
            }
          }
        })
      }
    }
  }

  removeRefGapReason(RefGapReasonData) {
    Swal.fire({
      title: 'Are You Sure!',
      text: 'You want remove this gap reason ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7044cd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Remove it',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.reqBody = {
          "reasonId": RefGapReasonData.id,
          "updatedBy": this.userDet.empId
        }
        this.skillMatrixService.removeRefGapReason('apis/sm/deleteGapReason', this.reqBody).subscribe((response: any) => {
          console.log(response)
          if (response.result) {
            this.alertService.success("Gap reason removed successfully");
            this.getRefGapReasonList()
          } else {
            if (response.statusCode == 100) {
              this.alertService.error(response.reason);
            } else {
              this.alertService.error('Error occurred while removing data. Please try again');
            }
          }
        })
      } else { }
    })
  }
  /* 
   Load More Pagination next page Data
   Author : Simran
   @Date : 08/09/2023
 */
  loadMore(ev: any) {
    this.staticPagination = ev;
    this.refGapReasonList = [];
    this.isGapListLoading = true;
    this.getRefGapReasonList()
  }
  /*
   Common function for searching
   Author: Simran
   Date : 07/09/2023
*/
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
      this.getRefGapReasonList();
    }
    else {
      this.getRefGapReasonList()
    }
  }
  clearPagination() {
    this.staticPagination = {
      total: 0,
      page: 1,
      maxSize: 5,
      itemsPerPage: 10,
      totalPages: 0,
      listLength: 0
    }
  }
  /*
     Common function for sorting
     Author: Simran
     Date : 07/09/2023
 */
  sortData(sort: Sort) {
    this.sorting = sort;
    console.log(this.sorting);
    this.getRefGapReasonList()
  }
  
 getSortFunction(array, fieldToSort) { 
  if (array && Array.isArray(array) && array.length > 0) {
    if ( fieldToSort === "dept" || fieldToSort === "level" ) {
      array.sort(function (a, b) {
        var nameA = a.branchName ? a.branchName.toUpperCase() : "";
        var nameB = b.branchName ? b.branchName.toUpperCase() : "";
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    }
  }  
  return array;
}
sortFunction(array, key) {
  if (array != null && array.length > 0) {
    array.sort(function (a, b) {
      var nameA = (!Number(a[key])) ? a[key].toUpperCase() : a[key];
      var nameB = (!Number(b[key])) ? b[key].toUpperCase() : b[key];
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }
  return array;
}
setArray(array, key1, key2) {
  let tmpArray = [];
  if (array != null && array.length > 0) {
    for (const element of array) {
      element.id = element[key1];
      element.name = element[key2];
      tmpArray.push(element);
    }
  }
  return tmpArray;
}
}
