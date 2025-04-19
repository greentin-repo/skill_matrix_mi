import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActionsService } from './actions.service';
import { NgbModalConfig, NgbModal, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { Sort } from '@angular/material/sort';
import { CONSTANT } from './actions.constant';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class ActionsComponent implements OnInit {

  staticPagination: any = {
    total: 50,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  };
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  plantList: any;
  deptList: any = [];
  masterWorkList: any[];
  isAppliedFilter: boolean = false;
  cellLineList: any;
  selectedBranchId: any;
  selectedDeptId: any;
  selectedTab: any;

  // statusList = [
  //   {
  //     id : "COMPLETED",
  //     name : "COMPLETED"
  //   },{
  //     id : "NOT COMPLETED",
  //     name : "NOT COMPLETED"
  //   },{
  //     id : "PENDING",
  //     name : "PENDING"
  //   }
  // ]

  @ViewChild('stageOne') stageOne: TemplateRef<any>;
  @ViewChild('stageTwo') stageTwo: TemplateRef<any>;
  @ViewChild('stageTwoVerification') stageTwoVerification: TemplateRef<any>;
  @ViewChild('stageThree') stageThree: TemplateRef<any>;
  @ViewChild('stageFour') stageFour: TemplateRef<any>;
  @ViewChild('stageFive') stageFive: TemplateRef<any>;

  listLoading: boolean = false;
  searchDet: any = {};
  selectedBranch: any = {};
  submitSpinner: boolean = false;
  isUpload: boolean = false;
  actionList: any = [];
  masterDeptList: any;
  sorting: any;
  selectedActionRecDet: any;
  notCompletedBtnStatus: boolean = false;
  filterFlag: boolean = false;
  loggedInEmpDet: any = {};
  constant: any = {};
  filterData: FormGroup;
  submitAttempted: boolean = false;

  constructor(private actionsService: ActionsService,
    private modalService: NgbModal,
    public fb: FormBuilder,
    @Inject('Constant') Constant: any
  ) {
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.loggedInEmpDet = JSON.parse(localStorage.getItem('userDet'));
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

    this.filterData = this.fb.group({
      branchId: new FormControl("", Validators.required),
      deptId: new FormControl(""),
      lineIds: new FormControl(""),
      //statusId: new FormControl("", Validators.required),
      fromDate: new FormControl(""),
      toDate: new FormControl(""),
    });

    this.getAccessiblePlantList();
    this.selectTab('pendingAction');
    // this.getActionList('');
  }

  getCheckedValue() {
    return true;
  }

  /*
    @DESC : Function to clear pagination 
    @Author: Shashi
    @Date : 25 Aug 2023
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
      if (fieldToSort === "report" || fieldToSort === "dept" || fieldToSort === "level" || fieldToSort === "cell") {
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

  filterModalOpen(modal) {
    this.filterFlag = true
    this.modalService.open(modal, {
      windowClass: 'filterPopup',
    });
    //this.getActionList('filter');
  }

  /*
   @DESC : Search
   @Author: Jayshri
   @Date : 04 Sep 2023
 */
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.filterFlag) {
      this.getActionList('filter');
    } else {
      this.getActionList('');
    }
  }

  /* Common function for set an array for dropdown
  Author: Simran
  Date : 23/09/2023 */
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

  getIDsArray(array) {
    let tmp: any = [];
    if (array != null && array.length > 0) {
      for (const element of array) {
        tmp.push(element.id);
      }
    }
    return tmp;
  }

  resetFormField(form, keyName) {
    if (keyName != '') {
      Object.keys(form.controls).forEach(key => {
        if (key == keyName) {
          form.get(keyName).reset();
          form.get(keyName).markAsPristine();
          form.get(keyName).markAsUntouched();
        }
      });
    } else {
      Object.keys(form.controls).forEach(key => {
        form.get(key).reset();
        form.get(key).markAsPristine();
        form.get(key).markAsUntouched();
      });
    }
  }

  onChange(ev: any, type) {
    if (ev) {
      if (type == "plant") {
        this.getDepartmentList(ev);
        //this.getLineNameList(ev);
        this.searchDet.deptId = [];
        this.searchDet.lineIds = [];

      }
      else if (type == "dept") {
        this.getLineNameList(this.searchDet.branchId, this.searchDet.deptId);
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

  onChangeAll(ev: any, type) {
    if (ev) {
      console.log('Select All action');
    } else {
      console.log('Unselect All action');
    }
  }

  getAccessiblePlantList() {
    this.actionsService
      .getBranchAccessList(
        "getBranchAccessSetupByEmpId/" +
        this.loggedInEmpDet.organization.orgId +
        "/" +
        this.loggedInEmpDet.empId
      )
      .subscribe((res: any) => {
        if (res.result) {
          if (res.branchAccessList != null && res.branchAccessList.length > 0) {
            /* Use For Add Screen */
            this.plantList = this.setArray(
              res.branchAccessList,
              "branchId",
              "branchName"
            );
            /* Use For Filter */
            this.searchDet.plantList = this.setArray(
              res.branchAccessList,
              "branchId",
              "branchName"
            );
          } else {
            /* Use For Add Screen */
            this.plantList = [
              {
                id: this.loggedInEmpDet.branch.branchId,
                name: this.loggedInEmpDet.branch.name,
              },
            ];
            /* Use For Filter */
            this.searchDet.plantList = [
              {
                id: this.loggedInEmpDet.branch.branchId,
                name: this.loggedInEmpDet.branch.name,
              },
            ];
          }
        } else {
          /* Use For Add Screen */
          this.plantList = [
            {
              id: this.loggedInEmpDet.branch.branchId,
              name: this.loggedInEmpDet.branch.name,
            },
          ];
          /* Use For Filter */
          this.searchDet.plantList = [
            {
              id: this.loggedInEmpDet.branch.branchId,
              name: this.loggedInEmpDet.branch.name,
            },
          ];
        }
        //this.branchId = [this.searchDet.plantList[0]];
        //this.getDepartmentList(this.branchId[0]);
      });
  }
  getDepartmentList(branch) {
    this.actionsService
      .getDepartmentByBranch("getdepartmentlistbybranchid/" + branch.id)
      .subscribe((res: any) => {
        if (res.result) {
          if (res.deptList != null && res.deptList.length > 0) {
            /* Use For Add Screen */
            this.searchDet.deptList = this.setArray(
              res.deptList,
              "deptId",
              "deptName"
            );
          } else {
            this.searchDet.deptList = [];
          }
        } else {
          this.searchDet.deptList = [];
        }
      });
  }
  getLineNameList(branchId, deptId) {
    console.log(branchId);
    console.log(deptId);
    this.selectedBranchId = branchId[0].id;
    this.selectedDeptId = deptId[0].id;
    const data = {
      branchId: this.selectedBranchId,
      deptId: this.selectedDeptId
    };
    this.actionsService
      .getLineNameList("apis/sm/getCellList", data)
      .subscribe((response: any) => {
        if (response.result) {
          if (response.dataList != null && response.dataList.length > 0) {
            //this.cellLineList = response.dataList;
            this.cellLineList = this.setArray(
              response.dataList,
              "lineId",
              "lineName"
            );
            // this.searchDet.cellLineName = this.setArray(response.dataList, 'lineId', 'tmpName');
          } else {
            this.cellLineList = [];
          }
        } else {
          this.cellLineList = [];
        }
      });
  }

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

  removeFilter() {
    this.isAppliedFilter = false;
    this.submitAttempted = false;
    this.filterData.reset();
    this.searchDet.branchId = [];
    this.searchDet.deptId = [];
    this.searchDet.lineIds = [];
    this.searchDet.fromDate = null;
    this.searchDet.toDate = null;
    //this.searchDet.statusId = [];
    this.getActionList('');
  }

  submitFilterForm(form) {
    this.submitAttempted = true;
    console.log(form)
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      if (form.controls.branchId.invalid) {
        console.log(form.controls.branchId.invalid)
        return;
      }
    }
    this.clearPagination();
    this.isAppliedFilter = true;
    this.searchDet.filterFlag = true;
    this.getActionList('filter');
    this.modalService.dismissAll();
  }

  /*
    @DESC : Calls api and show action list on table
    @Author: Shashi
    @Date : 25 Aug 2023
  */
  getActionList(searchFilter) {
    this.listLoading = true;
    this.actionList = [];

    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }

    var req: any = {
      empId: this.loggedInEmpDet.empId,
      offset: this.staticPagination.offset,
      limit: this.staticPagination.itemsPerPage,
    }

    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active;
        req.orderType = this.sorting.direction.toUpperCase();
      } else {
        //Default Sort
        // req.colName = "empName";
        // req.orderType = "ASC";
      }
    } else {
      //Default Sort
      // req.colName = "empName";
      // req.orderType = "DESC";
    }
    // if (searchFilter == 'filter') {
    if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0) {
      req.branchId = this.searchDet.branchId[0].id;
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
      req.toDt = moment(this.searchDet.toDate).format("YYYY-MM-DD");
    }
    // if (this.searchDet.statusId != null) {
    //   req.status = this.searchDet.statusId[0].id;
    // }
    // }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      req.search = this.searchDet.searchInput;
    }
    this.staticPagination.listLength = 10;
    if (this.selectedTab == 'pendingAction') {
      req.status = 'PENDING'
    }

    console.log(req);

    this.actionsService.getActionsList(req).subscribe((response: any) => {
      this.listLoading = false;

      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.actionList = response.dataList;

          //If showing action list for stage 1 then sorting it day wise 1 to N
          let isStage1 = true;
          this.actionList.forEach(element => {
            if (element.stageId != 1) {
              isStage1 = false;
            }
          });

          if (isStage1) {
            this.actionList = this.actionList.sort(function (a, b) {
              return a.dayNo - b.dayNo;
            });
          }

          // if (this.staticPagination.page == 1) {
          //   this.staticPagination.total = res.totalCount;
          //   this.staticPagination.totalPages = Math.ceil(res.totalCount / this.staticPagination.itemsPerPage);
          // }

          this.staticPagination.listLength = this.actionList.length;
          if (this.staticPagination.page == 1) {
            this.staticPagination.total = response.totalCount;
            this.staticPagination.totalPages = (this.staticPagination.total > 0) ? Math.ceil(this.staticPagination.total / this.staticPagination.itemsPerPage) : 0;
          }
        } else {
          this.actionList = [];
          this.staticPagination.listLength = this.actionList.length;
          this.staticPagination.total = 0;
          this.staticPagination.totalPages = (this.staticPagination.total > 0) ? Math.ceil(this.staticPagination.total / this.staticPagination.itemsPerPage) : 0;
        }
      } else {
        this.actionList = [];
        this.staticPagination.listLength = this.actionList.length;
        this.staticPagination.total = 0;
        this.staticPagination.totalPages = (this.staticPagination.total > 0) ? Math.ceil(this.staticPagination.total / this.staticPagination.itemsPerPage) : 0;
      }
    }, (error: any) => {
      this.listLoading = false;
    });
  }

  /*
    @DESC : Load More Pagination next page Data
    @Author: Shashi
    @Date : 25 Aug 2023
  */
  loadMore(data: any) {
    this.staticPagination = data;
    this.actionList = [];
    if (this.filterFlag) {
      this.getActionList('filter');
    } else {
      this.getActionList('');
    }
  }
  /*
    @DESC : Sort table
    @Author: Shashi
    @Date : 25 Aug 2023
  */
  sortData(sort: Sort) {
    this.sorting = sort;
    this.getActionList('');
  }

  /*
    @DESC : Shows popup for action details
    @Author: Shashi
    @Date : 25 Aug 2023
  */
  openActionDetailsModal(data) {
    this.selectedActionRecDet = data;
    var modalRef: any;
    if (this.selectedActionRecDet.asstageCaption == this.constant.Stage_1) {
      modalRef = this.modalService.open(this.stageOne, {
        windowClass: 'bottom',
      });
    }
    if (this.selectedActionRecDet.asstageCaption == this.constant.Stage_2) {
      modalRef = this.modalService.open(this.stageTwo, {
        windowClass: 'bottom',
      });
    }
    if (this.selectedActionRecDet.asstageCaption == this.constant.Stage_3) {
      modalRef = this.modalService.open(this.stageThree, {
        windowClass: 'bottom',
      });
    }
    if (this.selectedActionRecDet.asstageCaption == this.constant.Stage_2_Verification) {
      modalRef = this.modalService.open(this.stageTwoVerification, {
        windowClass: 'bottom',
      });
    }
    if (this.selectedActionRecDet.asstageCaption == this.constant.Stage_4) {
      modalRef = this.modalService.open(this.stageFour, {
        windowClass: 'bottom',
      });
    }
    if (this.selectedActionRecDet.asstageCaption == this.constant.Stage_5) {
      modalRef = this.modalService.open(this.stageFive, {
        windowClass: 'bottom',
        backdrop: 'static'
      });
    }
    if (this.selectedActionRecDet.asstageCaption == this.constant.Stage_7) {
      modalRef = this.modalService.open(this.stageFive, {
        windowClass: 'bottom',
        backdrop: 'static'
      });
    }
    modalRef.result.then((result) => {
      this.getActionList('');
    }, (reason) => {
      this.getActionList('');
    });
  }

  /*
    @DESC : Shows popup for assessment details
    @Author: Shashi
    @Date : 25 Aug 2023
  */
  openAssessmentDetailsModal(modal, data) {
    this.selectedActionRecDet = data;
    var modalRef = this.modalService.open(modal, {
      windowClass: 'bottom',
    });
    modalRef.result.then((result) => {
      if (result === 'success') {
        // this.getassessmentDetails();
      }
    }, (reason) => {
      console.log(reason);
    });
  }

  // checkPrevDayTaskCompletion(dayNo: any) {
  //   let flag = true;
  //   if (dayNo > 1) {
  //     this.actionList.forEach(element => {
  //       if (element.stageId == 1) {
  //         if (dayNo > element.dayNo) {
  //           if (element.status == "PENDING") {
  //             flag = false;
  //           }
  //         }
  //       }
  //     });
  //   }

  //   return flag;
  // }
  checkPrevDayTaskCompletion(dayNo: any, activityDate: string) {
    let flag = true;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current time to midnight for accurate date comparison

    if (dayNo > 1) {
      this.actionList.forEach(element => {
        if (element.stageId == 1) {
          const elementActivityDate = new Date(element.activityDate);
          elementActivityDate.setHours(0, 0, 0, 0); // Set element's activity date to midnight

          // Compare the activity dates using .getTime() to ensure they are numbers
          const elementActivityDateTime = elementActivityDate.getTime();
          const inputActivityDateTime = new Date(activityDate).setHours(0, 0, 0, 0);

          if (elementActivityDateTime < inputActivityDateTime) {
            if (element.status == "PENDING") {
              flag = false;
            }
          }
        }
      });
    }

    // Additional check for the current task's activity date
    const activityDateObj = new Date(activityDate);
    activityDateObj.setHours(0, 0, 0, 0); // Set activityDate time to midnight

    if (activityDateObj.getTime() > currentDate.getTime()) {
      flag = false; // Task can't be performed if activityDate is in the future
    }

    return flag;
  }



  selectTab(tab) {
    this.selectedTab = tab;
    this.staticPagination = {
      total: 0,
      page: 1,
      maxSize: 5,
      itemsPerPage: 10,
      totalPages: 0,
      listLength: 0
    }
    console.log(this.selectedTab);
    this.getActionList('');
  }
}
