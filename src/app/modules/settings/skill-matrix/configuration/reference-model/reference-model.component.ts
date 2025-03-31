import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SkillMatrixService } from '../../skill-matrix.service';
import { AlertService } from 'src/app/theme/shared/components';
import Swal from 'sweetalert2';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-reference-model',
  templateUrl: './reference-model.component.html',
  styleUrls: ['./reference-model.component.scss']
})
export class ReferenceModelComponent implements OnInit {
  searchDet: any = {};
  submitSpinner: boolean = false;
  formdata: FormGroup;
  filterData: FormGroup;
  isModelListLoading: boolean = false;
  referencemodelList: any = [];
  reqBody: any;
  referenceModel: any = {};
  isEditRefModel: boolean;
  SingleBranchDropdownSettings: IDropdownSettings = {};
  userDet: any = {};
  branchAccessList: any = [];
  addEditReferenceModel: any = {}
  modalTitle: string;
  isFormSubmitted: boolean = false;
  ReferenceModel: any;
  newReferenceModel: any;
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
  disableReferModel: boolean;
  constructor(
    modalConfig: NgbModalConfig,
    private skillMatrixService: SkillMatrixService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private fb: FormBuilder) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.branchId && !changes.branchId.firstChange) {
      this.getModelListData();
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
      modelName: new FormControl('', Validators.required)
    });
    this.resetForm();
  }

  /*
    Get Accessible Plant List
    Author: Sanket B.
    Date : 21 Aug 2023
  */
  getBranchAccessList() {
    this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((response: any) => {
      if (response.result) {
        if (response.branchAccessList != null && response.branchAccessList.length > 0) {
          /* Use For Add Screen */
          this.branchAccessList = response.branchAccessList;
          this.branchAccessList = this.setArray(this.branchAccessList, 'branchId', 'branchName');
          this.branchAccessList = this.sortFunction(this.branchAccessList, 'name');
          this.referenceModel.branch = [this.branchAccessList[0]];
        } else {
          /* Use For Add Screen */
          this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
        }
      } else {
        /* Use For Add Screen */
        this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
      }
      if (this.branchAccessList.length > 0) {
        this.referenceModel.branch = [this.branchAccessList[0]];
      }
      this.onChangeBranch(this.branchAccessList[0]);
    })
  }
  onChangeBranch(event: any) {
    if (event) {
      this.disableReferModel = true
      this.referenceModel.branchId = event.branchId;
      this.getModelListData();
    }
    else {
      this.disableReferModel = false;
      this.referencemodelList = []
    }
  }

  /*
      Get Reference Model List
      Author: Sanket B.
      Date : 21 Aug 2023
  */
  getModelListData() {
    this.isModelListLoading = true;
    console.log(this.staticPagination.total)
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
      // 'branchId': this.referenceModel.branchId
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
    this.skillMatrixService.getModelListData('apis/sm/getModelList', req).subscribe((response: any) => {
      if (response.result) {
        this.isModelListLoading = false;
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.referencemodelList = response.dataList;
          this.staticPagination.listLength = this.referencemodelList.length;
        } else {
          this.referencemodelList = [];
          this.staticPagination.listLength = this.referencemodelList.length;
          this.staticPagination.total = this.referencemodelList.length;
        }
        // this.referencemodelList = response.dataList;
      } else {
        this.referencemodelList = [];
        this.staticPagination.listLength = this.referencemodelList.length;
        this.staticPagination.total = this.referencemodelList.length;
        this.isModelListLoading = false;
      }
    }, (error: any) => {
      this.referencemodelList = [];
      this.isModelListLoading = false;

    })

  }

  addRefModalOpen(modal, popupClass) {
    this.modalTitle = "Add New Model"
    this.addEditReferenceModel.branch = this.branchId;
    this.addEditReferenceModel.modelName = '';
    this.resetForm();
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }
  resetForm() {
    this.formdata.reset();
    this.isFormSubmitted = false;
  }

  editRefModel(modal, popupClass, refmodelData) {
    this.modalTitle = "Update Model"
    this.addEditReferenceModel.modelName = refmodelData.modelName;
    this.addEditReferenceModel.modelId = refmodelData.id;
    for (let i = 0; i < this.branchAccessList.length; i++) {
      if (this.branchAccessList[i].branchId == refmodelData.branchId) {
        this.addEditReferenceModel.branch = [this.branchAccessList[i]];
      }
    }
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }

  /*
      Add & Update Reference Model
      Author: Mahesh W
      Date : 21 Aug 2023
  */
  saveReferenceModel(formdata) {
    this.isFormSubmitted = true
    if (formdata.valid) {
      // for (let index = 0; index < this.referencemodelList.length; index++) {
      //   this.ReferenceModel = this.referencemodelList[index].modelName.toLowerCase();
      //   this.newReferenceModel = this.addEditReferenceModel.modelName.toLowerCase();
      //   if (this.ReferenceModel == this.newReferenceModel) {
      //     this.alertService.error("Model already exist.");
      //     return;
      //   }
      // }
      if (this.addEditReferenceModel.modelId == undefined || this.addEditReferenceModel.modelId == '') {
        if (this.addEditReferenceModel.branch != null && this.addEditReferenceModel.branch.length > 0) {
          for (let i = 0; i < this.addEditReferenceModel.branch.length; i++) {
            this.addEditReferenceModel.branchId = this.addEditReferenceModel.branch[i].branchId;
          }
        }
        this.reqBody = {
          // "branchId": this.addEditReferenceModel.branchId,
          "branchId": this.addEditReferenceModel.branch[0].id,
          "modelName": this.addEditReferenceModel.modelName,
          "isActive": true,
          "updatedBy": this.userDet.empId
        }
        console.log(this.reqBody);
        this.skillMatrixService.saveReferenceModel('apis/sm/addModelDetails', this.reqBody).subscribe((response: any) => {
          if (response.result) {
            this.modalService.dismissAll();
            this.alertService.success("Model added successfully");
            this.submitSpinner = false;
            this.addEditReferenceModel.branch = '';
            this.addEditReferenceModel.modelName = '';
            this.getModelListData();
          } else {
            if (response.statusCode == 100) {
              this.alertService.error(response.reason);
            } else {
              this.alertService.error('Error occurred while adding data. Please try again');
            }
          }
        })
      } else {
        if (this.addEditReferenceModel.branch != null && this.addEditReferenceModel.branch.length > 0) {
          for (let i = 0; i < this.addEditReferenceModel.branch.length; i++) {
            this.addEditReferenceModel.branchId = this.addEditReferenceModel.branch[i].branchId;
          }
        }
        // for (let index = 0; index < this.referencemodelList.length; index++) {
        //   this.ReferenceModel = this.referencemodelList[index].modelName.toLowerCase();
        //   this.newReferenceModel = this.addEditReferenceModel.modelName.toLowerCase();
        //   if (this.addEditReferenceModel.modelId == 0) {
        //     if (this.ReferenceModel == this.newReferenceModel) {
        //       this.alertService.error("Model already exist.");
        //       return;
        //     }
        //   }
        // }
        this.reqBody = {
          "modelId": this.addEditReferenceModel.modelId,
          "branchId": this.addEditReferenceModel.branchId,
          "modelName": this.addEditReferenceModel.modelName,
          "updatedBy": this.userDet.empId
        }
        this.skillMatrixService.updateModalDetails('apis/sm/updateModelDetails', this.reqBody).subscribe((response: any) => {
          if (response.result) {
            this.modalService.dismissAll();
            this.alertService.success("Model updated successfully");
            this.addEditReferenceModel.branch = '';
            this.addEditReferenceModel.modelName = '';
            this.addEditReferenceModel.modelId = '';
            this.submitSpinner = false;
            this.getModelListData();
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

  /*
  Remove Reference Model
  Author: Sanket B.
  Date : 21 Aug 2023
*/
  removeRefModel(RefModelData) {
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this model ?',
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
          "modelId": RefModelData.id,
          "updatedBy": this.userDet.empId
        }
        this.skillMatrixService.deleteModelDetails('apis/sm/deleteModelDetails', this.reqBody).subscribe((response: any) => {
          if (response.result) {
            this.alertService.success("Model removed successfully");
            this.getModelListData();
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
    this.referencemodelList = [];
    this.isModelListLoading = true;
    this.getModelListData()
  }

  /*
    Common function for sorting
    Author: Simran
    Date : 07/09/2023
*/
  sortData(sort: Sort) {
    this.sorting = sort;
    this.getModelListData()
  }
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
      this.getModelListData()
    }
    else {
      this.getModelListData()
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