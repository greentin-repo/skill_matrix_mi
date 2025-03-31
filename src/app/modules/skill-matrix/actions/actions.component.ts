import { Component, OnInit } from '@angular/core';
import { SkillingService } from '../skilling.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Sort } from '@angular/material/sort';
import * as moment from 'moment';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent implements OnInit {
  filterFormData: FormGroup;
  filterFlag: boolean = false;
  searchDet: any = {};
  actionList: any = [];
  selectedBranch: any = {};
  branchAccessList: any = [];
  deptList: any = [];
  loggedInEmpDet: any = {};
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  listLoading: boolean = false;
  // SingleDeptDropdownSettings: IDropdownSettings = {};
  sorting: any;
  submitAttempted: boolean = false;
  plantList: any = [];
  masterDeptList: any = [];
  isAppliedFilter: boolean = false;
  masterLevelList: any = [];
  cellList: any[];
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0
  }
  constructor(
    private skillingService: SkillingService,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loggedInEmpDet = JSON.parse(localStorage.getItem('userDet'));

    this.filterFormData = this.fb.group({
      branch: new FormControl('', Validators.required),
      dept: new FormControl(''),
      lineIds: new FormControl(''),
      fromDate: new FormControl(""),
      toDate: new FormControl(""),
      skillLvlId: new FormControl(''),
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
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
    // this.SingleDeptDropdownSettings = {
    //   singleSelection: true,
    //   idField: 'deptId',
    //   textField: 'deptName',
    //   allowSearchFilter: true,
    //   closeDropDownOnSelection: true,
    // };

    this.getBranchAccessList();
    this.getSkillMatrixOjtList();
    this.getMasterSkillLevelList();
  }

  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
      this.getSkillMatrixOjtList();
    }
    else {
      this.getSkillMatrixOjtList()
    }
  }
  filterModalOpen(modal: any) {
    this.filterFlag = true
    this.modalService.open(modal, {
      windowClass: 'filterPopup',
    });
  }
  /* gets Branch access list on employee
   @Author Jayshri Kolase
  * @Date August 24, 2023
 */
  getBranchAccessList() {
    this.skillingService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.loggedInEmpDet.organization.orgId + "/" + this.loggedInEmpDet.empId)
      .subscribe((res: any) => {
        if (res.result) {
          if (res.branchAccessList != null && res.branchAccessList.length > 0) {
            this.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
          } else {
            this.plantList = [{ id: this.loggedInEmpDet.branch.branchId, name: this.loggedInEmpDet.branch.name }];
          }
        } else {
          this.plantList = [{ id: this.loggedInEmpDet.branch.branchId, name: this.loggedInEmpDet.branch.name }];
        }
        // this.searchDet.branchId = [this.plantList[0]];
      });
  }

  /* Change branch selction
     @Author Jayshri Kolase
    * @Date August 24, 2023
  */
  // onChangeBranch(event: any) {
  //   this.selectedBranch.branchId = event.branchId;
  //   console.log(event);
  //   this.getDeptList()
  // }
  /* get department list on branch selection
     @Author Jayshri Kolase
    * @Date August 24, 2023
  */
  getDeptList(branch) {
    this.skillingService.getdepartmentlistbybranchid('getdepartmentlistbybranchid/' + branch.id).subscribe((response: any) => {
      if (response.result) {
        if (response.deptList != null && response.deptList.length > 0) {
          this.masterDeptList = this.setArray(response.deptList, 'deptId', 'deptName');
          console.log(this.masterDeptList)
          // this.searchDet.skillLvlId = [this.masterLevelList[0]];
        } else {
          this.masterDeptList = [];
        }
      } else {
        this.masterDeptList = [];
      }
    })
  }
  /* get skill mtrix action list
     Author : simran
     created date : 14/09/2023
   */

  getSkillMatrixOjtList = function () {
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      'orgId': this.loggedInEmpDet.organization.orgId,
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage
    }
    console.log(this.searchDet.branchId)
    if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0) {
      req.branchId = this.searchDet.branchId[0].id;
    }
    else {
      req.branchId = this.loggedInEmpDet.branch.branchId;
    }
    if (this.searchDet.deptId != null && this.searchDet.deptId.length > 0) {
      req.deptId = this.searchDet.deptId[0].id;
    }
    if (this.searchDet.lineIds != null && this.searchDet.lineIds.length > 0) {
      req.lineIds = this.getIDsArray(this.searchDet.lineIds);
    }
    if (this.searchDet.fromDate != null) {
      req.fromDt = moment(this.searchDet.fromDate).format("YYYY-MM-DD");
    }
    if (this.searchDet.toDate != null) {
      req.toDate = moment(this.searchDet.toDate).format("YYYY-MM-DD");
    }
    if (this.searchDet.skillLvlId != null && this.searchDet.skillLvlId.length > 0) {
      req.skillLevelId = this.searchDet.skillLvlId[0].id;
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
    this.skillingService.getSkillMatrixActionList('apis/sm/getSkillMatrixActionList', req).subscribe((response: any) => {
      if (response.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.smActionList != null && response.smActionList.length > 0) {
          this.actionList = response.smActionList;
          console.log(this.actionList)
          this.staticPagination.listLength = this.actionList.length;
        }
        else {
          this.actionList = [];
          this.staticPagination.listLength = this.actionList.length;
        }
      }
      else {
        this.actionList = [];
        this.listLoading = false;
        this.staticPagination.listLength = this.actionList.length;
      }
    });
    console.log(req);
  }
  /*
        Apply filter function
        Author: simran
        Date : 14/09/2023
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
    this.isAppliedFilter = true;
    this.searchDet.filterFlag = true;
    this.staticPagination.offset = 0;
    this.staticPagination.itemsPerPage = 10;
    this.modalService.dismissAll();
    this.getSkillMatrixOjtList();
  }
  removeFilter() {
    this.isAppliedFilter = false;
    this.filterFormData.reset();
    this.searchDet.branchId = [];
    this.searchDet.deptId = [];
    this.searchDet.lineIds = [];
    this.searchDet.fromDate = null;
    this.searchDet.toDate = null;
    this.searchDet.skillLvlId = [];
    this.getSkillMatrixOjtList();
  }
  /*
  Common function for set an array for dropdown
  Author: simran
  Date : 14/09/2023
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
    Single Select Dropdown onChange function
    Author: Simran
    Date : 14/09/2023
  */
  onChange(ev: any, type) {
    console.log(ev)
    // if (ev) {
    //   this.getDeptList(ev)
    // } else {
    //   console.log('Unselect plant');
    // }
    if (ev) {
      if (type == "plant") {
        this.getDeptList(ev);
        //this.getLineNameList(ev);
        this.searchDet.deptId = [];
        this.searchDet.lineIds = [];

      }
      else if (type == "dept") {
        this.getCellList(ev);
        //this.getLineNameList(ev);
        this.searchDet.lineIds = [];
      }
    } else {
      if (type == "plant") {
        if (this.searchDet) {
          this.searchDet.departmentList = [];
        }
      }
      else if (type == "dept") {
        if (this.searchDet) {
          this.searchDet.cellLineList = [];
        }
      }
    }
  }

  /* 
  Load More Pagination next page Data
  Author : Simran
  Date : 14/09/2023
  */
  loadMore(ev: any) {
    this.staticPagination = ev;
    this.actionList = [];
    this.listLoading = true;
    this.getSkillMatrixOjtList();
  }

  sortData(sort: Sort) {
    this.sorting = sort;
    this.getSkillMatrixOjtList()
  }

  /*
    DESC : Function to clear pagination 
    Author: Simran
    Date : 14/09/2023
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
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "dept" || fieldToSort === "plant") {
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
  // Date select  function
  // 30/10/2023
  // simran
  selectCustomDate(fromDate, toDate) {
    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);
    if (
      fromDate.value != null &&
      fromDate.value != undefined &&
      fromDate.value != ""
    ) {
      this.searchDet.fromDate = new Date(fromDate.value);
    }
    if (
      toDate.value != null &&
      toDate.value != undefined &&
      toDate.value != ""
    ) {
      this.searchDet.toDate = new Date(toDate.value);
    }
  }
  /*
     Get Master Level List
     Author: Simran
     Date : 30/10/2023
 */
  getMasterSkillLevelList() {
    this.skillingService.getMasterLevelList('apis/sm/getLevelList').subscribe((res: any) => {
      if (res.result) {
        if (res.dataList != null && res.dataList.length > 0) {
          this.masterLevelList = this.setArray(res.dataList, 'id', 'levelName');
          // this.searchDet.skillLvlId = [this.masterLevelList[0]];
        } else {
          this.masterLevelList = [];
        }
      } else {
        this.masterLevelList = [];
      }
    })
  }
  getCellList(data) {
    var req: any = {
      branchId: this.searchDet.branchId[0].id,
      // deptId:this.searchDet.deptId
      deptId: data.id
    };
    this.skillingService.getCellList("apis/sm/getCellList", req).subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.cellList = this.setArray(response.dataList, "lineId", "lineName");
          // this.cellList = this.sortFunction( this.cellList,"lineName");
          console.log(this.cellList)
          // this.searchDet.cell = [this.cellList[0]];
          console.log(this.searchDet.cell)

        } else {
          this.cellList = [];
        }
      } else {
        this.cellList = [];
      }
    });
  }
  onChangeAll(ev: any, type) {
    if (ev) {
      console.log('Select All action');
    } else {
      console.log('Unselect All action');
    }
  }
  getIDsArray(array) {
    let tmp: any = [];
    if (array != null && array.length > 0) {
      for (const element of array) {
        tmp.push(element.id);
      }
    }
    return tmp;
  }
}
