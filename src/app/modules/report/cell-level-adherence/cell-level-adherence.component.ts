import { Component, Input, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ReportServiceService } from '../report-service.service';

@Component({
  selector: 'app-cell-level-adherence',
  templateUrl: './cell-level-adherence.component.html',
  styleUrls: ['./cell-level-adherence.component.scss']
})
export class CellLevelAdherenceComponent implements OnInit {

  @Input() reportData: any = [];
  //@Input() reportReqBody: any = {};
  @Input() sort: any = {
    "active": "",
    "direction": ""
  };
  @Input() callbackFuncGenReport: (args: any) => void;
  listLoading: boolean = false;
  //selectedReportData: any;
  // sorting: any = {
  //   "active" : "",
  //   "direction" : ""
  // };

  constructor() { }

  ngOnInit(): void {
    console.log("NG ON INIT");

    //this.selectedReportData = this.selectedDet;
    if (this.sort == null || this.sort == undefined) {
      this.sort = {
        "active": "",
        "direction": ""
      };
    }
    console.log(this.sort);
  }

  /*
    @DESC : Sort table
    @Author: Shashi
    @Date : 29 Aug 2023
  */
  sortData(sort: Sort) {
    //this.sorting = sort;
    this.sort = sort;
    //this.generateReport();
    this.callbackFuncGenReport(sort);
  }
  sortReportData(sort: Sort) {

    // public generateReport() {
    //   this.listLoading = true;
    //   this.selectedReportData.cellLevelAdherence = [];

    //   let reportBody: any = {
    //     "reportCaption": this.reportReqBody.reportCaption,
    //     "orgId": this.reportReqBody.orgId,
    //     "branchId": this.reportReqBody.branchId,
    //     "deptId": this.reportReqBody.deptId,
    //     "colName": this.reportReqBody.colName,
    //     "orderType": this.reportReqBody.orderType,
    //     "fromDt": this.reportReqBody.fromDt,
    //     "toDt": this.reportReqBody.toDt
    //   };

    //   if (this.sorting) {
    //     if (this.sorting.direction != "") {
    //       reportBody.colName = this.sorting.active;
    //       reportBody.orderType = this.sorting.direction;
    //     } else {
    //       //Default Sort
    //       //reportBody.colName = "empName";
    //       //reportBody.orderType = "asc";
    //     }
    //   } else {
    //     //Default Sort
    //     //reportBody.colName = "empName";
    //     //reportBody.orderType = "asc";
    //   }

    //   this.reportService.getReportList("apis/sm/getSkillMatrixReport", reportBody).subscribe((response: any) => {
    //     this.listLoading = false;
    //     if (response.result) {
    //       this.selectedReportData.cellLevelAdherence = [];
    //       if (response.dataList != null && response.dataList.length > 0) {
    //         this.selectedReportData.cellLevelAdherence = response.dataList;
    //       } else {
    //         this.selectedReportData.cellLevelAdherence = []
    //       }
    //     }
    //     else {
    //       this.selectedReportData.cellLevelAdherence = []
    //       // this.selectedReport.isDataFound = false;
    //       // this.setAssessmentPassOrFailReport(response)
    //       // this.selectedReportData = {}
    //     }
    //   });
    // }

  }
}
