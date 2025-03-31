import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/theme/shared/components';
import { SkillingService } from '../skilling.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss'],

})
export class CertificatesComponent implements OnInit {
  filterData: FormGroup;
  submitAttempted: boolean = false;
  searchDet: any = {};
  userDet: any = {};
  submitSpinner: boolean = false;
  plantList: any = [];
  departmentList: any;
  certificateList: any;
  selectedCert: any;
  listLoading: boolean = false;
  SingleDropdownSettings: { singleSelection: boolean; idField: string; textField: string; allowSearchFilter: boolean; closeDropDownOnSelection: boolean; };
  multipleDropdownSettings: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  selectedRecForModal: any;
  staticPagination: any = {
    total: 50,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  };
  sorting: Sort;
  getbranchId: any;
  filterFlag: boolean = false;
  constructor(
    public modalConfig: NgbModalConfig,
    public modalService: NgbModal,
    public alertService: AlertService,
    public fb: FormBuilder,
    private apiService: SkillingService
  ) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }


  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));

    this.filterData = this.fb.group({
      branchId: new FormControl('', Validators.required),
      deptIds: new FormControl('')
    });
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.multipleDropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 2,
      allowSearchFilter: true,
    };

    this.getAccessiblePlantList();
    this.getMasterCertificateList();
  };

  /*
      Common function for set an array for dropdown
      Author: Saurabh salunke
    Date : 25 Aug 2023
  */
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

  /*
      Get Accessible Plant List
      Author: Saurabh salunke
      Date : 25 Aug 2023
   */
  getAccessiblePlantList() {
    this.apiService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
      console.log(res)
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');

        } else {
          this.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      } else {
        this.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
      // this.searchDet.branch = [this.plantList[0]];
      this.searchDet.branchId = this.plantList[0].branchId;
      this.getbranchId = this.plantList[0].id;
      console.log(this.getbranchId)
      // this.getDepartmentList(this.getbranchId)
    })
  }
  /*
Get Department List
Author: Saurabh salunke
Date : 25 Aug 2023
*/
  getDepartmentList(branchId) {
    console.log(branchId);

    this.apiService.getDepartmentByBranch('getdepartmentlistbybranchid/' + branchId).subscribe((res: any) => {
      if (res.result) {
        if (res.deptList != null && res.deptList.length > 0) {
          this.departmentList = this.setArray(res.deptList, 'deptId', 'deptName');
          this.searchDet.departmentList = this.setArray(res.deptList, 'deptId', 'deptName');
          // this.searchDet.deptIds = this.searchDet.departmentList;
          if (this.certificateList == null || this.certificateList.length == 0) {
            // this.getMasterCertificateList();
          }
        } else {
          this.searchDet.departmentList = [];
        }
      } else {
        this.searchDet.departmentList = [];
      }
    })
  }
  /*
    Modal function to Open Filter function
    Author: Saurabh salunke
    Date : 25 Aug 2023
*/
  filterModalOpen(modal) {
    this.resetFormField(this.filterData, 'branchId');
    this.resetFormField(this.filterData, 'deptIds');
    this.searchDet.branch = [];
    this.searchDet.deptIds = [];
    this.modalService.open(modal, { windowClass: 'filterPopup' }).result.then(
      (result) => {
        console.log(`Closed with: ${result}`);
        //this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        console.log(`Closed with:` + reason);
        if (reason == 'Cross click') {
          this.submitAttempted = false;

          //   this.searchDet.filterFlag = false;
          //   this.searchDet.filterPopupOpen = false;
          //   this.getMasterCertificateList();
        }
        //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    );
  }
  /*
       Single Select Dropdown onChange function
        Author: Saurabh salunke
        Date : 25 Aug 2023
    */
  onChange(ev: any, type) {
    if (ev) {
      if (type == 'plant') {
        this.searchDet.branchId = ev.id;
        console.log(ev)
        this.searchDet.deptIds = [];
        this.getDepartmentList(this.searchDet.branchId);

      }
    } else {
      if (type == 'plant') {
        this.searchDet.departmentList = [];
        this.resetFormField(this.filterData, 'deptIds');
      }
    }
  }
  /*
     Multi Select Dropdown onChange function
     Author: Saurabh salunke
  Date : 25 Aug 2023
 */
  onChangeAll(ev: any, type) {
    if (ev) {
      console.log('Select All action');

    } else {
      console.log('Unselect All action');
    }
  }


  /*
     Filter function for plant and cell
     Author: Saurabh salunke
     Date : 25 Aug 2023
   */
  submitFilterForm(form) {
    this.submitAttempted = true;
    console.log(form)
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      if (form.controls.branchId.invalid) {
        return;
      }

    }
    this.clearPagination();
    this.searchDet.filterFlag = true;
    this.getMasterCertificateList()
    this.modalService.dismissAll();
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
      Removes Filter of plant and cell
      Author: Saurabh salunke
       Date : 25 Aug 2023
    */
  removeFilter() {
    this.submitAttempted = false;
    this.filterData.reset();
    this.searchDet.branch = [];
    this.searchDet.deptIds = [];
    this.searchDet.filterFlag = false;
    this.searchDet.filterPopupOpen = false;
    this.certificateList = []
    this.getDepartmentList(this.plantList[0].id);

  }

  /* Get Master Certificate List
   Author: Saurabh salunke
   Date : 25 Aug 2023
*/
  getMasterCertificateList() {
    this.listLoading = true;

    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }

    var req: any = {
      "orgId": this.userDet.organization.orgId,
      "offset": this.staticPagination.offset,
      "limit": this.staticPagination.itemsPerPage,

    }
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      for (let i = 0; i < this.searchDet.branch.length; i++) {
        req.branchId = this.searchDet.branch[0].id;

      }
    }
    else {
      req.branchId = this.userDet.branch.branchId;
    }
    if (this.getIDsArray(this.searchDet.deptIds) != null && this.getIDsArray(this.searchDet.deptIds).length > 0) {
      for (let i = 0; i < this.getIDsArray(this.searchDet.deptIds).length; i++) {
        req.deptIds = this.getIDsArray(this.searchDet.deptIds)
      }
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active;
        req.orderType = this.sorting.direction.toUpperCase();
      }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      req.search = this.searchDet.searchInput;
    }

    this.apiService.getCertificateList('apis/sm/getCertificateList', req).subscribe((res: any) => {
      this.listLoading = false;
      console.log(res);

      if (res.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = res.totalCount;
          this.staticPagination.totalPages = Math.ceil(res.totalCount / this.staticPagination.itemsPerPage);
        }
        if (res.dataList != null && res.dataList.length > 0) {
          this.certificateList = res.dataList;
          console.log(this.certificateList);
          this.staticPagination.listLength = res.dataList.length;
        } else {
          this.certificateList = [];
          this.staticPagination.listLength = this.certificateList.length;
          this.staticPagination.total = this.certificateList.length;
        }
      } else {
        this.certificateList = [];
        this.staticPagination.listLength = this.certificateList.length;
        this.staticPagination.total = this.certificateList.length;
      }
    })
  }

  /* Function to view Selected Certificate
   Author: Saurabh salunke
  Date : 25 Aug 2023
*/
  previewCertificate(data, previewCertModal) {
    console.log(data, previewCertModal)
    this.selectedRecForModal = data;
    this.modalService.open(previewCertModal, {
      windowClass: 'bottom'
    });
  }

  /* 
      This function resets Form 
       Author: Saurabh salunke
      Date : 25 Aug 2023
  */
  resetFormField(form, keyName) {
    Object.keys(form.controls).forEach(key => {
      if (keyName != '' && key == keyName) {
        form.get(keyName).reset();
        form.get(keyName).markAsPristine();
        form.get(keyName).markAsUntouched();
      } else {
        form.get(key).reset();
        form.get(key).markAsPristine();
        form.get(key).markAsUntouched();
      }
    });
  }


  /*
   @DESC : Load More Pagination next page Data
   Author: Saurabh salunke
     Date : 1 sept 2023
 */
  loadMore(data: any) {
    this.certificateList = [];
    this.listLoading = true;
    this.staticPagination = data;
    this.certificateList = [];
    if (this.filterFlag) {
      this.getMasterCertificateList()
    } else {
      this.getMasterCertificateList()
    }

  }
  /*
   @DESC : Sort table
   Author: Saurabh salunke
     Date : 1 sept 2023
 */
  sortData(sort: Sort) {
    this.sorting = sort;
    this.getMasterCertificateList();
  }

  /*
Common function For get Ids from array
@Author Saurabh salunke
* @Date sept 1, 2023
*/
  getIDsArray(array) {
    let tmp: any = [];
    if (array != null && array.length > 0) {
      for (const element of array) {
        tmp.push(element.id);
      }
    }
    return tmp;
  }

  /* Common function For Searching  
   @Author Saurabh salunke
 * @Date August 31, 2023*/
  getSearchList(ev) {
    console.log(ev);
    // this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = "";
    }
    if (this.filterFlag) {
      this.getMasterCertificateList();
    } else {
      this.getMasterCertificateList();
    }
  }
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "plant" || fieldToSort === "cell" || fieldToSort === "dept") {
        array.sort(function (a, b) {
          var nameA = a.name ? a.name.toUpperCase() : "";
          var nameB = b.name ? b.name.toUpperCase() : "";
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
}
