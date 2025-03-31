import { Component, EventEmitter, OnInit, Output, ViewChild, } from "@angular/core";
import { Workbook } from "exceljs";
import * as moment from "moment";
import * as fs from "file-saver";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { ReportServiceService } from "./report-service.service";
import { NgbCalendar, NgbDateParserFormatter, NgbModal, } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormControl, FormGroup, Validators, } from "@angular/forms";
import { AlertService } from "src/app/theme/shared/components";
import { Sort } from "@angular/material/sort";

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
})
export class ReportComponent implements OnInit {
  @Output() dateRangeDates: EventEmitter<any> = new EventEmitter();
  companies = [
    {
      companyName: "Company A",
      companyLogo: "CompanyLogo A",
      mobileNo: "123-456-7890",
      location: "Location A",
    },
    {
      companyName: "Company B",
      companyLogo: "CompanyLogo B",
      mobileNo: "987-654-3210",
      location: "Location B",
    },
    {
      companyName: "Company C",
      companyLogo: "CompanyLogo C",
      mobileNo: "555-555-5555",
      location: "Location C",
    },
  ];
  selectedReport: any = {};
  selectedReportData: any = {};
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  userDet: any = {};
  data: any = {};
  plantList: any = [];
  departmentList: any = [];
  masterLevelList: any;
  listLoading: boolean = false;
  isDataAvail: boolean = false;
  selectReportCaption: any;
  fromDate: any;
  toDate: any;
  searchDet: any = {};
  filterData: FormGroup;
  dateType: string;
  selectedDate: any = {};
  isSet: boolean;
  dateObj: any = {};
  maxDate: any;
  selectedDateType: any = {};
  reportBody: any = {};
  tableAppliedSortData: any = {};
  reportName: any;
  isAppliedFilter: boolean = false;

  reportFilterFlag: boolean = false;
  sorting: any;
  // dateRangeDates: any = {};

  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0,
  };

  reportCaptionsList: any = [
    {
      id: 1,
      name: "Completion Discrepancy Report",
      reportCaption: "Completion_Discrepancy_Report",
      isDataFound: false,
    },
    {
      id: 2,
      name: "Assessment Success Rate",
      reportCaption: "Assessment_Success_Rate",
      isDataFound: false,
    },
    {
      id: 3,
      name: "Employee Performance Analysis",
      reportCaption: "Employee_Performance_Analysis",
      isDataFound: false,
    },
    {
      id: 4,
      name: "Cell Adherence Status",
      reportCaption: "Cell_Adherence_Status",
      isDataFound: false,
    },
    {
      id: 5,
      name: "Plant Adherence Status",
      reportCaption: "Plant_Adherence_Status",
      isDataFound: false,
    },
    {
      id: 6,
      name: "Multiskilling Status At Cell Level",
      reportCaption: "Multiskilling_Status_At_Cell_Level",
      isDataFound: false,
    },
    {
      id: 7,
      name: "Multiskilling Status At Plant Level",
      reportCaption: "Multiskilling_Status_At_Plant_Level",
      isDataFound: false,
    },
    {
      id: 8,
      name: "Task Completion Status",
      reportCaption: "Task_Completion_Status",
      isDataFound: false,
    },
    {
      id: 9,
      name: "Monthly Skill Matrix Report",
      reportCaption: "Monthly_Skill_Matrix_Report",
      isDataFound: false,
    },
    {
      id: 10,
      name: "Skill Gap Analysis",
      reportCaption: "Skill_Gap_Analysis",
      isDataFound: false,
    },
  ];
  selectedBranchId: any;
  cellLineList: any;
  dataList: any[];
  cellLineName: any;
  isSelectedReportDataFound: boolean = false;
  isSortingApplied: boolean=false;

  constructor(
    private reportService: ReportServiceService,
    public modalService: NgbModal,
    private calendar: NgbCalendar,
    private alertService: AlertService,
    public formatter: NgbDateParserFormatter,
    public fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.filterData = this.fb.group({
      branchId: new FormControl(),
      deptIds: new FormControl(),
      skillLvlId: new FormControl(),
    });
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
      // closeDropDownOnSelection: true,
    };

    this.filterData = this.fb.group({
      branchId: new FormControl("", Validators.required),
      skillLvlId: new FormControl(""),
      deptIds: new FormControl(""),
    });
    this.userDet = JSON.parse(localStorage.getItem("userDet"));
    this.getAccessiblePlantList();
    this.getReportLevelList();
  }

  callbackFuncGenReport = (appliedSort: any): void => {
    this.isSortingApplied=true
    console.log(appliedSort)
    this.tableAppliedSortData = appliedSort;
    this.generateReport("filter");
  };

  selectCustomDate(fromDate, toDate) {
    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);
    if (fromDate.value != null && fromDate.value != undefined && fromDate.value != "") {
      this.selectedReport.fromDate = new Date(fromDate.value);
    }
    if (toDate.value != null && toDate.value != undefined && toDate.value != "") {
      this.selectedReport.toDate = new Date(toDate.value);
    }
  }

  /* Reprt Generate Functionality post clicking on Generate Report OR after appling Filter
  Author Simran
  created Date 21/09/2023 */
  generateReport(searchFilter) {
    // && searchfilter == "filter"

    if (this.staticPagination.offset > 0 && this.searchDet.reportFilterFlag == false) {
      this.clearPagination();
    }
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let reqData: any = {
      orgId: this.userDet.organization.orgId,
      offset: this.staticPagination.offset,
      limit: this.staticPagination.itemsPerPage,
      reportCaption: this.selectedReport.reportCaption,
      // orgId: this.userDet.organization.orgId,
      branchId: this.userDet.branch.branchId,
      // lineIds: [this.userDet.line.id]
      // "deptId": this.userDet.dept.deptId,
      // colName: this.tableAppliedSortData.active,
      // orderType: this.tableAppliedSortData.direction,
    };

    console.log(reqData)
    // if (this.sorting) {
    //   if (this.sorting.direction != "") {
    //     reqData.colName = this.sorting.active;
    //     reqData.orderType = this.sorting.direction;
    //   }
    // }
    if ((this.selectedReport.reportType != undefined || this.selectedReport.reportType != null) && this.selectedReport.reportType.length > 0) {
      
      if(!this.isSortingApplied){
        this.listLoading = true;
      }
      // this.reportBody = {
      //   "reportCaption": this.selectedReport.reportCaption,
      //   "orgId": this.userDet.organization.orgId,
      //   "branchId": this.userDet.branch.branchId,
      //   // "deptId": this.userDet.dept.deptId,
      //   "colName": this.tableAppliedSortData.active,
      //   "orderType": this.tableAppliedSortData.direction
      // };
      if (searchFilter == "filter") {
        console.log(this.searchDet.branchId);
        if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0) {
          for (let i = 0; i < this.searchDet.branchId.length; i++) {
            reqData.branchId = this.searchDet.branchId[0].id;
          }
        }
        if (this.getIDsArray(this.searchDet.deptIds) != null && this.getIDsArray(this.searchDet.deptIds).length > 0) {
          for (let i = 0; i < this.getIDsArray(this.searchDet.deptIds).length; i++) {
            reqData.lineIds = this.getIDsArray(this.searchDet.deptIds);
          }
        }
        if (this.searchDet.skillLvlId != null && this.searchDet.skillLvlId.length > 0) {
          for (let i = 0; i < this.searchDet.skillLvlId.length; i++) {
          reqData.skillLevelId = this.searchDet.skillLvlId[0].id;
          }
        }
      }
      if (this.tableAppliedSortData && this.tableAppliedSortData.direction) {
        reqData.colName = this.tableAppliedSortData.active
        reqData.orderType = this.tableAppliedSortData.direction.toUpperCase();
      }
      reqData.fromDt = moment(this.selectedReport.fromDate).format("YYYY-MM-DD") + " 00:00:00";
      reqData.toDt = moment(this.selectedReport.toDate).format("YYYY-MM-DD") + " 23:59:59";

      this.selectedReport.isDataFound = false;
      this.isSelectedReportDataFound = false;
      this.reportService.getReportList("apis/sm/getSkillMatrixReport", reqData).subscribe((response: any) => {
        this.listLoading = false;
        this.isSortingApplied=false;
        for (const item of this.reportCaptionsList) {
          if (item.reportCaption === reqData.reportCaption) {
            this.reportName = item.name;
            break;
          }
        }
        if (response.result) {
          this.selectedReport.isDataFound = true;
          this.isSelectedReportDataFound = true;
          this.showReport(response);
        } else {
          this.showReport(response);
        }
      });
    } else {
      this.alertService.error("Please select report type");
    }
  }

  showReport(response: any) {
    if (this.selectedReport.reportCaption == "MULTI_SKILLING_REPORT") {
      this.setMultiSkillingReport(response.dataList);
    } else if (this.selectedReport.reportCaption == "Monthly_Skill_Matrix_Report") {
      this.setSkillMatrixCellPlantWiseReport(response);
    } else if (this.selectedReport.reportCaption == "Employee_Performance_Analysis") {
      this.setEmployeeWisePlanReport(response);
    } else if (this.selectedReport.reportCaption == "Task_Completion_Status") {
      this.setAverageTimeTakenReport(response);
    } else if (this.selectedReport.reportCaption == "Plant_Adherence_Status") {
      this.setPlantLevelAdherenceReport(response);
    } else if (this.selectedReport.reportCaption == "Cell_Adherence_Status") {
      this.setCellLevelAdherenceReport(response);
    } else if (this.selectedReport.reportCaption == "Completion_Discrepancy_Report") {
      this.setPlantVsActualReport(response);
    } else if (this.selectedReport.reportCaption == "Assessment_Success_Rate") {
      this.setAssessmentPassOrFailReport(response);
    } else if (this.selectedReport.reportCaption == "Multiskilling_Status_At_Cell_Level") {
      this.setCellWiseMultitaskingReport(response);
    } else if (this.selectedReport.reportCaption == "Multiskilling_Status_At_Plant_Level") {
      this.setPlantwiseMultitaskingReport(response);
    } else if (this.selectedReport.reportCaption == "Skill_Gap_Analysis") {
      this.setSkillGapCellWiseReport(response);
    }
  }

  exportReport() {
    this.listLoading = true;
    if (this.selectedReport.reportCaption == "Level_1_REPORT") {
      this.exportExcelReport();
    } else if (this.selectedReport.reportCaption == "Assessment_Success_Rate") {
      this.exportAssessmentPasssOrFail();
    } else if (this.selectedReport.reportCaption == "Task_Completion_Status") {
      this.exportAverageTime();
    } else if (this.selectedReport.reportCaption == "Cell_Adherence_Status") {
      this.exportCellLevelAdherence();
    } else if (this.selectedReport.reportCaption == "Plant_Adherence_Status") {
      this.exportPlantLevelAdherence();
    } else if (this.selectedReport.reportCaption == "Multiskilling_Status_At_Cell_Level") {
      this.exportCellWiseMultitasking();
    } else if (this.selectedReport.reportCaption == "Employee_Performance_Analysis") {
      this.exportEmployeeWisePlan();
    } else if (this.selectedReport.reportCaption == "OJT_PLAN_ORGWISE_REPORT") {
      this.exportPlantLevelAdherence();
    } else if (this.selectedReport.reportCaption == "Completion_Discrepancy_Report") {
      this.exportPlantVsActualComplition();
    } else if (this.selectedReport.reportCaption == "Multiskilling_Status_At_Plant_Level") {
      this.exportPlantWiseMultitasking();
    } else if (this.selectedReport.reportCaption == "Skill_Gap_Analysis") {
      this.exportSkillGap();
    } else if (this.selectedReport.reportCaption == "Monthly_Skill_Matrix_Report") {
      this.exportSkillMatrixCellWisePlantWise();
    }
    this.listLoading = false;
  }

  exportExcelReport() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Registration Status", {});
    headers = [
      { header: "Company Name", key: "companyName", width: 20 },
      { header: "Company Logo", key: "companyLogo", width: 20 },
      { header: "Mobile No.", key: "mobileNo", width: 20 },
      { header: "Location", key: "location", width: 20 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.companies.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        element[x] = element[x] ? element[x] : "N/A";
        rowslist[x] = element[x] ? element[x] : "N/A";
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "Level 1 Report";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  /* Report Exporting Functionality
  Author Simran
  created Date 21/09/2023 */
  exportAssessmentPasssOrFail() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Assessment Success Rate", {});
    headers = [
      
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Level", key: "levelName", width: 30 },
      { header: "Pass Count", key: "passCount", width: 30 },
      { header: "Fail Count", key: "failCount", width: 30 },
      { header: "Total Count", key: "totalCount", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.assessmentPassOrFail.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        //rowslist[x] = element[x];

        if (x == 'passCount') {
          rowslist[x] = element.passCount + ` (${(element.passPercentage)}%)`;
        }
        else if(x == 'failCount'){
          rowslist[x] = element.failCount + ` (${(element.failPercentage)}%)`;
        }
        else {
          rowslist[x] = element[x];
        }
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "ASSESSMENT_SUCCESS_RATE";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportAverageTime() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Task Completion Status", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Level", key: "levelName", width: 30 },
      { header: "Average Time", key: "avgTime", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.averageTimeTaken.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        rowslist[x] = element[x];
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "TASK_COMPLETION_STATUS";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportCellLevelAdherence() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Cell Adherence Status", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Workstation", key: "workstation", width: 30 },
      { header: "Level", key: "levelName", width: 30 },
      { header: "Plan", key: "plan", width: 30 },
      { header: "Completed", key: "completeCount", width: 30 },
      { header: "Complete %", key: "completePercentage", width: 30 },
      { header: "Pending", key: "pendingCount", width: 30 },
      { header: "Pending %", key: "pendingPercentage", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.cellLevelAdherence.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        rowslist[x] = element[x];
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "CELL_ADHERENCE_STATUS";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportCellWiseMultitasking() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Multiskilling Status At Cell Level", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Total Employee Count", key: "TotalEmp", width: 30 },
      { header: "Employee Multiskilling Count", key: "EmpMultiskillingCount", width: 30 },
      { header: "Multiskilling", key: "MultiskillingPercentage", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.cellWiseMultitasking.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        rowslist[x] = element[x];
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "MULTISKILLING_STATUS_AT_CELL_LEVEL";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportEmployeeWisePlan() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Employee Performance Analysis", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Plan", key: "planCount", width: 30 },
      { header: "Level", key: "levelName", width: 30 },
      { header: "Actual", key: "actulCount", width: 30 },
      { header: "Pass", key: "passCount", width: 30 },
      { header: "Fail", key: "failCount", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.employeeWisePlan.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        rowslist[x] = element[x];
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "EMPLOYEE_PERFORMANCE_ANALYSIS";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportPlantLevelAdherence() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Plant Adherence Status", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Level", key: "levelName", width: 30 },
      { header: "Plan", key: "plan", width: 30 },
      { header: "Completed", key: "completeCount", width: 30 },
      { header: "Complete %", key: "completePercentage", width: 30 },
      { header: "Pending", key: "pendingCount", width: 30 },
      { header: "Pending %", key: "pendingPercentage", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.plantLevelAdherence.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        rowslist[x] = element[x];
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "PLANT_ADHERENCE_STATUS";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportPlantVsActualComplition() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Completion Discrepancy Report", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Level", key: "levelName", width: 30 },
      { header: "Total Plan", key: "totalPlan", width: 30 },
      { header: "Actual Completion", key: "actualCompletion", width: 30 },
      { header: "Completion %", key: "completionPercentage", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.plantVsActual.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        rowslist[x] = element[x];
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "COMPLETION_DISCREPANCY_REPORT";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportPlantWiseMultitasking() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Multiskilling Status At Plant Level", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Total Employee", key: "TotalEmp", width: 30 },
      { header: "Employee Multiskilling Count", key: "EmpMultiskillingCount", width: 30 },
      { header: "Multiskilling %", key: "MultiskillingPercentage", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.plantWiseMultitasking.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        rowslist[x] = element[x];
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "MULTISKILLING_STATUS_AT_PLANT_LEVEL";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportSkillGap() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Skill Gap Analysis", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Level", key: "levelName", width: 30 },
      { header: "Skill Gap Count", key: "gapCount", width: 30 },
      { header: "Average", key: "gapAvg", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.skillGapCellWise.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        rowslist[x] = element[x];
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "SKILL_GAP_ANALYSIS";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  exportSkillMatrixCellWisePlantWise() {
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Monthly Skill Matrix Report", {});
    headers = [
      { header: "Plant", key: "branchName", width: 30 },
      { header: "Department", key: "deptName", width: 30 },
      { header: "Cell/Line", key: "lineName", width: 30 },
      { header: "Level", key: "levelName", width: 30 },
      { header: "Plan Count", key: "planCount", width: 30 },
      { header: "Actual Count", key: "actualCount", width: 30 },
      { header: "Workstation Name", key: "workstationName", width: 30 },
      { header: "Month Year", key: "monthYear", width: 30 },
    ];
    worksheet.columns = headers;
    console.log(worksheet.columns);
    worksheet.getRow(1).eachCell((cell, number) => {
      worksheet.getCell(cell.address).style = {
        font: { name: "Calibri", bold: true, color: { argb: "000" } },
      };
    });
    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);
    this.selectedReportData.skillMatrixCellPlantWise.forEach((element) => {
      rowslist = {};
      console.log(element);
      for (var x in element) {
        // element[x] = element[x] ? element[x] : "N/A";
        // ? element[x] : "N/A";
        // rowslist[x] = element[x];
        if (x == 'actualCount') {
          rowslist[x] = element.actualCount + ` (${(element.percentage)}%)`;
        }
        else {
          rowslist[x] = element[x];
        }
      }
      rows.push(rowslist);
      console.log(rows);
    });
    worksheet.addRows(rows, "n");
    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "MONTHLY_SKILL_MATRIX_REPORT";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });
  }

  /* To set the response for Reports
  Author Simran
  created Date 22/09/2023 */
  setMultiSkillingReport(data) {
    console.log(data);
    this.selectedReportData.mutltiSkillMatrixReport = [];
    if (data.multiskillingReport != null && data.multiskillingReport.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.mutltiSkillMatrixReport = data.multiskillingReport;
    } else {
      this.selectedReport.isDataFound = false;
      this.selectedReportData.mutltiSkillMatrixReport = [];
    }
  }

  setAssessmentPassOrFailReport(data) {
    console.log(data);
    this.selectedReportData.assessmentPassOrFail = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.assessmentPassOrFail = data.dataList;
      console.log(this.selectedReportData.assessmentPassOrFail);
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.assessmentPassOrFail = [];
    }
  }

  setAverageTimeTakenReport(data) {
    console.log(data);
    this.selectedReportData.averageTimeTaken = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.averageTimeTaken = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.averageTimeTaken = [];
    }
  }

  setCellLevelAdherenceReport(data) {
    console.log(data);
    this.selectedReportData.cellLevelAdherence = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.cellLevelAdherence = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.cellLevelAdherence = [];
    }
  }

  setCellWiseMultitaskingReport(data) {
    console.log(data);
    this.selectedReportData.cellWiseMultitasking = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.cellWiseMultitasking = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.cellWiseMultitasking = [];
    }
  }

  setEmployeeWisePlanReport(data) {
    console.log(data);
    this.selectedReportData.employeeWisePlan = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.employeeWisePlan = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.employeeWisePlan = [];
    }
  }

  setPlantLevelAdherenceReport(data) {
    this.selectedReportData.plantLevelAdherence = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.plantLevelAdherence = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.plantLevelAdherence = [];
    }
  }

  setPlantVsActualReport(data) {
    console.log(data);
    this.selectedReportData.plantVsActual = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.plantVsActual = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.plantVsActual = [];
    }
  }

  setPlantwiseMultitaskingReport(data) {
    console.log(data);
    this.selectedReportData.plantWiseMultitasking = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.plantWiseMultitasking = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.plantWiseMultitasking = [];
    }
  }

  setSkillGapCellWiseReport(data) {
    console.log(data);
    this.selectedReportData.skillGapCellWise = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.skillGapCellWise = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.skillGapCellWise = [];
    }
  }

  setSkillMatrixCellPlantWiseReport(data) {
    console.log(data);
    this.selectedReportData.skillMatrixCellPlantWise = [];
    if (data.dataList != null && data.dataList.length > 0) {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.skillMatrixCellPlantWise = data.dataList;
    } else {
      this.selectedReport.isDataFound = true;
      this.selectedReportData.skillMatrixCellPlantWise = [];
    }
  }

  getDateFromInput = function (type) {
    this.datePicker = {};
    this.datePicker.date = "";
    this.dateType = type;
    this.setdateType = type;
    console.log(type);
    var d = new Date();
    moment().endOf("month");
    this.toDate = moment(d).endOf("months").format("YYYY-MM");
    if (type == "1m") {
      this.fromDate = moment(d).subtract(1, "months").format("YYYY-MM");
    } else if (type == "6m") {
      this.fromDate = moment(d).subtract(6, "months").format("YYYY-MM");
    } else if (type == "1y") {
      this.fromDate = moment(d).subtract(1, "year").format("YYYY-MM");
    }
  };

  selectReport(ev) {
    this.selectReportCaption = ev;
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


  onSingleSelectDropdown(ev, type) {
    this.selectedReport.isDataFound = false;
    if (ev) {
      if (type == "reportType") {
        this.resetField();
        this.selectedReport.reportCaption = this.getObjFromArray(
          ev.id,
          this.reportCaptionsList
        ).reportCaption;
      }
    }
  }

  resetField() {
    this.tableAppliedSortData = {};
    this.selectedReport.fromDate = new Date(
      new Date().setFullYear(new Date().getFullYear() - 1)
    );
    this.selectedReport.toDate = new Date();
  }
  getObjFromArray(id, array) {
    var obj: any = {};
    if (array != null && array.length > 0) {
      for (let index = 0; index < array.length; index++) {
        if (array[index].id == id) {
          obj = array[index];
        }
      }
    }
    return obj;
  }

  filterModalOpen(modal) {
    if ((this.selectedReport.reportType != undefined || this.selectedReport.reportType != null) && this.selectedReport.reportType.length > 0) {
      this.modalService.open(modal, {
        windowClass: "filterPopup",
      });
    } else {
      this.alertService.error("Please select report type");
    }
  }

  /* Get Department List
  Author: Simran
  Date: 22/09/2023 */
  getDepartmentList(branch) {
    this.reportService.getDepartmentByBranch("getdepartmentlistbybranchid/" + branch.id).subscribe((res: any) => {
      if (res.result) {
        if (res.deptList != null && res.deptList.length > 0) {
          /* Use For Add Screen */
          this.searchDet.departmentList = this.setArray(res.deptList, "deptId", "deptName");
        } else {
          this.searchDet.departmentList = [];
        }
      } else {
        this.searchDet.departmentList = [];
      }
    });
  }

  /* Get Accessible Plant List
  Author: Simran
  Date : 22/09/2023 */
  getAccessiblePlantList() {
    this.reportService.getBranchAccessList("getBranchAccessSetupByEmpId/" + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          /* Use For Add Screen */
          this.plantList = this.setArray(res.branchAccessList, "branchId", "branchName");
          /* Use For Filter */
          this.searchDet.plantList = this.setArray(res.branchAccessList, "branchId", "branchName");
        } else {
          /* Use For Add Screen */
          this.plantList = [
            {
              id: this.userDet.branch.branchId,
              name: this.userDet.branch.name,
            },
          ];
          /* Use For Filter */
          this.searchDet.plantList = [
            {
              id: this.userDet.branch.branchId,
              name: this.userDet.branch.name,
            },
          ];
        }
      } else {
        /* Use For Add Screen */
        this.plantList = [
          {
            id: this.userDet.branch.branchId,
            name: this.userDet.branch.name,
          },
        ];
        /* Use For Filter */
        this.searchDet.plantList = [
          {
            id: this.userDet.branch.branchId,
            name: this.userDet.branch.name,
          },
        ];
      }
      // this.branchId = [this.searchDet.plantList[0]];
      // this.getDepartmentList(this.branchId[0]);
    });
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

  onChange(ev: any, type) {
    if (ev) {
      if (type == "plant") {
        // this.getDepartmentList(ev);
        this.getLineNameList(ev);
        this.searchDet.deptIds = [];
      }
    } else {
      if (type == "plant") {
        console.log("in");
        if (this.searchDet) {
          console.log("out");
          this.searchDet.departmentList = [];
        }
      }
    }
  }

  /* Get Department List as per branchwise
  Author: Simran
  Date : 05/10/2023 */
  getLineNameList(branchId) {
    console.log(branchId);
    this.selectedBranchId = branchId.id;
    const data = {
      branchId: this.selectedBranchId,
    };
    this.reportService.getLineNameList("apis/sm/getCellList", data).subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          for (let index = 0; index < response.dataList.length; index++) {
            response.dataList[index].tmpName = "";
            if (response.dataList[index].lineName) {
              response.dataList[index].tmpName += response.dataList[index].lineName;
              if (response.dataList[index].deptName) {
                response.dataList[index].tmpName += " (Department : " + response.dataList[index].deptName + ")";
              }
            }
          }
          this.cellLineList = response.dataList;
          console.log(this.cellLineList);
          this.cellLineName = this.setArray(response.dataList, "lineId", "tmpName");
          // this.searchDet.cellLineName = this.setArray(response.dataList, 'lineId', 'tmpName');
        } else {
          this.cellLineName = [];
        }
      } else {
        this.cellLineName = [];
      }
    });
  }

  onChangeAll(ev: any, type) {
    if (ev) {
      console.log("Select All action");
    } else {
      console.log("Unselect All action");
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
  submitFilterForm(filterData) {
    this.isAppliedFilter = true;
    if (filterData.invalid) {
      Object.keys(filterData.controls).forEach(key => {
        filterData.controls[key].markAsDirty();
      });
      return;
    }
    this.searchDet.reportFilterFlag = true;
    if (filterData.status == "INVALID") {
      Object.keys(filterData.controls).forEach(key => {
        filterData.controls[key].markAsDirty();
      });
      return;
    } else {
    this.generateReport("filter");
    this.modalService.dismissAll();
    }
  }

  removeFilter() {
    this.isAppliedFilter = false;
    this.filterData.reset();
    this.searchDet.branchId = [];
    this.searchDet.deptIds = [];
    this.searchDet.skillLvlId = [];
    this.searchDet.reportFilterFlag = false;
    this.generateReport("filter");
  }

  setDate(type) {
    if (this.selectedDateType && this.selectedDateType == type) {
      this.selectedDateType = undefined;
      this.selectedDate = {};
    } else {
      this.selectedDateType = type;
      this.selectedDate.toDate = moment(new Date()).format("YYYY-MM");
      console.log(this.selectedDate.toDate);
      var tmpFromMonthYear = "";
      this.isSet = false;
      if (type) {
        if (type == "1M") {
          tmpFromMonthYear = moment().subtract(1, "months").format();
        } else if (type == "6M") {
          tmpFromMonthYear = moment().subtract(6, "months").format();
        } else if (type == "1Y") {
          tmpFromMonthYear = moment().subtract(1, "year").format();
        } else if (type == "2Y") {
          tmpFromMonthYear = moment().subtract(2, "year").format();
        }
        this.selectedDate.fromDate = moment(tmpFromMonthYear).format("YYYY-MM");
        console.log(this.selectedDate.fromDate);
      } else {
        this.isSet = true;
      }
    }
    this.dateRangeDates.emit(this.selectedDate);
  }

  /* Get level list function
  Author: Simran
  Date : 23/09/2023 */
  getReportLevelList() {
    this.reportService.getMasterLevelList("apis/sm/getLevelList").subscribe((res: any) => {
      if (res.result) {
        if (res.dataList != null && res.dataList.length > 0) {
          this.masterLevelList = this.setArray(res.dataList, "id", "levelName");
        } else {
          this.masterLevelList = [];
        }
      } else {
        this.masterLevelList = [];
      }
    });
  }

  onChangeLevel(ev: any, type) {
    if (ev) {
      console.log("Select plant");
    } else {
      console.log("Unselect plant");
    }
  }
  sortData(sort: Sort) {
    this.sorting = sort;
    this.generateReport("");
  }
  loadMore(data: any) {
    this.staticPagination = data;
    if (this.selectedReport.reportCaption == "MULTI_SKILLING_REPORT") {
      this.selectedReportData.mutltiSkillMatrixReport = [];
    } else if (this.selectedReport.reportCaption == "Monthly_Skill_Matrix_Report") {
      this.selectedReportData.skillMatrixCellPlantWise = [];
    } else if (this.selectedReport.reportCaption == "Employee_Performance_Analysis") {
      this.selectedReportData.employeeWisePlan = [];
    } else if (this.selectedReport.reportCaption == "Task_Completion_Status") {
      this.selectedReportData.averageTimeTaken = [];
    } else if (this.selectedReport.reportCaption == "Plant_Adherence_Status") {
      this.selectedReportData.plantLevelAdherence = [];
    } else if (this.selectedReport.reportCaption == "Cell_Adherence_Status") {
      this.selectedReportData.cellLevelAdherence = [];
    } else if (this.selectedReport.reportCaption == "Completion_Discrepancy_Report") {
      this.selectedReportData.plantVsActual = [];
    } else if (this.selectedReport.reportCaption == "Assessment_Success_Rate") {
      this.selectedReportData.assessmentPassOrFail = [];
    } else if (this.selectedReport.reportCaption == "Multiskilling_Status_At_Cell_Level") {
      this.selectedReportData.cellWiseMultitasking = [];
    } else if (this.selectedReport.reportCaption == "Multiskilling_Status_At_Plant_Level") {
      this.selectedReportData.plantWiseMultitasking = [];
    } else if (this.selectedReport.reportCaption == "Skill_Gap_Analysis") {
      this.selectedReportData.skillGapCellWise = [];
    }
    this.listLoading = true;
    if (this.searchDet.reportFilterFlag) {
      this.generateReport("filter");
    } else {
      this.generateReport("");
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
}
