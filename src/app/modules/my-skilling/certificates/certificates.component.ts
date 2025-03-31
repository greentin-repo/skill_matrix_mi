import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { CertificatesService } from './certificates.service';
import { Sort } from '@angular/material/sort';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {
  selectedBranch: any = {};
  submitAttempted: boolean = false;
  filterFormData: FormGroup;
  actionList: any =
    [{ srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" }, { srno: 1, plant: "Plant 1", cell: "cell 1", workstation: "Workstation 1", level: "Level 1" },];
  selectedRecForModal: any;
  userDet: any = {};
  loggedInEmpDet: any = {};
  staticPagination: any = {
    total: 50,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  };
  multipleDropdownSettings: IDropdownSettings = {};
  SingleDropdownSettings: IDropdownSettings = {};
  listLoading: boolean = false;
  searchDet: any = {
    searchFlag: false,
    searchInput: ''
  }
  submitSpinner: boolean = false;
  sorting: any;
  filterFlag: boolean = false;

  branchAccessList: { id: any; name: any; }[];

  deptList: any = [];
  certificateList: { branchId: number; deptName: string; empId: number; updatedBy: number; certificateId: number; deptId: number; certificateName: any; workstationName: string; branchName: string; levelName: string; updatedDate: string; certificatePath: string; createdDate: string; createdBy: number; workstationId: number; empName: string; regId: number; masterCerId: number; status: string; }[];


  constructor(private certService: CertificatesService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public modalConfig: NgbModalConfig) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.multipleDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
    this.filterFormData = this.fb.group({
      branch: new FormControl('', Validators.required),
      dept: new FormControl('',),
    })
    this.getBranchAccessList();

  }


  getCheckedValue() {
    return true;
  }

  /*
    @DESC : Function to clear pagination 
    @Author: Shashi
    @Date : 30 Aug 2023
  */
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
    @DESC : Calls api and show certificate list on table
    @Author: Shashi
    @Date : 30 Aug 2023
  */


  getCertificateList() {
    this.listLoading = true;
    this.certificateList = [];
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }

    var req: any = {
      // "branchId": this.selectedBranch.branchId,
      "empId": this.userDet.empId,
      "orgId": this.userDet.organization.orgId,
      // "deptIds": this.getIDsArray(this.selectedBranch.dept),
      "offset": this.staticPagination.offset,
      "limit": this.staticPagination.itemsPerPage,

    }
    if (this.selectedBranch.branch != null && this.selectedBranch.branch.length > 0) {
      for (let i = 0; i < this.selectedBranch.branch.length; i++) {
        req.branchId = this.selectedBranch.branch[0].id;

      }
    }
    if (this.getIDsArray(this.selectedBranch.dept) != null && this.getIDsArray(this.selectedBranch.dept).length > 0) {
      for (let i = 0; i < this.getIDsArray(this.selectedBranch.dept).length; i++) {
        req.deptIds = this.getIDsArray(this.selectedBranch.dept)
      }
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active;
        req.orderType = this.sorting.direction;
      }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      req.search = this.searchDet.searchInput;
    }
    this.staticPagination.listLength = this.certificateList.length;

    this.certService.getCertificateListData('apis/sm/getCertificateList', req).subscribe((data: any) => {

      this.listLoading = false;
      if (data.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = data.totalCount;
          this.staticPagination.totalPages = Math.ceil(data.totalCount / this.staticPagination.itemsPerPage);
        }
        if (data.dataList != null && data.dataList.length > 0) {
          this.certificateList = data.dataList;

          console.log(this.certificateList)
          this.staticPagination.listLength = data.dataList.length;
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
    }, (error: any) => {
      this.listLoading = false;
    });
  }

  /*
    @DESC : Load More Pagination next page Data
    @Author: Shashi
    @Date : 30 Aug 2023
  */
  loadMore(data: any) {
    this.staticPagination = data;
    this.certificateList = [];
    this.listLoading = true;
    if (this.filterFlag) {
      this.getCertificateList();
    } else {
      this.getCertificateList();
    }
  }

  /*
    @DESC : Sort table
    @Author: Shashi
    @Date : 30 Aug 2023
  */
  sortData(sort: Sort) {
    this.sorting = sort;
    this.getCertificateList();
  }

  /* Preview Selected Certificate
   @Author Saurabh salunke
  * @Date August 18, 2023
  */
  previewCertificate(data, certificateForMySkilling) {
    console.log(data)
    this.selectedRecForModal = data;
    this.modalService.open(certificateForMySkilling, {
      windowClass: 'bottom'
    });
  }

  /* open filter modal popup
   @Author Saurabh salunke
  * @Date August 31, 2023
  */
  filterModalOpen(FilterModal) {
    this.filterFormData.reset();

    this.searchDet.filterPopupOpen = false;
    console.log("In filter")
    if (!this.filterFlag) {
    }

    this.modalService.open(FilterModal, {
      windowClass: 'filterPopup',
    });
    // this.modalService.open(FilterModal, { windowClass: 'filterPopup' }).result.then(
    //   (result) => {
    //     console.log(`Closed with: ${result}`);
    //     //this.closeResult = `Closed with: ${result}`;
    //   },
    //   (reason) => {
    //     console.log(`Closed with:` + reason);
    //     if (reason == 'Cross click') {
    //       this.searchDet.filterPopupOpen = false;
    //       this.getCertificateList();
    //     }
    //     //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //   },
    // );
  }

  /* Change branch selction
     @Author Saurabh salunke
    * @Date August 31, 2023
  */
  onChangeBranch(event: any) {
    console.log(event)
    this.selectedBranch.branchId = event.id;
    this.getDeptList(this.selectedBranch.branchId)
    if (this.searchDet.addForm) {
      console.log("inside");
      this.resetFormField(this.filterFormData, "dept");
    }
  }

  /* gets Branch access list on employee
  @Author Saurabh salunke
  * @Date August 31, 2023
  */
  getBranchAccessList() {
    this.certService.getBranchAccessListData('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId)
      .subscribe((res: any) => {
        console.log(res);
        if (res.result) {
          if (res.branchAccessList != null && res.branchAccessList.length > 0) {
            this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
            // Corrected assignment 
          } else {
            this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
          }
        } else {
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
        this.selectedBranch.branched = [this.branchAccessList[0]];
        this.selectedBranch.selectedBranched = [this.branchAccessList[0]];
        // this.selectedBranch.branch = [this.branchAccessList[0]];
        this.onChangeBranch(this.selectedBranch.branched[0]); // Corrected function call
      });
  }


  /* get department list on branch selection
     @Author Saurabh salunke
    * @Date August 31, 2023
  */
  getDeptList(branchId) {
    this.certService.getdepartmentlistbybranchid('getdepartmentlistbybranchid/' + branchId).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        if (response.deptList != null && response.deptList.length > 0) {

          console.log(response);
          // this.deptList = response.deptList;
          console.log(this.deptList);
          /* Use For Add Screen */
          this.deptList = this.setArray(response.deptList, 'deptId', 'deptName');
          /* Use For Filter */
          this.searchDet.deptList = this.setArray(response.deptList, 'deptId', 'deptName');
          // this.selectedBranch.dept = this.searchDet.deptList;
          if (this.certificateList == null || this.certificateList.length == 0) {
            this.getCertificateList();
          }
        }
        else {
          this.deptList = [];
        }
      }
      else {
        this.deptList = [];
      }
    })
  }

  /*
    Common function for set an array for dropdown
     @Author Saurabh salunke
  * @Date August 31, 2023
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
       Apply filter function
        @Author Saurabh salunke
  * @Date August 31, 2023
  */
  submitFilterForm(form) {
    this.submitAttempted = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      return;
    }
    this.clearPagination();
    this.searchDet.filterFlag = true;
    this.searchDet.filterPopupOpen = false;
    this.getCertificateList();
    this.modalService.dismissAll();
  }

  /* 
    Remove Filter
     @Author Saurabh salunke
  * @Date August 31, 2023
  */
  removeFilter() {
    this.submitAttempted = false;
    this.filterFormData.reset();
    // .patchValue({
    //   branchId: [],
    //   deptIds:[],

    // })
    this.selectedBranch.branch = [];
    this.selectedBranch.dept = [];
    this.searchDet.filterFlag = false;
    this.searchDet.filterPopupOpen = false;
    this.certificateList = [];
    this.getDeptList(this.branchAccessList[0].id)
  }

  /*
  Common function For get Ids from array
  @Author Saurabh salunke
  * @Date August 31, 2023
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

  /* Close filter modal popup
     @Author Saurabh salunke
  * @Date August 31, 2023
  */
  closeFilterPopup() {
    this.submitAttempted = false;
    this.selectedBranch.branch = [];
    this.selectedBranch.dept = [];
    this.deptList = [];
    this.branchAccessList = [];
    this.resetFormField(this.filterFormData, 'branch')
    this.resetFormField(this.filterFormData, 'dept')

    this.filterFormData.reset();
    this.modalService.dismissAll();
  }

  /* Common function For Searching  
@Author Saurabh salunke
* @Date sept 12, 2023 */
  getSearchList(ev) {
    // this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.filterFlag) {
      this.getCertificateList();
    } else {
      this.getCertificateList();
    }
  }
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "plant" || fieldToSort === "dept" || fieldToSort === "level" || fieldToSort === "work") {
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


  /* 
     Reset Form function
     @Author Saurabh salunke
* @Date oct 20, 2023 */

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
}