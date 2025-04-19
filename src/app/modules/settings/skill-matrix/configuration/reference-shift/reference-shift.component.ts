import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SkillMatrixService } from '../../skill-matrix.service';
import { AlertService } from 'src/app/theme/shared/components';
import Swal from 'sweetalert2';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-reference-shift',
  templateUrl: './reference-shift.component.html',
  styleUrls: ['./reference-shift.component.scss']
})
export class ReferenceShiftComponent implements OnInit {
  searchDet: any = {};
  referenceShiftNo: any = {}
  SingleBranchDropdownSettings: IDropdownSettings = {};
  userDet: any = {};
  addEditReferenceShiftNo: any = {}
  branchAccessList: any = [];
  formdata: FormGroup;
  formSubmitted = false;
  filterData: FormGroup;
  refShiftNoData: any;
  modalTitle: any;
  reqBody: any;
  isFormSubmitted: boolean = false;
  shiftNumber: any;
  newShiftNumber: any;
  isShiftListLoading: boolean = false;
  isEditing: boolean = false;
  disableReferShift: boolean;
  sorting: any;
  @Input() branchId: any;
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
    private modalService: NgbModal,
    private alertService: AlertService,
    private fb: FormBuilder) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.branchId && !changes.branchId.firstChange) {
      this.getShiftNoData() ;
    }
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
      shiftNo: new FormControl('', Validators.required)
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
          console.log(this.branchAccessList);
          this.branchAccessList = this.sortFunction(this.branchAccessList, 'name');
          this.referenceShiftNo.branch = [this.branchAccessList[0]];

        } else {
          /* Use For Add Screen */
          this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
        }
      } else {
        /* Use For Add Screen */
        this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
      }
      if (this.branchAccessList.length > 0) {
        this.referenceShiftNo.branch = [this.branchAccessList[0]];
      }
      this.onChangeBranch(this.branchAccessList[0]);
    })
  }
  onChangeBranch(event: any) {
    if (event) {
      this.disableReferShift = true
      this.referenceShiftNo.branchId = event.branchId;
      this.getShiftNoData();
    }
    else {
      this.disableReferShift = false;
      this.refShiftNoData = [];
    }
  }

  getShiftNoData() {
    this.isShiftListLoading = true;
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
      // 'branchId': this.referenceShiftNo.branchId
    }
    if (this.searchDet.branchId != '') {
      req.branchId = this.searchDet.branchId;
    }
    if (this.branchId) {
      console.log(this.branchId[0].id);
      req.branchId = this.branchId[0].id;
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
    this.skillMatrixService.getShiftNoData('apis/sm/getShiftList', req).subscribe((response: any) => {
      if (response.result) {
        this.isShiftListLoading = false;
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.refShiftNoData = response.dataList;
          this.staticPagination.listLength = this.refShiftNoData.length;
        } else {
          this.refShiftNoData = [];
          this.staticPagination.listLength = this.refShiftNoData.length;
          this.staticPagination.total = this.refShiftNoData.length;
        }
        // this.refShiftNoData = response.dataList;
      } else {
        this.refShiftNoData = [];
        this.staticPagination.listLength = this.refShiftNoData.length;
        this.staticPagination.total = this.refShiftNoData.length;
        this.isShiftListLoading = false;
      }
    }, (error: any) => {
      this.refShiftNoData = [];
      this.isShiftListLoading = false;


    })
  }

  addRefShiftNoOpen(modal, popupClass) {
    this.isEditing = false;
    this.modalTitle = "Add Shift"
    this.addEditReferenceShiftNo.branch =this.branchId;
    this.addEditReferenceShiftNo.shiftName = '';
    this.resetForm();
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }
  resetForm() {
    this.formdata.reset();
    this.isFormSubmitted = false;
  }

  editRefShiftNo(modal, popupClass, refShiftData) {
    this.isEditing = true;
    this.modalTitle = "Update Shift"
    this.addEditReferenceShiftNo.shiftName = refShiftData.shiftName;
    this.addEditReferenceShiftNo.shiftId = refShiftData.id;
    for (let i = 0; i < this.branchAccessList.length; i++) {
      if (this.branchAccessList[i].branchId == refShiftData.branchId) {
        this.addEditReferenceShiftNo.branch = [this.branchAccessList[i]];
      }
    }
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }

  saveReferenceShiftNo(formdata) {
    this.isFormSubmitted = true;
    if (formdata.valid) {

      if (this.addEditReferenceShiftNo.shiftId == undefined || this.addEditReferenceShiftNo.shiftId == '') {
        if (this.addEditReferenceShiftNo.branch != null && this.addEditReferenceShiftNo.branch.length > 0) {
          for (let i = 0; i < this.addEditReferenceShiftNo.branch.length; i++) {
            this.addEditReferenceShiftNo.branchId = this.addEditReferenceShiftNo.branch[i].branchId;
          }
        }
        this.reqBody = {
          "branchId": this.addEditReferenceShiftNo.branch[0].id,
          // "branchId": this.referenceShiftNo.branch[0].branchId,
          "shiftName": this.addEditReferenceShiftNo.shiftName,
          "isActive": true,
          "updatedBy": this.userDet.empId
        }
        console.log(this.reqBody)
        this.skillMatrixService.saveReferenceShiftNo('apis/sm/saveShiftDetails', this.reqBody).subscribe((response: any) => {
          console.log(response)
          if (response.result) {
            this.modalService.dismissAll();
            this.alertService.success("New shift added successfully");
            this.addEditReferenceShiftNo.branch = '';
            this.addEditReferenceShiftNo.modelName = '';
            this.getShiftNoData();
          }
          else {
            if (response.statusCode == 100) {
              this.alertService.error(response.reason);
            } else {
              this.alertService.error('Error occurred while adding data. Please try again');
            }
          }
        })
      } else {
        if (this.addEditReferenceShiftNo.shiftId != null && this.addEditReferenceShiftNo.branch.length > 0) {
          for (let i = 0; i < this.addEditReferenceShiftNo.branch.length; i++) {
            this.addEditReferenceShiftNo.branchId = this.addEditReferenceShiftNo.branch[i].branchId;
          }
        }
        this.reqBody = {
          "shiftId": this.addEditReferenceShiftNo.shiftId,
          "branchId": this.addEditReferenceShiftNo.branchId,
          "shiftName": this.addEditReferenceShiftNo.shiftName,
          "updatedBy": this.userDet.empId
        }
        this.skillMatrixService.updateShiftDetails('apis/sm/updateShiftDetails', this.reqBody).subscribe((response: any) => {
          console.log(response)
          if (response.result) {
            this.modalService.dismissAll();
            this.alertService.success("Shift updated successfully");
            this.addEditReferenceShiftNo.branch = '';
            this.addEditReferenceShiftNo.modelName = '';
            this.addEditReferenceShiftNo.modelId = '';
            this.getShiftNoData();
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

  removeRefShift(RefShiftData) {
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this shift ?',
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
        this.reqBody = {
          "shiftId": RefShiftData.id,
          "updatedBy": this.userDet.empId
        }
        console.log(this.reqBody)
        this.skillMatrixService.deleteShiftDetails('apis/sm/deleteShiftDetails', this.reqBody).subscribe((response: any) => {
          if (response.result) {
            this.alertService.success("Shift removed successfully");
            this.getShiftNoData();
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
    this.refShiftNoData = [];
    this.isShiftListLoading = true;
    this.getShiftNoData()
  }

  /*
   Common function for sorting
   Author: Simran
   Date : 07/09/2023
*/
  sortData(sort: Sort) {
    this.sorting = sort;
    this.getShiftNoData()
  }
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
      this.getShiftNoData();
    }
    else {
      this.getShiftNoData();
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
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "dept" || fieldToSort === "level") {
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
}