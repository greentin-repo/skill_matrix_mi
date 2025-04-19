import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SkillMatrixService } from './skill-matrix.service';
import * as ExcelJS from 'exceljs';
import { Sort } from '@angular/material/sort';
@Component({
  selector: 'app-skill-matrix',
  templateUrl: './skill-matrix.component.html',
  styleUrls: ['./skill-matrix.component.scss']
})
export class SkillMatrixComponent implements OnInit {
  loggedInEmpDet: any = {};
  isAppliedFilter: boolean = false;
  staticPagination: any = {
    total: 50,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  };
  listLoading: boolean = false;
  searchDet: any = {
    searchFlag: false,
    searchInput: ''
  }
  submitSpinner: boolean = false;
  filterData: FormGroup;
  masterLevelList: any = [];
  plantList: any = [];
  sorting: any;
  filterFlag: boolean = false;
  selectedOjtDetails: any = {};
  exportSkillMatrixList: any = []


  SingleDropdownSettings: IDropdownSettings = {};
  skillDropDown: IDropdownSettings = {};
  masterActionList: any[];
  departmentList: any[];
  skillMatrixList: any;
  userDet: any;
  workstationData: any;
  workstationList: any[];
  multipleDropdownSettings: {
    singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string;
    // itemsShowLimit: 3,
    itemsShowLimit: number; allowSearchFilter: boolean;
  };
  skillMatrixDataList: any;
  submitAttempted: boolean = false;
  constructor(private modalService: NgbModal,
    public fb: FormBuilder,
    private skillMatrixService: SkillMatrixService
  ) { }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));

    this.loggedInEmpDet = this.skillMatrixService.getLoggedInData();
    console.log(this.loggedInEmpDet)
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
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
    this.filterData = this.fb.group({
      branchId: new FormControl('', Validators.required),
      deptIds: new FormControl(''),
      skillLvlId: new FormControl(''),
      workstation: new FormControl('')
    });
    this.getAccessiblePlantList();
    this.getMasterSkillLevelList();
    this.getWorkstationList()
    this.getSkillMatrixList();
  }

  getCheckedValue() {
    return true;
  }

  statusUpdate(event: any) {

  }

  filterModalOpen(modal) {
    this.searchDet.filterPopupOpen = true;
    // if (!this.searchDet.filterFlag) {
    this.modalService.open(modal, {
      windowClass: 'filterPopup',
    });
    // }
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
    Apply filter function
    Author: simran
    Date : 30/08/2023
*/
  submitFilterForm(form) {
    this.submitAttempted = true;
    console.log(form);

    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      return;
    }
    this.clearPagination();
    this.isAppliedFilter = true;
    this.searchDet.filterFlag = true;
    this.searchDet.filterPopupOpen = false;
    this.getSkillMatrixList()
    this.modalService.dismissAll();
  }
  /* 
    Remove Filter
    Author : simran
    Date : 30/08/2023
  */
  removeFilter() {
    this.filterData.reset();
    this.isAppliedFilter = false;
    this.submitAttempted = false;
    this.searchDet.branch = [];
    this.searchDet.deptIds = [];
    this.searchDet.skillLvlId = [];
    this.searchDet.workstation = [];

    this.searchDet.filterFlag = false;
    this.searchDet.filterPopupOpen = false;
    this.skillMatrixDataList = [];
    this.getDepartmentList(this.plantList[0].id);
  }

  /*
      Get Master Level List
      Author: Simran
      Date : 30/08/2023
  */
  getMasterSkillLevelList() {
    this.skillMatrixService.getMasterLevelList('apis/sm/getLevelList').subscribe((res: any) => {
      if (res.result) {
        if (res.dataList != null && res.dataList.length > 0) {
          this.masterLevelList = this.setArray(res.dataList, 'id', 'levelName');
        } else {
          this.masterLevelList = [];
        }
      } else {
        this.masterLevelList = [];
      }
    })
  }

  /*
      Get Action List
      Author: Saurabh Salunke
      Oct 12 2023
  */
  getSkillMatrixList() {

    this.listLoading = true;
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      "orgId": this.userDet.organization.orgId,
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
      'empId': this.userDet.empId
    }
    console.log(req)
    if (this.getIDsArray(this.searchDet.workstation) != null && this.getIDsArray(this.searchDet.workstation).length > 0) {
      for (let i = 0; i < this.getIDsArray(this.searchDet.workstation).length; i++) {
        req.workstationIds = this.getIDsArray(this.searchDet.workstation)
      }
    }
    if (this.searchDet.skillLvlId != null && this.searchDet.skillLvlId.length > 0) {
      for (let i = 0; i < this.searchDet.skillLvlId.length; i++) {
        req.skillLevelId = this.searchDet.skillLvlId[0].id;
      }
    }
    if (this.searchDet.deptIds != null && this.searchDet.deptIds.length > 0) {
      for (let i = 0; i < this.searchDet.deptIds.length; i++) {
        req.deptId = this.searchDet.deptIds[0].id;
      }
    }
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      for (let i = 0; i < this.searchDet.branch.length; i++) {
        req.branchId = this.searchDet.branch[0].id;
      }
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active,
          req.orderType = this.sorting.direction.toUpperCase();

      }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      req.search = this.searchDet.searchInput;
    }
    console.log(req)
    this.skillMatrixService.getActionList('apis/sm/getOJTRegistrationList', req).subscribe((res: any) => {
      this.listLoading = false;
      if (res.result) {
        if (res.dataList != null && res.dataList.length > 0) {
          if (this.staticPagination.page == 1) {
            this.staticPagination.total = res.totalCount;
            this.staticPagination.totalPages = Math.ceil(res.totalCount / this.staticPagination.itemsPerPage);
          }
          this.skillMatrixDataList = res.dataList;
          console.log(this.skillMatrixDataList);
          this.skillMatrixList = this.setArray(res.dataList, 'id', 'levelName');
          this.staticPagination.listLength = res.dataList.length;

        } else {
          this.skillMatrixDataList = [];
          this.staticPagination.listLength = res.dataList.length;

        }
      } else {
        this.skillMatrixDataList = [];
      }
    },
      (error: any) => {
        this.skillMatrixDataList = [];
      },
    )
  }
  /*
        Get workstation List
        Author: Saurabh
        Date : 12/09/2023
    */
  getWorkstationList() {
    let req: any = {
      "orgId": this.userDet.organization.orgId
    }
    this.skillMatrixService.getActionList('apis/sm/getWorkstationList', req).subscribe((response: any) => {
      if (response.result) {

        if (response.dataList != null && response.dataList.length > 0) {

          this.workstationData = response.dataList;
          console.log(this.workstationData);
          this.workstationList = this.setArray(response.dataList, 'id', 'workstation');
          this.modalService.dismissAll();
        } else {
          this.workstationData = [];
        }
      }
    })
  }

  /*
   Common function for set an array for dropdown
   Author: simran
   Date : 30/08/2023
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
     Get department List
     Author: Saurabh
     Date : 12/09/2023
 */
  getDepartmentList(branch) {
    console.log(branch)
    this.skillMatrixService.getdepartmentlistbybranchid('getdepartmentlistbybranchid/' + branch).subscribe((res: any) => {
      if (res.result) {
        if (res.deptList != null && res.deptList.length > 0) {
          /* Use For Add Screen */
          this.departmentList = this.setArray(res.deptList, 'deptId', 'deptName');
          if (!this.searchDet.addForm) {
            /* Use For Filter */
            this.searchDet.departmentList = this.setArray(res.deptList, 'deptId', 'deptName');
          }
          if (this.skillMatrixDataList == null || this.skillMatrixDataList.length == 0) {
            this.getSkillMatrixList();
          }
        } else {
          this.searchDet.departmentList = [];
        }

      }
    })
  }
  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will get branch list
  getAccessiblePlantList() {
    this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.loggedInEmpDet.organization.orgId + "/" + this.loggedInEmpDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        } else {
          this.plantList = [{ id: this.loggedInEmpDet.branch.branchId, name: this.loggedInEmpDet.branch.name }];
        }
      } else {
        this.plantList = [{ id: this.loggedInEmpDet.branch.branchId, name: this.loggedInEmpDet.branch.name }];
      }
      this.getDepartmentList(this.plantList[0].branchId)

    })
  }

  /*
      Single Select Dropdown onChange function
      Author: Simran
      Date : 30/08/2023
   */
  onChange(ev: any, type) {
    console.log(ev)
    if (ev) {
      if (type == 'plant') {
        this.searchDet.deptIds = [];
        this.getDepartmentList(ev.id);
        if (this.searchDet.addForm) {
          console.log("inside")
          this.resetFormField(this.filterData, 'deptId');
        }
      }
    } else {
      if (type == 'plant') {
        console.log("in")
        if (this.searchDet) {
          console.log("out");
          this.searchDet.departmentList = [];
          this.resetFormField(this.filterData, 'deptIds');
        } else {
          this.resetFormField(this.filterData, 'deptIds');
        }
      }
    }
  }
  /* 
  Load More Pagination next page Data
  @Author : Simran
  @Date : 30/08/2023
*/
  loadMore(ev: any) {
    this.staticPagination = ev;
    this.getSkillMatrixList()
  }

  /* 
    sorting of data
    @Author : Simran
    @Date : 30/08/2023
  */
  sortData(sort: Sort) {
    this.skillMatrixDataList = [];
    this.listLoading = true;
    this.sorting = sort;
    this.getSkillMatrixList()
  }
  /* 
       Reset Form function
       Author: simran
       Date : 30/08/2023
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
  onChangeAll(event) {

  }

  /*
Common function For get Ids from array
@Author Saurabh salunke
* @Date sept 12, 2023
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
* Oct 12 2023 */
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.filterFlag) {
      this.getSkillMatrixList();
    } else {
      this.getSkillMatrixList();
    }
  }

  /* To excel table data
  @Author Saurabh salunke
  * Oct 12 2023 */
  exportToExcel(): void {
    let req: any = {
      "orgId": this.userDet.organization.orgId,
      'empId': this.userDet.empId
    }
    this.skillMatrixService.getActionList('apis/sm/getOJTRegistrationList', req).subscribe((res: any) => {
      this.listLoading = false;
      if (res.result) {
        if (res.dataList != null && res.dataList.length > 0) {
          this.exportSkillMatrixList = res.dataList;
          this.exportData();
        } else {
          this.exportSkillMatrixList = [];
        }
      } else {
        this.exportSkillMatrixList = [];
      }
    },
      (error: any) => {
        this.exportSkillMatrixList = [];
      },
    )
  }
  exportData() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Skill Matrix');

    // Add headers to the worksheet
    const headers = ['Plant', 'Department', 'Cell/Line', 'Level', 'Workstation', 'Emp. ID', 'Emp. Name', 'Status'];
    worksheet.addRow(headers);

    // Add data to the worksheet
    this.exportSkillMatrixList.forEach(item => {
      const row = [];
      row.push(item.branchName);
      row.push(item.deptName);
      row.push(item.lineName);
      row.push(item.level);
      row.push(item.workstationName);
      row.push(item.companyEmpId);
      row.push(item.empName);
      row.push(item.status);
      worksheet.addRow(row);
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'skill-matrix.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  /* Close filter modal popup
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  closeFilterPopup() {
    this.submitAttempted = false;
    this.searchDet.branch = [];
    this.departmentList = [];
    this.searchDet.deptIds = [];
    this.searchDet.skillLvlId = [];
    this.searchDet.workstation = [];
    this.modalService.dismissAll();
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

  handleIconClick(data: any, modal) {
    console.log(data);
    this.selectedOjtDetails = data;
    console.log("In filter");
    this.modalService.open(modal, {
      windowClass: "bottom",
    });
  }

}



