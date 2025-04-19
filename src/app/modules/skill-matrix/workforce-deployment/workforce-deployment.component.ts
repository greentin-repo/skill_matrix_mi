import { Component, Inject, OnInit } from "@angular/core";
import { SkillingService } from "../skilling.service";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import * as ExcelJS from "exceljs";
import * as moment from "moment";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';



@Component({
  selector: "app-workforce-deployment",
  templateUrl: "./workforce-deployment.component.html",
  styleUrls: ["./workforce-deployment.component.scss"],
})
export class WorkforceDeploymentComponent implements OnInit {
  submitAttempted: boolean = false;
  userDet: any = {};
  cellLineList: any = [];
  filterData: FormGroup;
  searchDet: any = {};
  selectedDet: any = {};
  branchAccessList: any = [];
  workforceList: any = [];
  deptList: any = [];
  SingleDropdownSettings: IDropdownSettings = {};
  filterFlag: boolean = false;
  listLoader: boolean = false;
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50,
  };
  headings: any = {};
  WorkForceDetails: any = [];
  empListArray: any = [];
  columnsArray: any = [];
  headingName: any = [];
  date: string;
  isAppliedFilter: boolean = false;
  sorting: Sort;
  selectedBranchId: any;
  selectedDeptId: any;

  constructor(
    private apiService: SkillingService,
    public modalConfig: NgbModalConfig,
    public fb: FormBuilder,
    public modalService: NgbModal
  ) {
    modalConfig.backdrop = "static";
    modalConfig.keyboard = false;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem("userDet"));
    console.log(this.userDet);

    const today = new Date();
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "name",
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };

    this.getBranchAccessList();
    this.date = moment(new Date()).format("YYYY-MM");

    this.filterData = this.fb.group({
      branchId: new FormControl("", Validators.required),
      deptId: new FormControl(""),
      lineIds: new FormControl(""),

    });
    this.getWorkforceList('');

  }

  /* gets Branch access list on employee
     @Author Shashi
     @Date Sept 12, 2023
  */
  getBranchAccessList() {
    this.apiService
      .getBranchAccessList(
        "getBranchAccessSetupByEmpId/" +
        this.userDet.organization.orgId +
        "/" +
        this.userDet.empId
      )
      .subscribe((res: any) => {
        if (res.result) {
          if (res.branchAccessList != null && res.branchAccessList.length > 0) {
            this.branchAccessList = this.setArray(
              res.branchAccessList,
              "branchId",
              "branchName"
            );
            this.branchAccessList = this.sortFunction(this.branchAccessList, "branchName");
            console.log(this.branchAccessList);
            // this.searchDet.branch = [this.branchAccessList[0]];
            console.log(this.searchDet.branch);
            // this.getDeptList();
          } else {
            this.branchAccessList = [
              {
                id: this.userDet.branch.branchId,
                name: this.userDet.branch.name,
              },
            ];
          }
        } else {
          this.branchAccessList = [
            {
              id: this.userDet.branch.branchId,
              name: this.userDet.branch.name,
            },
          ];
        }
        this.branchAccessList = this.sortFunction(
          this.branchAccessList,
          "name"
        );
        // this.searchDet.branch = [this.branchAccessList[0]];
        // this.getDeptList();
        // this.getWorkforceList();
      });
  }

  /* Change branch selction
     @Author Shashi
     @Date Sptember 12, 2023
  */
  // onChangeBranch(event: any) {
  //   if (event) {
  //     console.log(event);
  //     this.searchDet.dept=[];
  //     this.deptList=[];
  //     this.getDeptList();
  //   } else {
  //     this.cellList = [];
  //     this.searchDet.cell= [];
  //     this.workforceList = [];
  //   }
  // }
  resetFormField(form, keyName) {
    Object.keys(form.controls).forEach((key) => {
      if (key == keyName) {
        form.get(keyName).reset();
        form.get(keyName).markAsPristine();
        form.get(keyName).markAsUntouched();
      }
    });
  }
  onChange(ev: any, type) {
    if (ev) {
      if (type == "plant") {
        this.resetFormField(this.filterData, "searchDet.branch");
        this.resetFormField(this.filterData, "searchDet.deptId");
        this.resetFormField(this.filterData, "searchDet.lineIds");
        this.getDeptList(ev);
        //this.getLineNameList(ev);
        this.searchDet.deptId = [];
        this.searchDet.deptList = [];

      }
      else if (type == "dept") {
        console.log(ev)
        this.getCellList(this.searchDet.branch);
        //this.getLineNameList(ev);
        this.searchDet.lineIds = [];
      }
    } else {
      if (type == "plant") {
        if (this.searchDet) {
          this.searchDet.deptList = [];
          this.searchDet.lineIds = [];

        }
      }
      else if (type == "dept") {
        if (this.searchDet) {
          this.searchDet.lineIds = [];
        }
      }
    }
  }
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.filterFlag) {
      this.getWorkforceList('filter');
    } else {
      this.getWorkforceList('');
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

  /* Change dept selction
     @Author Shashi
     @Date Sptember 12, 2023
  */
  // onChangeDept(data: any) {
  //   if (data) {
  //     console.log("enter");
  //     this.searchDet.dept=[{id:data.id,name:data.id}];
  //     this.searchDet.cell=[];
  //     this.cellList=[];
  //     this.getCellList();
  //     // this.getWorkforceList();
  //   } else {
  //     this.cellList = [];
  //     this.searchDet.cell = [];
  //     this.workforceList = [];
  //   }
  // }
  onChangeCell(data: any) {
    if (data) {
      // this.getWorkforceList();
    } else {
      this.workforceList = [];
    }
  }
  removeFilter() {
    this.isAppliedFilter = false;
    this.filterData.reset();
    this.searchDet.branch = [];
    this.searchDet.deptId = [];
    this.searchDet.lineIds = [];
    this.searchDet.fromDate = null;
    this.searchDet.toDate = null;
    //this.searchDet.statusId = [];
    this.getWorkforceList('');
  }

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
    this.getWorkforceList('filter');
    this.modalService.dismissAll();
  }

  getDeptList(branch) {
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      this.apiService
        .getdepartmentlistbybranchid(
          "getdepartmentlistbybranchid/" + branch.id
        )
        .subscribe((res: any) => {
          if (res.result) {
            console.log(res);
            if (res.deptList != null && res.deptList.length > 0) {
              /* Use For Add Screen */
              console.log(res.deptList);
              this.searchDet.deptList = this.setArray(res.deptList, "deptId", "deptName");
              this.searchDet.deptList = this.sortFunction(this.searchDet.deptList, "deptName");
              // this.searchDet.dept = [this.deptList[0]];
              // this.getCellList();
            } else {
              this.searchDet.deptList = [];
            }
          } else {
            this.searchDet.deptList = [];
          }
        });
    } else {
      // this.cellList = [];
      // this.searchDet.cell = [];
      // this.workforceList = [];
    }
  }

  /* get department list on branch selection
     @Author Shashi
    * @Date August 12, 2023
  */
  getCellList(branchId) {
    this.selectedBranchId = this.searchDet.branch[0].id;
    console.log(this.selectedBranchId);
    this.selectedDeptId = this.searchDet.deptId[0].id;
    console.log(this.selectedDeptId)
    const data = {
      branchId: this.selectedBranchId,
      deptId: this.selectedDeptId
    };
    // var req: any = {
    //   branchId: this.searchDet.branch[0].id,
    //   deptId : this.searchDet.dept[0].id
    // };
    // if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
    //   req.deptId = this.searchDet.dept[0].id;
    // }
    console.log(data);
    this.apiService
      .getCellList("apis/sm/getCellList", data)
      .subscribe((response: any) => {
        if (response.result) {
          if (response.dataList != null && response.dataList.length > 0) {
            console.log(response.dataList)
            this.cellLineList = this.setArray(
              response.dataList,
              "lineId",
              "lineName"
            );
            this.cellLineList = this.sortFunction(
              this.cellLineList,
              "lineName"
            );
            // this.searchDet.cell = [this.cellList[0]];
            // this.getWorkforceList();
          } else {
            this.cellLineList = [];
          }
        } else {
          this.cellLineList = [];
        }
      });
  }


  getWorkforceList(searchFilter) {
    this.workforceList = [];
    this.listLoader = true;
    let req: any = {
      branchId: this.userDet.branch.branchId,
      orgId: this.userDet.organization.orgId,
      offset: this.staticPagination.offset,
      limit: this.staticPagination.itemsPerPage,
    };
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
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
    if (searchFilter == 'filter') {
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
        req.toDate = moment(this.searchDet.toDate).format("YYYY-MM-DD");
      }
      // if (this.searchDet.statusId != null) {
      //   req.status = this.searchDet.statusId[0].id;
      // }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      req.search = this.searchDet.searchInput;
    }
    this.staticPagination.listLength = 10;

    console.log(req);
    this.apiService
      .getWorkforceDeploymentData("apis/sm/getWorkForceDeploymentList", req)
      .subscribe((res: any) => {
        this.listLoader = false;
        if (res.result) {
          if (res.dataList != null && res.dataList.length > 0) {
            this.workforceList = res.dataList;
            console.log(this.workforceList)
            if (this.staticPagination.page == 1) {
              this.staticPagination.total = res.totalCount;
              this.staticPagination.totalPages = (this.staticPagination.total > 0) ? Math.ceil(this.staticPagination.total / this.staticPagination.itemsPerPage) : 0;
            }
            //If showing action list for stage 1 then sorting it day wise 1 to N
            let isStage1 = true;
            this.workforceList.forEach(element => {
              if (element.stageId != 1) {
                isStage1 = false;
              }
            });

            if (isStage1) {
              this.workforceList = this.workforceList.sort(function (a, b) {
                return a.dayNo - b.dayNo;
              });
            }

            this.staticPagination.listLength = this.workforceList.length;
          } else {
            this.workforceList = [];
            this.staticPagination.listLength = this.workforceList.length;
          }
          this.staticPagination.listLength = this.workforceList.length;
        } else {
          this.workforceList = [];
          this.staticPagination.listLength = this.workforceList.length;
        }
      })
  }
  //     } else {
  //       this.actionList = [];
  //       this.staticPagination.listLength = this.actionList.length;
  //       //this.staticPagination.total = this.actionList.length;
  //     }
  //   }), (error: any) => {
  //     this.listLoading = false;
  //   });
  // }
  sortData(sort: Sort) {
    this.sorting = sort;
    console.log(this.sorting);
    this.getWorkforceList('');
  }
  getWorkForceDeploymentDetails(data) {
    this.headings.lineName = data.lineName;
    this.headings.deptName = data.deptName;
    this.headings.branchName = data.branchName;
    this.headings.shiftName = data.shiftName;
    console.log(data);
    var req: any = {
      deptId: data.deptId,
      branchId: data.branchId,
      lineId: data.lineId,
      shiftId: data.shiftId,
    };
    data.toDate = moment(new Date()).format("YYYY-MM");
    // req.fromDt = moment(data.fromDate).format("YYYY-MM-DD");
    // req.toDt =  moment(data.toDate).format("YYYY-MM-DD");

    console.log(req);
    this.apiService
      .getWorkForceDeploymentDetails(
        "apis/sm/getWorkForceDeploymentDetails",
        req
      )
      .subscribe((res: any) => {
        console.log(res);
        if (res.result) {
          this.WorkForceDetails = res.data;
          this.columnsArray = this.WorkForceDetails.columns;
          this.empListArray = this.WorkForceDetails.empList;
          this.exportToExcel();
          console.log(this.WorkForceDetails);
        }
      });
  }

  addWorkForce(modal, data, type) {
    this.selectedDet = data;
    this.selectedDet.title = type;
    var modalRef = this.modalService.open(modal, {
      windowClass: "right",
    });
    modalRef.result.then(
      (result) => {
        if (result === "success") {
          this.getWorkforceList('');
        }
        else {
          this.getWorkforceList('');
        }
      },
      (reason) => {
        console.log(reason);
        this.getWorkforceList('');
      }
    );
  }
  filterModalOpen(modal) {
    this.filterFlag = true
    this.modalService.open(modal, {
      windowClass: 'filterPopup',
    });
    this.getWorkforceList('filter');
  }
  sortFunction(array, key) {
    if (array != null && array.length > 0) {
      array.sort(function (a, b) {
        var nameA = !Number(a[key]) ? a[key].toUpperCase() : a[key];
        var nameB = !Number(b[key]) ? b[key].toUpperCase() : b[key];
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

  /*
     Common function for set an array for dropdown
     Author: Shashi
     Date : 12 Aug 2023
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
     Author: Shashi
     Date : 12 Sept, 2023
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
      "Emp Id",
      "Emp Name",
      // "Cell/Name",
      "Work Station",
      // "Skill Level",
    ];

    const commonColumnWidth = 15; // You can adjust this value as needed

    for (let i = 1; i <= headers.length; i++) {
      worksheet.getColumn(1).width = commonColumnWidth;
    }
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 25;
    const mainHeading = Array(headers.length).fill("");
    const centerIndex = Math.floor(headers.length / 2);
    mainHeading[centerIndex] = this.headingName;

    // Set the height of the first row
    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 30;
    worksheet.getRow(3).height = 30;
    // Make the text in the first row bold
    worksheet.getRow(1).font = {
      bold: true,
    };
    worksheet.getRow(2).font = {
      bold: true,
    };
    worksheet.getRow(3).font = {
      bold: true,
    };

    worksheet.mergeCells("A1:C1"); // Merge cells from A1 to K1
    worksheet.getCell("A1").value = "Plant :" + this.headings.branchName + "     " + "Department :" + this.headings.deptName + "     " + "Shift :" + this.headings.shiftName // Set the value for the merged cell
    // worksheet.getCell("A1").fill = greenFill; // Apply the fill color
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

    worksheet.mergeCells("A2:C2"); // Merge cells from A2 to K1
    worksheet.getCell("A2").value = this.headings.lineName // Set the value for the merged cell
    worksheet.getCell("A2").fill = greenFill; // Apply the fill color
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

    worksheet.mergeCells("A3:C3"); // Merge cells from A1 to K1
    worksheet.getCell("A3").value = "Fron Date :" + moment(this.WorkForceDetails.empList[0].fromDate).format("DD-MM-YYY") + "    To Date :" + moment(this.WorkForceDetails.empList[0].toDate).format("DD-MM-YYYY");
    worksheet.getCell("A3").fill = yellowFill; // Apply the fill color
    worksheet.getCell("A3").alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    }; // Center the text

    // Set the height of the merged cell
    worksheet.getCell("A3").border = {
      top: { style: 'thin' }, // Add a thin border to the top
      bottom: { style: 'thin' }, // Add a thin border to the bottom
    };
    worksheet.addRow(headers);

    // Add data to the worksheet
    this.WorkForceDetails.empList.forEach((item) => {
      const row = [
        // moment(item.fromDate).format("YYYY-MM-DD"),
        // moment(item.toDate).format("YYYY-MM-DD"),
        item.companyEmpId,
        item.empName,
        // item.line,
        item.workstationName,
        // item.currentSkillLevel,
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
      a.download = "skill-matrix.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
