import { Component, Input, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-skill-gap-cellwise',
  templateUrl: './skill-gap-cellwise.component.html',
  styleUrls: ['./skill-gap-cellwise.component.scss']
})
export class SkillGapCellwiseComponent implements OnInit {
  @Input() reportData: any = [];
  @Input() sort: any = {
    "active": "",
    "direction": ""
  };
  @Input() callbackFuncGenReport: (args: any) => void;

  constructor() { }

  ngOnInit(): void {
    // this.selectedReportData = this.selectedDet
    // console.log(this.selectedReportData)
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
}
