import { Component, Input, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-assessment-pass-fail',
  templateUrl: './assessment-pass-fail.component.html',
  styleUrls: ['./assessment-pass-fail.component.scss']
})
export class AssessmentPassFailComponent implements OnInit {
  @Input() reportData: any = [];
  @Input() sort: any = {
    "active": "",
    "direction": ""
  };
  @Input() callbackFuncGenReport: (args: any) => void;
  staticPagination: any = {
    total: 50,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  }

  constructor() { }

  ngOnInit(): void {
    //this.selectedReportData = this.selectedDet
    //console.log(this.selectedReportData)
  }

  /*
    @DESC : Sort table
    @Author: Shashi
    @Date : 29 Sept 2023
  */
  sortData(sort: Sort) {
    this.sort = sort;
    this.callbackFuncGenReport(sort);
  }
  sortReportData(sort: Sort) {

  }
  loadMore(event: any) {

  }

 

}
