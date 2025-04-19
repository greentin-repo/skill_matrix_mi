import { Component, OnInit, TemplateRef, ViewChild, ElementRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SkillingService } from '../skilling.service';
import Swal from 'sweetalert2';
import { AlertService } from 'src/app/theme/shared/components';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Sort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Workbook } from 'exceljs';
import * as fs from "file-saver";
import { table } from 'console';
import * as moment from 'moment';
import * as ExcelJS from "exceljs";

@Component({
  selector: "app-ojt-plan",
  templateUrl: "./ojt-plan.component.html",
  styleUrls: ["./ojt-plan.component.scss"],
})
export class OjtPlanComponent implements OnInit {
  filterFlag: boolean = false;
  submitAttempted: boolean = false;
  formdata: FormGroup;
  getSearchList: any;
  isDropdownOpen: boolean = false;
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  SingleDropdownTypeSettings: IDropdownSettings = {};
  searchDet: any = {};
  constant: any = {};
  worksatationData: any = [];

  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0,
  };
  ojtPlanList: any = [];
  dataSpinner: any = [];
  deptList: any = [];
  branchAccessList: any = [];
  userDet: any = {};
  listLoading = false;
  sorting: any;
  @ViewChild("AddOjtPlan") AddOjtPlan: TemplateRef<any>;
  @ViewChild("OJTRegi") OJTRegi: TemplateRef<any>;
  @ViewChild("rightModal") rightModal: ElementRef;
  viewPlanData: any = [];
  tableData: any = [];
  cellList: any = [];
  isAppliedFilter: boolean = false;
  regiList: any = [
    { id: 1, type: "Register OJT Plan" },
    // { id: 2, type: "Register OJT" },
  ];
  exportingDetails: any = {};

  constructor(
    private router: Router,
    public modalConfig: NgbModalConfig,
    public modalService: NgbModal,
    private apiService: SkillingService,
    private alertService: AlertService,
    private fb: FormBuilder,
    @Inject('Constant') Constant: any
  ) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem("userDet"));
    this.getBranchAccessList();
    this.getOJTPlanList("");
    this.formdata = this.fb.group({
      branch: new FormControl("", Validators.required),
      dept: new FormControl(""),
      cell: new FormControl(""),
    });

    this.SingleDropdownTypeSettings = {
      singleSelection: true,
      idField: "id",
      textField: "type",
      allowSearchFilter: false,
      itemsShowLimit: 1,
      showSelectedItemsAtTop: true,
      closeDropDownOnSelection: true,
    };
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "name",
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
  }

  getBranchAccessList() {
    this.apiService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.branchAccessList = res.branchAccessList;
          this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        } else {
          this.branchAccessList = [
            {
              id: this.userDet.branch.branchId,
              name: this.userDet.branch.name,
            },
          ];
        }
      }
      else {
        this.branchAccessList = [
          {
            id: this.userDet.branch.branchId,
            name: this.userDet.branch.name,
          },
        ];
      }
    });
  }

  /* Change branch selction
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  onChangeBranch(event: any) {
    console.log(event);
    // this.getDeptList(event);
    this.searchDet.cell = [];
    this.searchDet.dept = [];
    this.searchDet.deptList = [];
    this.cellList = [];
    // this.getCellList();
    this.getDeptList();
  }
  /* get department list on branch selection
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  getDeptList() {
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      this.apiService
        .getdepartmentlistbybranchid("getdepartmentlistbybranchid/" + this.searchDet.branch[0].id)
        .subscribe((response: any) => {
          if (response.result) {
            if (response.deptList != null && response.deptList.length > 0) {
              /* Use For Add Screen */
              this.deptList = this.setArray(
                response.deptList,
                "deptId",
                "deptName"
              );
              /* Use For Filter */
              this.searchDet.deptList = this.setArray(
                response.deptList,
                "deptId",
                "deptName"
              );
              console.log(response);
              if (this.ojtPlanList == null || this.ojtPlanList.length == 0) {
                this.getOJTPlanList("");
              }
            }
          } else {
            this.deptList = [];
          }
        }
        );
    }

  }
  onChangeDept(event: any) {
    console.log(event);
    this.searchDet.dept = [{ id: event.id, name: event.name }];
    this.cellList = [];
    this.searchDet.cell = [];
    this.searchDet.cell = null;
    this.getCellList();
  }
  getCellList() {
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      var req: any = {
        branchId: this.searchDet.branch[0].id
      }
      if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
        req.deptId = this.searchDet.dept[0].id;
      }
      this.apiService.getCellList('apis/sm/getCellList', req).subscribe((response: any) => {
        if (response.result) {
          if (response.dataList != null && response.dataList.length > 0) {
            // for (let index = 0; index < response.dataList.length; index++) {
            //   response.dataList[index].tmpName = '';
            //   if (response.dataList[index].lineName) {
            //     response.dataList[index].tmpName += response.dataList[index].lineName;
            //     if (response.dataList[index].deptName) {
            //       response.dataList[index].tmpName += ' (Department : ' + response.dataList[index].deptName + ')';
            //     }
            //   }
            // }
            this.cellList = this.setArray(response.dataList, 'lineId', 'tmpName');
            this.searchDet.cellList = this.setArray(
              response.dataList,
              "lineId",
              "lineName"
            );
            this.searchDet.cell = [];
            console.log(this.searchDet.cellList)
          } else {
            this.cellList = [];
            this.searchDet.cellList = [];
          }
        } else {
          this.cellList = [];
          this.searchDet.cellList = [];
        }
      })
    } else {
      this.cellList = [];
    }
  }

  getFilterList(form: any) {
    this.submitAttempted = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach((key) => {
        form.controls[key].markAsDirty();
      });
      return;
    }
    this.isAppliedFilter = true;
    if (form.value.branch != undefined || form.value.cell != undefined) {
      this.searchDet.filterFlag = true;
    }
    this.clearPagination();
    this.searchDet.filterPopupOpen = false;
    this.modalService.dismissAll();
    this.getOJTPlanList("Filter");
  }
  getSearchListData(ev) {
    // this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = "";
    }
    if (this.filterFlag) {
      this.getOJTPlanList("filter");
    } else {
      this.getOJTPlanList("");
    }
  }
  // Get OJT Plan List
  getOJTPlanList(searchfilter) {
    this.listLoading = true;
    if (
      this.staticPagination.offset > 0 &&
      this.filterFlag == false &&
      searchfilter == "filter"
    ) {
      this.clearPagination();
    }
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset =
        (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let reqData: any = {
      orgId: this.userDet.organization.orgId,
      offset: this.staticPagination.offset,
      limit: this.staticPagination.itemsPerPage,
    };
    if (this.sorting) {
      if (this.sorting.direction != "") {
        reqData.colName = this.sorting.active;
        reqData.orderType = this.sorting.direction;
      }
    }
    if (
      this.searchDet.searchData &&
      this.searchDet.searchInput &&
      this.searchDet.searchInput != ""
    ) {
      reqData.search = this.searchDet.searchInput;
    }
    // if (searchfilter == "filter") {
    //   if (this.formdata.invalid) {
    //     Object.keys(this.formdata.controls).forEach((key) => {
    //       this.formdata.controls[key].markAsDirty();
    //     });
    //     return;
    //   }
    // }
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      reqData.branchId = this.searchDet.branch[0].id;
    }
    else {
      reqData.branchId = this.userDet.branch.branchId;
    }
    if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
      reqData.deptIds = [this.searchDet.dept[0].id];
    }
    if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
      reqData.lineIds = this.getIDsArray(this.searchDet.cell)
    }
    // if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
    //   for (let i = 0; i < this.cellList.length; i++) {
    //     if (this.cellList[i].lineId == this.searchDet.cell[0].id) {
    //       reqData.deptIds = [this.searchDet.cell[0].id];
    //     }
    //   }

    // }
    this.apiService.getOJTPlan("apis/sm/getOJTPlanList", reqData).subscribe(
      (response: any) => {
        console.log(response);
        this.listLoading = false;
        if (response.result) {
          if (this.staticPagination.page == 1) {
            this.staticPagination.total = response.totalCount;
            this.staticPagination.totalPages = Math.ceil(
              response.totalMyActionCount / this.staticPagination.itemsPerPage
            );
          }
          if (response.dataList != null && response.dataList.length > 0) {
            this.ojtPlanList = response.dataList;
            console.log(this.ojtPlanList);
            this.staticPagination.listLength = response.dataList.length;
          } else {
            this.ojtPlanList = [];
          }
        } else {
          this.ojtPlanList = [];
        }
        (error: any) => {
          this.ojtPlanList = [];
          this.listLoading = false;
        }
      }, (error: any) => {
        this.ojtPlanList = []
        this.listLoading = false;

      })
  }
  addOJTPlan(modal: any, data: any, flag: boolean) {
    console.log(data);
    if (data == "") {
      var data: any = {
        title: "Add OJT Plan",
        isEditable: false,
        // isEditPoint: false,
        // isEditParameter: false,
        planId: 0,
      };
    } else {
      var data: any = data;
      data.title = "Update OJT Plan";
      data.isEditable = true;
      data.planId = data.planId;
    }
    var tmpData = Object.assign({}, data, { 'tmpPagination': this.staticPagination });
    if (modal) {
      if (tmpData != undefined) {
        localStorage.removeItem("ojtPlanDetails");

        localStorage.setItem("ojtPlanDetails", JSON.stringify(tmpData));
      } else {
        localStorage.removeItem("ojtPlanDetails");
      }
      var modalRef = this.modalService.open(modal, {
        windowClass: "right",
      });
      modalRef.result.then(
        (result) => {
          if (result === "success") {
            this.searchDet.selectedRegiType = "";
          }
        },
        (reason) => {
          this.getOJTPlanList("");
          console.log(reason);
        }
      );
      modalRef.componentInstance.modalClosed.subscribe(() => {
        this.getOJTPlanList("");
      });
    }
  }

  deleteOJTPlan(data: any) {
    console.log(data);
    Swal.fire({
      title: "Are You Sure!",
      text: "Do you want to remove this OJT Plan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7044cd",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes Remove It",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      this.dataSpinner[data.planId] = true;
      if (result.isConfirmed) {
        this.apiService
          .deleteOJTPlan("apis/sm/deleteOJTPlan/" + data.planId)
          .subscribe((data: any) => {
            this.dataSpinner[data.planId] = false;
            if (data.result) {
              this.alertService.success("OJT Plan Deleted Sucessfully");
              this.getOJTPlanList("");
            } else {
              if (data.statusCode == 100) {
                this.alertService.error(data.reason);
              } else {
                this.alertService.error(
                  "Error Occurred While Deleting Data. Please Try Again"
                );
              }
            }
          });
      } else {
        this.dataSpinner[data.planId] = false;
      }
    });
  }

  filterModalOpen(modal) {
    console.log("In filter");
    if (!this.filterFlag) {
      // this.filterData.reset();
    }
    this.modalService.open(modal, {
      windowClass: "filterPopup",
    });
  }

  /*
     Common function for set an array for dropdown
     Author: Jayshri Kolase
     Date : 21 Aug 2023
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
    Common function For get Ids from array
    Author: Mahesh W
    Date : 21 Aug 2023
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

  viewPlan(data) {
    console.log(data);
    this.apiService.getOJTPlanDetails('apis/sm/getOJTPlanDetails/' + data.planId).subscribe((res: any) => {
      console.log(res);
      if (res.result) {
        console.log(res);
        res.ojtPlan.column.push({
          "field": "assessmentType",
          "heading": "Assessment Type"
        });
        res.ojtPlan.column.push({
          "field": "assessmentStatus",
          "heading": "Safety Assessment Status"
        })
        this.viewPlanData = res.ojtPlan;
        this.tableData = this.viewPlanData.ojtRegiList;
        if (this.tableData != null && this.tableData.length > 0) {
          this.viewPlanData.trainer = this.tableData[0].trainerName;
        }
        const datePipe = new DatePipe('en-US');
        this.viewPlanData.updatedDate = datePipe.transform(this.viewPlanData.updatedDate, 'yyyy-MM-dd');
        console.log(this.viewPlanData);
        console.log(this.tableData);
        this.getWorkstationList();
      }
    })
  }
  handleIconClick(x: any) {
    this.viewPlan(x);
    this.modalOpen(this.rightModal, "right");
  }
  modalOpen(modal, popupClass) {
    const modalElement = this.rightModal.nativeElement;
    this.modalService.open(modal, {
      windowClass: popupClass,
    });
  }

  sortData(sort: Sort) {
    this.sorting = sort;
    this.getOJTPlanList("");
  }

  loadMore(data: any) {
    this.staticPagination = data;
    this.ojtPlanList = [];
    this.listLoading = true;
    if (this.filterFlag) {
      this.getOJTPlanList("filter");
    } else {
      this.getOJTPlanList("");
    }
    // this.getTrainingTestDetails();
  }
  clearPagination() {
    this.staticPagination = {
      total: 0,
      page: 1,
      maxSize: 5,
      itemsPerPage: 10,
      totalPages: 0,
      listLength: 0,
    };
  }

  selectedRegi(type) {
    localStorage.removeItem('ojtPlanDetails');
    if (type) {
      if (type === 'Register OJT Plan') {
        // Open the AddOjtPlan modal
        this.addOJTPlan(this.AddOjtPlan, '', true)
      } else if (type === 'Register OJT') {
        // Open the OJTRegi modal
        this.OJTRegistration(this.OJTRegi, '', true)
      }
    }
  }

  OJTRegistration(modal: any, data: any, flag: boolean) {
    console.log(data);
    if (data == "") {
      var data: any = {
        title: "OJT Registration",
        isEditable: false,
      };
    } else {
      var data: any = data;
      data.title = "OJT Registration";
      data.isEditable = true;
      data.planId = data.planId;
    }
    console.log(data)
    localStorage.setItem("OJTRegiData", JSON.stringify(data));
    if (modal) {
      var modalRef = this.modalService.open(modal, {
        windowClass: "right",
      });
      this.getOJTPlanList("");
      modalRef.result.then(
        (result) => {
          if (result === "success") {
            this.searchDet.selectedRegiType = [];
            this.getOJTPlanList("")
          }
        },
        (reason) => {
          console.log(reason);
          this.getOJTPlanList("");
        }
      );
    }
  }

  resetSelectedRegiType() {
    console.log("resetSelectedRegiType() called");
    this.searchDet.selectedRegiType = [];
  }
  /* 
  Remove Filter
   @Author Saurabh salunke
* @Date August 31, 2023
*/
  removeFilter() {
    this.submitAttempted = false;
    this.formdata.reset();
    this.searchDet.branch = [];
    this.searchDet.dept = [];
    this.searchDet.cell = [];
    this.isAppliedFilter = false;
    this.searchDet.filterFlag = false;
    this.searchDet.filterPopupOpen = false;
    this.submitAttempted = false;
    this.ojtPlanList = [];
    // this.getDeptList(this.branchAccessList[0]);
    // this.cellList();
    this.getOJTPlanList("");
  }


  /* SHow Color code
     @Author Jayshri Kolase
    * @Date Oct 11, 2023
  */
  getColorClass(row: any, column: any,): string {
    if (row && row.workstation && row.workstation === column.field) {
      // Check if the workstation matches the column field
      return "#ffff00"; // Set the background color to yellow
    } else {
      // If the workstation does not match, check the skill level
      const requireSkillLevel = row[column.field]?.requireSkillLevel;
      const currentSkillLevel = row[column.field]?.currentSkillLevel;

      if (requireSkillLevel && currentSkillLevel) {
        if (currentSkillLevel.currentSkillLevelId >= requireSkillLevel.currentSkillLevelId) {
          return "#99cd3a"; // Set the background color to green
        }
      }
    }

    return "#FFFFFF"; // Default background color
  }
  /* get Current Skill Level
    @Author Jayshri Kolase
   * @Date Oct 11, 2023
 */
  getCurrentSkillLevel(rowData, column) {
    if (column == rowData.workstation) {
      return rowData[column].requireSkillLevel;
    }
    else if (rowData[column].requireSkillLevel == rowData.currentLvl) {
      return rowData.currentLvl;
    }
    return null;
  }
  // || rowData.currentSkillLvlId > rowData[column].requireSkillLevelId
  getRequireSkillLevel(field: string): string {
    const ojtRegiList = this.viewPlanData.ojtRegiList;
    const matchingObject = ojtRegiList.find((item) => field in item);
    if (matchingObject) {
      for (const key in matchingObject) {
        if (matchingObject.hasOwnProperty(key) && key === field) {
          const fieldData = matchingObject[field];
          return fieldData.requireSkillLevel;
        }
      }
    } else {
      return "";
    }
  }
  /* Get Workstation List
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  getWorkstationList() {
    if (this.viewPlanData) {

      let getReq = {
        "orgId": this.userDet.organization.orgId,
        "branchId": this.viewPlanData.branchId,
        "deptId": this.viewPlanData.deptId,
        "lineIds": [this.viewPlanData.lineId]
      };
      console.log(getReq);
      this.apiService.getWorkstationList('apis/sm/getWorkstationList', getReq).subscribe((response: any) => {
        console.log(response);
        if (response.result) {
          this.worksatationData = response.dataList;
        }
        else {
          this.worksatationData = [];
        }
      });
    }
  }

  /*
     Combined Header Employee Name and Employee Level
     Author: Mahesh W
     Date : 11 Oct 2023
  */
  getCombinedHeader() {
    const empLevelColumn = this.viewPlanData.column.find(column => column.field === 'empName');
    return ` ${empLevelColumn.heading}`;
  }

  /* Get Heading With Level
    @Author Jayshri Kolase
   * @Date Oct 10, 2023
 */
  getHeadingWithLevel(field: string, heading: string): string {
    const workstationMatch = this.worksatationData.find(item => item.workstation === field);
    if (workstationMatch) {
      return `${heading} (${workstationMatch.levelName})`;
    } else {
      return heading;
    }
    // const columnMatch = this.columns.find(column => column.field === field);
    // return columnMatch ? columnMatch.heading : field;
  }
  isObjectEmpty(objectName) {
    return Object.keys(objectName).length == 0
  }
  isChecked(row: any, field: string) {
    let obj: any = {};
    // this.isSelected(row, field);
    for (let item in row) {
      if (field == item) {
        //Condition 1
        if (row[item].hasOwnProperty("currentSkillLevel") && row[item].hasOwnProperty("currentSkillLevelId")) {
          if (row[item].currentSkillLevelId == row[item].requireSkillLevelId) {
            return { 'status': this.constant.EQUAL, level: row[item].currentSkillLevel };
          } else if (row[item].currentSkillLevelId > row[item].requireSkillLevelId) {
            return { 'status': this.constant.EQUAL, level: row[item].currentSkillLevel };
          } else if (row[item].currentSkillLevelId + 1 == row[item].requireSkillLevelId) {
            return { 'status': this.constant.ELIGIBLE, level: row[item].currentSkillLevel };
          } else if (row[item].requireSkillLevelId > row[item].currentSkillLevelId + 1) {
            return { 'status': this.constant.NOT_ELIGIBLE, level: row[item].currentSkillLevel };
          }
        } else {
          if (row[item].requireSkillLevelId == 1) {
            return { 'status': this.constant.ELIGIBLE, level: row[item].requireSkillLevel };
          } else {
            return { 'status': this.constant.NOT_ELIGIBLE, level: row[item].requireSkillLevel };
          }
        }
      }
    }
    return obj;
  }
  getSortFunction(array, fieldToSort) {
    console.log(array, fieldToSort);
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "plant" || fieldToSort === "dept" || fieldToSort === "cell") {
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

  exportExcelReport() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("OJT Plan", {});

    worksheet.addRow(["Plant", "Cell", "OJT Plan Date", "Trainer"]);
    worksheet.addRow([this.viewPlanData.branchName, this.viewPlanData.deptName, this.viewPlanData.updatedDate, this.viewPlanData.trainer]);
    worksheet.addRow([]);

    let tableHeader = [];
    this.viewPlanData.column.forEach(element => {
      if (element.field == 'cmpyEmpId' || element.field == 'empName') {
        tableHeader.push(element.heading);
      }
    });

    this.viewPlanData.column.forEach(element => {
      if (element.field !== 'empId' && element.field !== 'cmpyEmpId' && element.field !== 'empName') {
        tableHeader.push(element.heading);
      }
    });

    worksheet.addRow(tableHeader);
    let highlightCellIndexes: any = [];
    this.viewPlanData.ojtRegiList.forEach((rowData, rowIndex) => {
      let tableRow = [];

      this.viewPlanData.column.forEach(column => {
        if (column.field !== 'empId' && (column.field == 'cmpyEmpId' || column.field == 'empName')) {
          tableRow.push(rowData[column.field]);
        }
      });

      this.viewPlanData.column.forEach((column, colIndex) => {
        if (column.field !== 'empId' && column.field !== 'cmpyEmpId' && column.field !== 'empName' && rowData !== 'empName' && rowData !== 'cmpyEmpId') {
          if (rowData.hasOwnProperty(column.field) && rowData.workstation === column.field) {
            tableRow.push(this.getCurrentSkillLevel(rowData, column.field));
            highlightCellIndexes.push({
              row: rowIndex,
              col: colIndex,
              color: this.getColorClass(rowData, column)
            })
          } else {
            tableRow.push("");
          }
        }
      })

      worksheet.addRow(tableRow);
    });

    //Bold headers
    worksheet.getRow(1).font = {
      bold: true
    }
    worksheet.getRow(4).font = {
      bold: true
    }

    //Highlighting cells
    highlightCellIndexes.forEach(element => {
      let row = worksheet.getRow(element.row + 5);
      row.getCell(element.col + 3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: element.color.replace('#', '') }
      }

      row.getCell(element.col + 3).border = {
        top: { style: 'double', color: { argb: 'f6f6f6' } },
        left: { style: 'double', color: { argb: 'f6f6f6' } },
        bottom: { style: 'double', color: { argb: 'f6f6f6' } },
        right: { style: 'double', color: { argb: 'f6f6f6' } }
      };
    });

    worksheet.columns.forEach((column, index) => {
      if (index == 0)
        column.width = 20
      else if (index == 1)
        column.width = 30
      else
        column.width = 15
    })


    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "OJT Plan Details";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  canEditStartDate(x: any): boolean {
    const today = new Date();
    const startDate = new Date(x.staretDate); // Assuming x.staretDate is a valid date string

    // Calculate the difference in milliseconds between today and the start date
    // const timeDiff = startDate.getTime() - today.getTime();
    if (startDate.getTime() > today.getTime() && startDate.getTime() != today.getTime()) {
      return true;
    }
    else {
      return false;
    }

    // // Check if the start date is equal to or earlier than today
    // // and if the difference is less than or equal to -1 day (86400000 milliseconds)
    // return timeDiff <= -86400000;
  }

  getFormatDate(date) {
    const inputDate = new Date(date);
    const day = String(inputDate.getDate()).padStart(2, "0");
    const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1.
    const year = inputDate.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    console.log(formattedDate);
    if (formattedDate == "NaN/NaN/NaN") {
      return " ";
    }
    else {
      return formattedDate;
    }
  }

  getExportingDetails(x) {
    console.log(x)
    this.apiService.getOJTPlanDetails('apis/sm/getOJTPlanDetails/' + x.planId).subscribe((res: any) => {
      console.log(res);
      if (res.result) {
        console.log(res);
        this.exportingDetails = res.ojtPlan;
        if (this.exportingDetails.ojtRegiList.length > 0 && this.exportingDetails.ojtRegiList != null) {
          for (let i = 0; i < this.exportingDetails.ojtRegiList.length; i++) {
            this.exportingDetails.ojtRegiList[i].srNo = i + 1;
            this.exportingDetails.ojtRegiList[i].ojtPlanDate = this.getFormatDate(this.exportingDetails.startDate);
            this.exportingDetails.ojtRegiList[i].ojtActualDate = this.getFormatDate(this.exportingDetails.ojtRegiList[i].actualOJTDate);
            this.exportingDetails.ojtRegiList[i].examPlanDate = this.getFormatDate(this.exportingDetails.ojtRegiList[i].assessmentCreatedDate);
            this.exportingDetails.ojtRegiList[i].dateOfExamAttended = this.getFormatDate(this.exportingDetails.ojtRegiList[i].assessmentUpdatedDate);
            this.exportingDetails.ojtRegiList[i].status = this.exportingDetails.status;
          }
        }
        console.log(this.exportingDetails);
        this.exportToExcel();
      }
    })
  }

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Skill Matrix");

    const greenFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "99cd3a" },
    };

    const yellowFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFF00" },
    };
    const headers = [
      "SR NO",
      "OJT PLAN DATE",
      "OJT Actual Date",
      "EXAM PLAN DATE",
      "DATE OF EXAM ATTENDED",
      "EMPL. I.D.",
      "NAME OF OE",
      "CELL NAME",
      "WORKSTATION",
      "SKILL LEVEL PLAN",
      "PASS / FAIL"
    ];
    const commonColumnWidth = 15; // You can adjust this value as needed

    for (let i = 1; i <= headers.length; i++) {
      worksheet.getColumn(i).width = commonColumnWidth;
    }

    const mainHeading = Array(headers.length).fill("");
    const centerIndex = Math.floor(headers.length / 2);
    const monthName: string | undefined = this.getMonthName(this.exportingDetails.monthValue);
    const subHeading = Array(headers.length).fill("");
    subHeading[centerIndex] = "MONTH :- " + monthName + " " + this.exportingDetails.yearValue;
    mainHeading[centerIndex] = "Workstaion";

    // Set the height of the first row
    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 30;
    // Make the text in the first row bold
    worksheet.getRow(1).font = {
      bold: true,
    };
    worksheet.getRow(2).font = {
      bold: true,
    };
    worksheet.mergeCells("A1:K1"); // Merge cells from A1 to K1
    worksheet.getCell("A1").value = this.exportingDetails.lineName // Set the value for the merged cell
    worksheet.getCell("A1").fill = greenFill; // Apply the fill color
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    }; // Center the text

    // Set the height of the merged cell
    worksheet.getCell("A1").border = {
      top: { style: 'thin' }, // Add a thin border to the top
      bottom: { style: 'thin' }, // Add a thin border to the bottom
    };
    worksheet.mergeCells("A2:K2"); // Merge cells from A1 to K1
    // worksheet.getCell("A2").value = "MONTH :- " + monthName + " " + - +" " + this.exportingDetails.yearValue // "-" Negative sign in the concatinatating is causing extra 0 in the yearValue
    worksheet.getCell("A2").value = "MONTH :- " + monthName + " " + this.exportingDetails.yearValue;
    worksheet.getCell("A2").fill = yellowFill; // Apply the fill color
    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    }; // Center the text

    // Set the height of the merged cell
    worksheet.getCell("A2").border = {
      top: { style: 'thin' }, // Add a thin border to the top
      bottom: { style: 'thin' }, // Add a thin border to the bottom
    };


    worksheet.addRow(headers);

    // Add data to the worksheet
    this.exportingDetails.ojtRegiList.forEach((item) => {
      const row = [
        item.srNo,
        item.ojtPlanDate,
        item.ojtActualDate,
        item.examPlanDate,
        item.dateOfExamAttended,
        item.cmpyEmpId,
        item.empName,
        item.lineName,
        item.workstation,
        item.desiredLvl,
        item.assessmentStatus
      ];
      worksheet.addRow(row);
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "OJT_Plan.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  getMonthName(monthValue: number): string | undefined {
    const monthNames: string[] = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    if (monthValue >= 1 && monthValue <= 12) {
      return monthNames[monthValue - 1];
    }

    return undefined; // Return undefined for invalid month values
  }
}
