import { Component, Inject, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SkillingService } from './skilling.service';

import { Workbook } from "exceljs";
import * as moment from 'moment';
import * as fs from "file-saver";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-skill-matrix',
  templateUrl: './skill-matrix.component.html',
  styleUrls: ['./skill-matrix.component.scss']
})
export class SkillMatrixComponent implements OnInit {
  listLoader: boolean = false;
  exportLoader: boolean = false;
  skillMatrixDetails: any = {};
  searchDet: any = {};
  SingleDropdownSettings: IDropdownSettings = {};
  SingleCellDropdownSettings = {};
  branchAccessList: any = [];
  userDet: any = {};
  selectedBranch: any = {};
  deptList: any = [];
  cellList: any = [];
  constant: any = {};
  filterFlag: boolean = false;
  isAppliedFilter: boolean = false;
  hasSkillMatrixData: boolean = false;
  filterData: FormGroup;
  revNo: any = [];
  skillMatrixDocument: any;
  filteredEmpData:any;
  searchInput:any;
  shiftList: any = [
    { id: 1, name: 1 },
    { id: 2, name: 2 },
    { id: 3, name: 3 },
  ];
  filteredSkillMatrixTLData: any[] = [];
  getSkillMatrixListForExport : any;
  multiskillingPercentage :  any;
  constructor(
    public apiService: SkillingService,
    private modalService: NgbModal,
    public fb: FormBuilder,
    @Inject('Constant') Constant: any) {
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    // console.log(this.userDet)
    this.searchDet.shift = [this.shiftList[0]];
    this.searchDet.branch = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
    // this.searchDet.dept = [{ id: this.userDet.dept.deptId, name: this.userDet.dept.deptName }];
    // this.searchDet.cell = [{ id: this.userDet.line.id, name: this.userDet.line.name }];
    this.getBranchAccessList();
    this.searchDet.isDefaultWorking = true;
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.filterData = this.fb.group({
      branchId: new FormControl("", Validators.required),
      deptId: new FormControl(""),
      lineIds: new FormControl("")
    });
    // this.getSkillMatixData();
  }

  /* get branch access list on organization and logged in employee
      @Author Jayshri Kolase
     * @Date August 18, 2023
   */
  getBranchAccessList() {
    this.apiService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          /* Use For Add Screen */
          this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        } else {
          /* Use For Add Screen */
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      } else {
        /* Use For Add Screen */
        this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
      this.branchAccessList = this.sortFunction(this.branchAccessList, 'name');
      // this.searchDet.branch = [this.branchAccessList[0]];
      // this.onChangeBranch(this.searchDet.branch[0]);
      this.getDeptList();
    })
  }
  /* change branch on branch selection and call stage list and Workflow Config List
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  onChangeBranch(event: any) {
    // console.log(event)
    this.searchDet.isDefaultWorking = false;
    if (event) {
      this.deptList = [];
      this.searchDet.dept = [];
      this.cellList = [];
      this.searchDet.cell = [];
      // this.skillMatrixDetails = {};
      this.searchDet.branch = [{ id: event.id, name: event.name }];
      this.getDeptList();
      // this.getCellList();
    } else {
      this.deptList = [];
      this.searchDet.dept = [];
      this.cellList = [];
      this.searchDet.cell = [];
      // this.skillMatrixDetails = {};
    }
  }

  /* get department list on branch selection
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  getDeptList() {
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      this.apiService.getdepartmentlistbybranchid('getdepartmentlistbybranchid/' + this.searchDet.branch[0].id).subscribe((res: any) => {
        if (res.result) {
          if (res.deptList != null && res.deptList.length > 0) {
            /* Use For Add Screen */
            this.deptList = this.setArray(res.deptList, 'deptId', 'deptName');
            this.deptList = this.sortFunction(this.deptList, 'deptName');
            if (this.searchDet.isDefaultWorking) {
              this.searchDet.dept = [this.deptList[0]];
              this.getCellList();
              // this.getSkillMatixData();
            }
          } else {
            this.deptList = [];
          }
        } else {
          this.deptList = [];
        }
      })
    }
  }

  /* get Cell list on branch selection
    @Author Mahesh
   * @Date Oct 05, 2023
 */
  getCellList() {
    var req: any = {
      branchId: this.searchDet.branch[0].id
    }
    if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
      req.deptId = this.searchDet.dept[0].id;
    }
    this.apiService.getCellList('apis/sm/getCellList', req).subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          response.dataList = this.sortFunction(response.dataList, 'lineName');
          this.cellList = this.setArray(response.dataList, 'lineId', 'lineName');
          this.searchDet.cell = [this.cellList[0]];
          if (!this.searchDet.filterFlag) {
            this.getSkillMatixData();
          }
        } else {
          this.cellList = [];
        }
      } else {
        this.cellList = [];
      }
    })
  }

  onChangeCell(event: any) {
    this.searchDet.isDefaultWorking = false;
    // if (event) {
    //   this.getSkillMatixData();
    // } else {
    //   // this.deptList = [];
    // this.skillMatrixDetails = {};
    // }
  }
  onChangeDept(event: any) {
    this.searchDet.isDefaultWorking = false;
    if (event) {
      this.getCellList();
      // this.getSkillMatixData();
      this.cellList = [];
      this.searchDet.cell = [];
      // this.skillMatrixDetails = {};
    } else {
      this.cellList = [];
      this.searchDet.cell = [];
      this.searchDet.dept = [];
      // this.skillMatrixDetails = {};
    }
  }

  isObjectEmpty(objectName) {
    return Object.keys(objectName).length == 0
  }
 

  getSkillMatixData() {
    this.skillMatrixDetails = {};
    this.skillMatrixDocument = {};
    this.filteredSkillMatrixTLData = [];
    this.listLoader = true;
    let cellObj: any;
    if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
      cellObj = this.cellList.filter(x => x.id == this.searchDet.cell[0].id);
    }
    let req: any = {
      "orgId": this.userDet.organization.orgId,
      // "branchId": this.searchDet.branch[0].id,
      // "deptId": this.searchDet.dept[0].id
    }
    if (this.searchDet.shift != null && this.searchDet.shift.length > 0) {
      req.shiftNo = this.searchDet.shift[0].id;
    }
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      req.branchId = this.searchDet.branch[0].id;
    }
    if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
      req.deptId = this.searchDet.dept[0].id;
    }
    if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
      req.lineId = this.searchDet.cell[0].id;
    }
    this.getSkillMatrixListForExport = {};
    this.hasSkillMatrixData = false;
    this.multiskillingPercentage = 0;
    this.apiService.getSkillMatrixData('apis/sm/getSkillMatrixList', req).subscribe((res: any) => {
      // console.log(res);
      this.listLoader = false;
      if (res.result) {
        this.getSkillMatrixListForExport = res.data.skillMatrixDetails ?? {};
        this.hasSkillMatrixData = res.data.skillMatrixDetails != null ? true : false;

        if (res.data.hasOwnProperty('levelSummary') && res.data.levelSummary != null && res.data.levelSummary.length > 0) {
          for (let count = 0; count < res.data.levelSummary.length; count++) {
            res.data.levelSummary[count].requiredCount = (res.data.levelSummary[count].requiredCount) ? Math.round(res.data.levelSummary[count].requiredCount) : 0;
            res.data.levelSummary[count].actualCount = (res.data.levelSummary[count].actualCount) ? Math.round(res.data.levelSummary[count].actualCount) : 0;
          }
          res.data.levelSummary = this.sortFunction(res.data.levelSummary, 'levelId');
        }
        this.skillMatrixDetails = res.data;
        if (res.data.tableData != null && res.data.tableData.length > 0) {
          // First, initialize the array if it doesn't exist
          // if (!this.skillMatrixDetails.tableEmpData) {
          this.skillMatrixDetails.tableEmpData = [];
          this.filteredEmpData = [];
          // }


          for (let i = 0; i < res.data.tableData.length; i++) {
            if (res.data.tableData[i].empLevel != 'TL') {
              this.skillMatrixDetails.tableEmpData.push(res.data.tableData[i]);
             this.multiskillingPercentage += res.data.tableData[i].skillingPer; 
            }
          }

          this.multiskillingPercentage = Math.round(
            this.multiskillingPercentage / this.skillMatrixDetails.tableEmpData.length
          );
          

          // for (let i = 0; i < res.data.tableData.length; i++) {
          //   if (res.data.tableData[i].empLevel == 'TL') {
          //     this.skillMatrixDetails.tableEmpData.push(res.data.tableData[i]);
          //   }
          // }
          this.filteredEmpData = this.skillMatrixDetails.tableEmpData;
        }

        //     Aniket :- Store document value in skillMatrixDocument
        this.skillMatrixDocument = res.data.documentName
      } else {
        this.skillMatrixDetails = {};
      }

      this.filteredSkillMatrixTLData = this.skillMatrixDetails.tableData.filter(row => row.empLevel == 'TL');
    }, (error: any) => {
      this.listLoader = false;
    })
  }

  getCombinedHeader(key) {
    const empLevelColumn = this.skillMatrixDetails.columns.find(column => column.field == key);
    return `${empLevelColumn.heading}`;
  }
  getHeadingWithLevel(obj) {
    return ` ${obj.heading}`;
  }
  getWorkStationLength() {
    let length = 0;
    if (!this.isObjectEmpty(this.skillMatrixDetails) && this.skillMatrixDetails.columns != null && this.skillMatrixDetails.columns.length != 0) {
      for (let index = 0; index < this.skillMatrixDetails.columns.length; index++) {
        if (this.skillMatrixDetails.columns[index].field != 'empId' && this.skillMatrixDetails.columns[index].field != 'empName' && this.skillMatrixDetails.columns[index].field != 'gender' && this.skillMatrixDetails.columns[index].field != 'experience' && this.skillMatrixDetails.columns[index].field != 'empLevel') {
          length++;
        }
      }
    }
    return length;
  }

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
  isChecked(row: any, field: string) {
    let obj: any = {};
    for (let item in row) {
      if (field == item) {
        // Condition 1
        if (!this.isObjectEmpty(row) && row[item].hasOwnProperty("currentSkillLevelId")) {
          if (row[item].currentSkillLevelId == 1) {
            return { 'status': this.constant.EQUAL, level: row[item].currentSkillLevel };
          } else if (row[item].currentSkillLevelId == 2) {
            return { 'status': this.constant.ELIGIBLE, level: row[item].currentSkillLevel };
          } else if (row[item].currentSkillLevelId == 3) {
            return { 'status': this.constant.NOT_ELIGIBLE, level: row[item].currentSkillLevel };
          } else if (row[item].currentSkillLevelId == 4) {
            return { 'status': this.constant.NOT_ELIGIBLE, level: row[item].currentSkillLevel };
          }
          else {
            return { 'status': this.constant.OTHER, level: ' ' };
          }
        } else {
          return { 'status': this.constant.OTHER, level: ' ' };
        }
      }
    }
    return obj;
  }
  getSkillLevelClass(skillLevel: string): string {
    switch (skillLevel) {
      case 'L1':
        return 'red-background';
      case 'L2':
        return 'gray-background';
      case 'L3':
        return 'green-background';
      case 'L4':
        return 'green-background';
      default:
        return 'white-background';
    }
  }

  sheetColumns: any = [];
  exportSkillMatrix() {
    this.exportLoader = true;
    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Skill Matrix", {});
    this.sheetColumns = [
      { header: '', key: 'sr', width: 30 },
      { header: '', key: 'empName', width: 30 },
      { header: '', key: 'empName', width: 30 },
      // { header: '', key: 'experience', width: 30 },
      // { header: '', key: 'empLevel', width: 30 },
      { header: 'MACHINE INDEX RATING', key: 'MACHINE_INDEX_RATING', width: 30 },
    ]
    for (let i = 0; i < this.skillMatrixDetails.columns.length; i++) {
      if (this.skillMatrixDetails.columns[i].field != 'empId' && this.skillMatrixDetails.columns[i].field != 'empName' && this.skillMatrixDetails.columns[i].field != 'gender' && this.skillMatrixDetails.columns[i].field != 'experience' && this.skillMatrixDetails.columns[i].field != 'empLevel') {
        this.sheetColumns.push(
          { header: this.skillMatrixDetails.columns[i].machineIndex, key: this.skillMatrixDetails.columns[i].machineIndex, width: 30 },
        )
      }
    };
    worksheet.columns = this.sheetColumns;
    this.sheetColumns = [];
    worksheet.mergeCells('A1', 'C1');

    this.sheetColumns = [
      { header: '', key: 'sr', width: 30 },
      { header: '', key: 'empName', width: 30 },
      { header: '', key: 'empName', width: 30 },
      // { header: '', key: 'experience', width: 30 },
      // { header: '', key: 'empLevel', width: 30 },
      { header: 'MIN. SKILL LEVEL REQ.', key: 'MIN_SKILL_LEVEL_REQ', width: 30 },
    ]
    for (let i = 0; i < this.skillMatrixDetails.columns.length; i++) {
      if (this.skillMatrixDetails.columns[i].field != 'empId' && this.skillMatrixDetails.columns[i].field != 'empName' && this.skillMatrixDetails.columns[i].field != 'gender' && this.skillMatrixDetails.columns[i].field != 'experience' && this.skillMatrixDetails.columns[i].field != 'empLevel') {
        this.sheetColumns.push(
          { header: this.skillMatrixDetails.columns[i].levelName, key: this.skillMatrixDetails.columns[i].levelName, width: 30 },
        )
      }
    };
    worksheet.columns = this.sheetColumns;
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'xlsx' });
      fs.saveAs(blob, 'Skill_Matrix.xlsx');
    })
    this.exportLoader = false;
  }

  // exportReportOld() {

  //   let exportData: any = [];
  //   let machineIndexColCount = this.skillMatrixDetails.columns.filter(x => x["machineIndex"]).length;
  //   let columnCount = 5 + machineIndexColCount;
  //   if (this.skillMatrixDocument != null && this.skillMatrixDocument != undefined) {
  //     var date = new Date(this.skillMatrixDocument.currentDate);
  //     var formattedDate = formatDate(date);
  //   }
  //   function formatDate(date) {
  //     var options = { day: '2-digit', month: 'short', year: 'numeric' };
  //     return date.toLocaleDateString('en-US', options);
  //   }
  //   //SECTION 1
  //   for (let i = 0; i < 3; i++) {
  //     let row = {};
  //     // Aniket :- Show doc-no,rev-date,rev-no
  //     if (i === 0) {
  //       if (this.skillMatrixDocument !== undefined && this.skillMatrixDocument !== null) {
  //         row["c0"] = "Doc No:-" + this.skillMatrixDocument.docName;
  //       } else {
  //         row["c0"] = "Doc No:-";
  //       }
  //     } else if (i === 1) {
  //       if (formattedDate !== undefined && formattedDate !== null) {
  //         row["c0"] = "Rev Date:-" + formattedDate;
  //       } else {
  //         row["c0"] = "Rev Date:-";
  //       }
  //     } else if (i === 2) {
  //       if (this.revNo !== undefined && this.revNo !== null && this.revNo != '') {
  //         row["c0"] = "Rev No:- " + this.revNo;
  //       } else {
  //         row["c0"] = "Rev No:- ";
  //       }
  //     }
  //     if (i == 0) {
  //       row["c" + 3] = "MACHINE INDEX RATING";
  //     } else if (i == 1) {
  //       row["c" + 3] = "MIN. SKILL LEVEL REQ.";
  //     } else if (i == 2) {
  //       row["c" + 3] = "REQUIRED NUMBER TRAINED";
  //     }

  //     if (i == 0) {
  //       for (let j = 5; j < machineIndexColCount + 5; j++) {
  //         row["c" + (j)] = this.skillMatrixDetails.columns[j].machineIndex;
  //       }
  //       row["c" + (machineIndexColCount + 5)] = "NO. OF SHIFTS";
  //       columnCount++;
  //       row["c" + (machineIndexColCount + 6)] = this.searchDet.shift[0].id;
  //       columnCount++;
  //     }
  //     else if (i == 1) {
  //       for (let j = 5; j < machineIndexColCount + 5; j++) {
  //         row["c" + (j)] = this.skillMatrixDetails.columns[j].levelName;
  //       }
  //     }
  //     else if (i == 2) {
  //       for (let j = 5; j < machineIndexColCount + 5; j++) {
  //         row["c" + (j)] = this.skillMatrixDetails.columns[j].requiredWorkforce;
  //       }
  //       row["c" + (machineIndexColCount + 5)] = "SKILL LEVEL";
  //       columnCount++;
  //       row["c" + (machineIndexColCount + 6)] = "MULTI SKILL %";
  //       columnCount++;
  //       row["c" + (machineIndexColCount + 7)] = "MARKS";
  //       columnCount++;
  //     }
  //     console.log(row)
  //     exportData.push(row);
  //   }

  //   let tempWorkstationList = [];
  //   //SECTION 2
  //   let row = {};
  //   row["c" + 0] = "Sr No";
  //   row["c" + 1] = "Emp Id";
  //   row["c" + 2] = "Name";
  //   row["c" + 3] = "Exp";
  //   row["c" + 4] = "Employee Level";

  //   for (let j = 5; j < machineIndexColCount + 5; j++) {
  //     row["c" + (j)] = this.skillMatrixDetails.columns[j].field;
  //     tempWorkstationList.push(this.skillMatrixDetails.columns[j].field);
  //   }
  //   exportData.push(row);

  //   let sheetColWidths = [];
  //   sheetColWidths.push(10);
  //   sheetColWidths.push(10);
  //   sheetColWidths.push(20);
  //   sheetColWidths.push(10);
  //   sheetColWidths.push(20);
  //   let checkedIndexes: any = [];
  //   //SECTION 3
  //   let isNotTE = 0;
  //   for (let i = 0; i < this.skillMatrixDetails.tableEmpData.length; i++) {
  //     if (this.skillMatrixDetails.tableEmpData[i].empLevel != 'TL') {
  //       let row = {};
  //       row["c" + 0] = i + 1;
  //       row["c" + 1] = this.skillMatrixDetails.tableEmpData[i].empId;
  //       row["c" + 2] = this.skillMatrixDetails.tableEmpData[i].empName;
  //       row["c" + 3] = this.skillMatrixDetails.tableEmpData[i].experience;
  //       row["c" + 4] = this.skillMatrixDetails.tableEmpData[i].empLevel;


  //       for (let j = 5; j < machineIndexColCount + 5; j++) {
  //         sheetColWidths.push(20);
  //         for (var key in this.skillMatrixDetails.tableEmpData[i]) {
  //           if (key == tempWorkstationList[j - 5]) {
  //             let checked = this.isChecked(this.skillMatrixDetails.tableEmpData[i], key);
  //             row["c" + j] = checked.level;
  //             if (checked.status == this.constant.EQUAL) {
  //               checkedIndexes.push({
  //                 row: i + 5,
  //                 col: j + 1
  //               });
  //             }
  //             break;
  //           }
  //         }
  //       }
  //       row["c" + (machineIndexColCount + 5)] = this.skillMatrixDetails.tableEmpData[i].skillLevel;
  //       row["c" + (machineIndexColCount + 6)] = this.skillMatrixDetails.tableEmpData[i].skillingPer + '%';
  //       row["c" + (machineIndexColCount + 7)] = this.skillMatrixDetails.tableEmpData[i].marks;
  //       exportData.push(row);
  //       isNotTE++;
  //     }

  //   }
  //   // console.log(exportData)
  //   exportData.push({});

    // if (this.skillMatrixDetails.workstationLvlCount != null) {
    //   let row = {};
    //   row["c" + 0] = 'Actual No Trained';
    //   row["c" + 1] = '';
    //   row["c" + 2] = '';
    //   row["c" + 3] = '';
    //   row["c" + 4] = '';
    //   let index = 5
    //   for (let j = 0; j < this.skillMatrixDetails.workstationLvlCount.length; j++) {
    //     row["c" + (index)] = this.skillMatrixDetails.workstationLvlCount[j].totalCount;
    //     index++;
    //   }
    //   exportData.push(row);
    // }
    // if (this.skillMatrixDetails.tableEmpData != null) {
    //   let row = {};
    //   row["c" + 0] = 'Team Leader Skill Level';
    //   row["c" + 1] = '';
    //   row["c" + 2] = '';
    //   row["c" + 3] = '';
    //   row["c" + 4] = '';
    //   let index = 5
    //   for (let j = 0; j < this.skillMatrixDetails.workstationLvlCount.length + 5; j++) {
    //     row["c" + (index)] = '';
    //     index++;
    //   }
    //   exportData.push(row);
    // }
    // // console.log(exportData)
    // exportData.push({});
    // for (let i = 0; i < this.skillMatrixDetails.tableEmpData.length; i++) {
    //   if (this.skillMatrixDetails.tableEmpData[i].empLevel === 'TL') {
    //     let row = {};
    //     row["c" + 0] = i + 1;
    //     row["c" + 1] = this.skillMatrixDetails.tableEmpData[i].empId;
    //     row["c" + 2] = this.skillMatrixDetails.tableEmpData[i].empName;
    //     row["c" + 3] = this.skillMatrixDetails.tableEmpData[i].experience;
    //     row["c" + 4] = this.skillMatrixDetails.tableEmpData[i].empLevel;
    //     for (let j = 5; j < machineIndexColCount + 5; j++) {
    //       sheetColWidths.push(20);
    //       for (var key in this.skillMatrixDetails.tableEmpData[i]) {
    //         if (key == tempWorkstationList[j - 5]) {
    //           let checked = this.isChecked(this.skillMatrixDetails.tableEmpData[i], key);
    //           row["c" + j] = checked.level;
    //           if (checked.status == this.constant.EQUAL) {
    //             checkedIndexes.push({
    //               row: i + 5,
    //               col: j + 1
    //             });
    //           }
    //           break;
    //         }
    //       }
    //     }
    //     row["c" + (machineIndexColCount + 5)] = this.skillMatrixDetails.tableEmpData[i].skillLevel;
    //     row["c" + (machineIndexColCount + 6)] = this.skillMatrixDetails.tableEmpData[i].skillingPer + '%';
    //     row["c" + (machineIndexColCount + 7)] = this.skillMatrixDetails.tableEmpData[i].marks;
    //     exportData.push(row);
    //   }
    // }
    // // console.log(exportData)
    // exportData.push({});


  //   //SECTION 6 - Bottom small level tables - Data
  //   row = {};
  //   row["c" + 0] = "Skill Level";
  //   row["c" + 1] = "REQD.";
  //   row["c" + 2] = "ACT.";
  //   row["c" + 3] = "GAP";
  //   exportData.push(row);

  //   for (let i = 0; i < this.skillMatrixDetails.levelSummary.length; i++) {
  //     if (this.skillMatrixDetails.levelSummary[i].levelName != 'L4') {
  //       row = {};
  //       row["c" + 0] = "L" + (i + 1);
  //       row["c" + 1] = this.skillMatrixDetails.levelSummary[i].requiredCount;
  //       row["c" + 2] = this.skillMatrixDetails.levelSummary[i].actualCount;
  //       if ((this.skillMatrixDetails.levelSummary[i].requiredCount && this.skillMatrixDetails.levelSummary[i].requiredCount > 0)
  //         && (this.skillMatrixDetails.levelSummary[i].requiredCount > this.skillMatrixDetails.levelSummary[i].actualCount)) {
  //         row["c" + 3] = this.skillMatrixDetails.levelSummary[i].requiredCount - this.skillMatrixDetails.levelSummary[i].actualCount;
  //       } else {
  //         row["c" + 3] = 0;
  //       }
  //       exportData.push(row);
  //     }
  //   }

  //   // console.log(exportData);

  //   let headers: any = [];
  //   let workbook = new Workbook();
  //   let worksheet = workbook.addWorksheet("Skill Matrix", {});

  //   for (let index = 0; index < columnCount; index++) {
  //     headers.push({
  //       key: ["c" + index], width: sheetColWidths[index]
  //     });
  //   }

  //   worksheet.columns = headers;

  //   var rows = [];
  //   var rowslist: any = {};
  //   Object.assign({}, rowslist);

  //   exportData.forEach((element) => {
  //     rowslist = {};
  //     for (var x in element) {
  //       rowslist[x] = element[x]
  //     }
  //     rows.push(rowslist);
  //   });

  //   worksheet.addRows(rows, "n");

  //   //Merging cells for MACHINE INDEX RATING, MIN.SKILL LEVL REQ. & REQUIRED NUMBER TRAINED cells
  //   for (let rowNumber = 1; rowNumber < 4; rowNumber++) {
  //     worksheet.mergeCells(rowNumber, 4, rowNumber, 5);
  //   }

  //   /* worksheet.mergeCells(1, 51, 2, 51); // Merge cells for rows 1 and 2 in column 51 ("c51")
  //    const areCellsMerged = worksheet.getCell(1, 51).isMerged || worksheet.getCell(1, 52).isMerged;
 
  //    if (!areCellsMerged) {
  //      // Merge cells for rows 1 and 2 in columns 51 and 52 ("c51" and "c52")
  //      worksheet.mergeCells(1, 52, 1, 53);
  //      worksheet.mergeCells(2, 53, 2, 53);
  //    }
  //    worksheet.mergeCells(3, 51, 4, 51); // Merge cells for rows 1 and 2 in column 51 ("c51")
  //    worksheet.mergeCells(3, 52, 4, 52); // Merge cells for rows 1 and 2 in column 51 ("c51")
  //    worksheet.mergeCells(3, 53, 4, 53); // Merge cells for rows 1 and 2 in column 51 ("c51")
  //    //Setting bold font to all cells first 4 rows*/


  //   // console.log(isNotTE)
  //   worksheet.mergeCells((isNotTE + 6), 1, (isNotTE + 6), 5);
  //   worksheet.mergeCells((isNotTE + 7), 1, (isNotTE + 7), (this.skillMatrixDetails.workstationLvlCount.length + 5 + 3));
  //   for (let rowNumber = 1; rowNumber < 5; rowNumber++) {
  //     let row = worksheet.getRow(rowNumber);
  //     row.font = {
  //       bold: true
  //     }
  //   }

  //   for (let rowNumber = 1; rowNumber < 4; rowNumber++) {
  //     let row = worksheet.getRow(rowNumber);

  //     // Loop through all columns starting from F (index 6 in Excel)
  //     for (let colNumber = 6; colNumber <= row.cellCount; colNumber++) {
  //       // Get the current cell
  //       let cell = row.getCell(colNumber);

  //       // Apply center alignment if the column is F or beyond
  //       cell.alignment = {
  //         vertical: 'middle',
  //         horizontal: 'center'
  //       };
  //     }
  //   }
  //   //Setting bold font to headers of bottom level table
  //   let lvlTblRowIndex = 3 + 1 + 2 + this.skillMatrixDetails.tableEmpData.length;
  //   {
  //     let row = worksheet.getRow(lvlTblRowIndex);
  //     row.font = {
  //       bold: true
  //     }
  //   }

  //   //Setting borders to cells from tableData which shows level(L0,L1,L2) in RED & GREEN color
  //   for (let i = 5; i < this.skillMatrixDetails.tableEmpData.length + 5; i++) {
  //     let row = worksheet.getRow(i);
  //     row.eachCell((cell, colNumber) => {
  //       if (colNumber > 5) {
  //         cell.border = {
  //           top: { style: 'double', color: { argb: 'f6f6f6' } },
  //           left: { style: 'double', color: { argb: 'f6f6f6' } },
  //           bottom: { style: 'double', color: { argb: 'f6f6f6' } },
  //           right: { style: 'double', color: { argb: 'f6f6f6' } }
  //         };
  //         cell.alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       }
  //     });
  //   }

  //   //Setting text center to cells of bottom lelve table
  //   lvlTblRowIndex = 3 + 1 + 2 + this.skillMatrixDetails.tableEmpData.length + 4;
  //   // console.log('lvlTblRowIndex:', lvlTblRowIndex);
  //   // console.log('Total Rows:', worksheet.rowCount);

  //   for (let i = 0; i < this.skillMatrixDetails.levelSummary.length; i++) {
  //     let row = worksheet.getRow(lvlTblRowIndex + i + 1);
  //     row.alignment = {
  //       horizontal: 'center'
  //     }
  //     if (this.skillMatrixDetails.levelSummary[i].levelId == 1) {
  //       //RED color to L1 cell
  //       row.getCell(1).fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: 'FF0000' }
  //       }
  //     } else if (this.skillMatrixDetails.levelSummary[i].levelId == 2) {
  //       //GREEN color to L2 cell
  //       row.getCell(1).fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: 'D9D9D9' }
  //       }
  //     } else if (this.skillMatrixDetails.levelSummary[i].levelId == 3) {
  //       //YELLOW color to L3 cell
  //       row.getCell(1).fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: '99cd3a' }
  //       }
  //     }
  //     /* else if (this.skillMatrixDetails.levelSummary[i].levelId == 4) {
  //       //YELLOW color to L4 cell
  //       row.getCell(1).fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: '99cd3a' }
  //       }
  //     } */
  //   }

  //   //Highlighting EQUAL, NOT EQUAL Cells with RED and GREEN color
  //   let nonTlEmployees = [];
  //   let tlEmployees = [];

  //   for (let i = 0; i < this.skillMatrixDetails.tableEmpData.length; i++) {
  //     if (this.skillMatrixDetails.tableEmpData[i].empLevel !== 'TL') {
  //       nonTlEmployees.push(this.skillMatrixDetails.tableEmpData[i]);
  //     } else {
  //       tlEmployees.push(this.skillMatrixDetails.tableEmpData[i]);
  //     }
  //   }
  //   for (let rowNumber = 5; rowNumber < nonTlEmployees.length + 5; rowNumber++) {
  //     let row = worksheet.getRow(rowNumber);
  //     for (let colNumber = 6; colNumber < machineIndexColCount + 5 + 4; colNumber++) {
  //       let isChecked = false;
  //       checkedIndexes.forEach(element => {
  //         if (element.row === rowNumber && element.col === colNumber) {
  //           isChecked = true;
  //         }
  //       });

  //       // Get the value of the current cell
  //       let cellValue = row.getCell(colNumber).value;

  //       // Check if the cell value is "L1", "L2", or "L3"
  //       if (cellValue === "L1") {
  //         // Set the fill color for "L1"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'FF0000' } // Yellow
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else if (cellValue === "L2") {
  //         // Set the fill color for "L2"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'D9D9D9' } // Orange
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else if (cellValue === "L3") {
  //         // Set the fill color for "L3"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: '99cd3a' } // Red
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       }
  //       else if (cellValue === "L4") {
  //         // Set the fill color for "L3"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: '99cd3a' } // Red
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else {
  //         // Handle other cases if needed
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       }

  //     }
  //   }
  //   for (let rowNumber = 5 + nonTlEmployees.length; rowNumber < this.skillMatrixDetails.tableEmpData.length + 5 + 4; rowNumber++) {
  //     let row = worksheet.getRow(rowNumber);
  //     for (let colNumber = 6; colNumber < machineIndexColCount + 5 + 4; colNumber++) {
  //       let isChecked = false;
  //       checkedIndexes.forEach(element => {
  //         if (element.row === rowNumber && element.col === colNumber) {
  //           isChecked = true;
  //         }
  //       });

  //       // Get the value of the current cell
  //       let cellValue = row.getCell(colNumber).value;

  //       // Check if the cell value is "L1", "L2", or "L3"
  //       if (cellValue === "L1") {
  //         // Set the fill color for "L1"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'FF0000' } // Yellow
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else if (cellValue === "L2") {
  //         // Set the fill color for "L2"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'D9D9D9' } // Orange
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else if (cellValue === "L3") {
  //         // Set the fill color for "L3"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: '99cd3a' } // Red
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       }
  //       else if (cellValue === "L4") {
  //         // Set the fill color for "L3"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: '99cd3a' } // Red
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else {
  //         // Handle other cases if needed
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       }

  //     }
  //   }
  //   for (let rowNumber = 5; rowNumber < this.skillMatrixDetails.workstationLvlCount.length + 5; rowNumber++) {
  //     let row = worksheet.getRow(rowNumber);
  //     for (let colNumber = 6; colNumber < machineIndexColCount + 5 + 1 + 1; colNumber++) {
  //       let isChecked = false;
  //       checkedIndexes.forEach(element => {
  //         if (element.row === rowNumber && element.col === colNumber) {
  //           isChecked = true;
  //         }
  //       });

  //       // Get the value of the current cell
  //       let cellValue = row.getCell(colNumber).value;

  //       // Check if the cell value is "L1", "L2", or "L3"
  //       if (cellValue === "L1") {
  //         // Set the fill color for "L1"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'FF0000' } // Yellow
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else if (cellValue === "L2") {
  //         // Set the fill color for "L2"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'D9D9D9' } // Orange
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else if (cellValue === "L3") {
  //         // Set the fill color for "L3"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: '99cd3a' } // Red
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else if (cellValue === "L4") {
  //         // Set the fill color for "L3"
  //         row.getCell(colNumber).fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: '99cd3a' } // Red
  //         };
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       } else {
  //         // Handle other cases if needed
  //         row.getCell(colNumber).alignment = {
  //           vertical: 'middle',
  //           horizontal: 'center'
  //         };
  //       }

  //     }
  //   }
  //   for (let rowNumber = 1; rowNumber < 4; rowNumber++) {
  //     worksheet.mergeCells(rowNumber, 1, rowNumber, 3);
  //   }
  //   workbook.xlsx.writeBuffer().then((data) => {
  //     var excelName = "Skill Matrix";
  //     let blob = new Blob([data], { type: "xlsx" });
  //     fs.saveAs(blob, excelName + ".xlsx");
  //   });

  // }
  exportReport() {
    let exportData: any = [];
    let titleSheet: string ='';
    let machineIndexColCount = this.skillMatrixDetails.columns.filter(x => x["machineIndex"]).length;
    let columnCount = 5 + machineIndexColCount;
    if (this.skillMatrixDocument != null && this.skillMatrixDocument != undefined) {
      var date = new Date(this.skillMatrixDocument.currentDate);
      var formattedDate = formatDate(date);
    }
    function formatDate(date) {
      var options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }

    if (this.hasSkillMatrixData) {
      let titleRow = {};
      titleRow["c0"] = "Cell Name" +":-"+ this.getSkillMatrixListForExport.lineName ;
      exportData.push(titleRow);
  }


    //SECTION 1
    for (let i = 0; i < 3; i++) {
      let row = {};
      // Aniket :- Show doc-no,rev-date,rev-no
      if (i === 0) {
        if (this.skillMatrixDocument !== undefined && this.skillMatrixDocument !== null) {
          row["c0"] = "Doc No:-" + this.skillMatrixDocument.docName;
        } else {
          row["c0"] = "Doc No:-";
        }
      } else if (i === 1) {
        if (formattedDate !== undefined && formattedDate !== null) {
          row["c0"] = "Rev Date:-" + formattedDate;
        } else {
          row["c0"] = "Rev Date:-";
        }
      } else if (i === 2) {
        if (this.revNo !== undefined && this.revNo !== null && this.revNo != '') {
          row["c0"] = "Rev No:- " + this.revNo;
        } else {
          row["c0"] = "Rev No:- ";
        }
      }
      if (i == 0) {
        row["c" + 3] = "MACHINE INDEX RATING";
      } else if (i == 1) {
        row["c" + 3] = "MIN. SKILL LEVEL REQ.";
      } else if (i == 2) {
        row["c" + 3] = "REQUIRED NUMBER TRAINED";
      }

      if (i == 0) {
        for (let j = 5; j < machineIndexColCount + 5; j++) {
          row["c" + (j)] = this.skillMatrixDetails.columns[j].machineIndex;
        }
        row["c" + (machineIndexColCount + 5)] = "NO. OF SHIFTS";
        columnCount++;
        row["c" + (machineIndexColCount + 6)] = this.searchDet.shift[0].id;
        columnCount++;
      }
      else if (i == 1) {
        for (let j = 5; j < machineIndexColCount + 5; j++) {
          row["c" + (j)] = this.skillMatrixDetails.columns[j].levelName;
        }
      }
      else if (i == 2) {
        for (let j = 5; j < machineIndexColCount + 5; j++) {
          row["c" + (j)] = this.skillMatrixDetails.columns[j].requiredWorkforce;
        }
        row["c" + (machineIndexColCount + 5)] = "SKILL LEVEL";
        columnCount++;
        row["c" + (machineIndexColCount + 6)] = "MULTI SKILL %";
        columnCount++;
        row["c" + (machineIndexColCount + 7)] = "MARKS";
        columnCount++;
      }
      console.log(row)
      exportData.push(row);
    }
    let tempWorkstationList = [];
    //SECTION 2
    let row = {};
    row["c" + 0] = "Sr No";
    row["c" + 1] = "Emp Id";
    row["c" + 2] = "Name";
    row["c" + 3] = "Exp";
    row["c" + 4] = "Employee Level";

    for (let j = 5; j < machineIndexColCount + 5; j++) {
      row["c" + (j)] = this.skillMatrixDetails.columns[j].field;
      tempWorkstationList.push(this.skillMatrixDetails.columns[j].field);
    }
    exportData.push(row);

    let sheetColWidths = [];
    sheetColWidths.push(10);
    sheetColWidths.push(10);
    sheetColWidths.push(20);
    sheetColWidths.push(10);
    sheetColWidths.push(20);
    let checkedIndexes: any = [];
    //SECTION 3
    let isNotTE = 0;
    for (let i = 0; i < this.skillMatrixDetails.tableEmpData.length; i++) {
      if (this.skillMatrixDetails.tableEmpData[i].empLevel != 'TL') {
        let row = {};
        row["c" + 0] = i + 1;
        row["c" + 1] = this.skillMatrixDetails.tableEmpData[i].empId;
        row["c" + 2] = this.skillMatrixDetails.tableEmpData[i].empName;
        row["c" + 3] = this.skillMatrixDetails.tableEmpData[i].experience;
        row["c" + 4] = this.skillMatrixDetails.tableEmpData[i].empLevel;


        for (let j = 5; j < machineIndexColCount + 5; j++) {
          sheetColWidths.push(20);
          for (var key in this.skillMatrixDetails.tableEmpData[i]) {
            if (key == tempWorkstationList[j - 5]) {
              let checked = this.isChecked(this.skillMatrixDetails.tableEmpData[i], key);
              row["c" + j] = checked.level;
              if (checked.status == this.constant.EQUAL) {
                checkedIndexes.push({
                  row: i + 5,
                  col: j + 1
                });
              }
              break;
            }
          }
        }
        row["c" + (machineIndexColCount + 5)] = this.skillMatrixDetails.tableEmpData[i].skillLevel;
        row["c" + (machineIndexColCount + 6)] = this.skillMatrixDetails.tableEmpData[i].skillingPer + '%';
        row["c" + (machineIndexColCount + 7)] = this.skillMatrixDetails.tableEmpData[i].marks;
        exportData.push(row);
        isNotTE++;
      }
    }


    
    
    if (this.skillMatrixDetails.workstationLvlCount != null) {
      let row = {};
      row["c" + 0] = 'Actual No Trained';
      row["c" + 1] = '';
      row["c" + 2] = '';
      row["c" + 3] = '';
      row["c" + 4] = '';
      let index = 5
      for (let j = 0; j < this.skillMatrixDetails.workstationLvlCount.length; j++) {
        row["c" + (index)] = this.skillMatrixDetails.workstationLvlCount[j].totalCount;
        index++;
      }
      exportData.push(row);
    }
    // console.log(exportData)
    exportData.push({});
    if (this.filteredSkillMatrixTLData != null) {
      let row = {};
      row["c" + 0] = 'Team Leader Skill Level';
      row["c" + 1] = '';
      row["c" + 2] = '';
      row["c" + 3] = '';
      row["c" + 4] = '';
      let index = 5
      for (let j = 0; j < this.skillMatrixDetails.workstationLvlCount.length + 5; j++) {
        row["c" + (index)] = '';
        index++;
      }
      exportData.push(row);
    }
    exportData.push({});
    for (let i = 0; i < this.filteredSkillMatrixTLData.length; i++) {
      if (this.filteredSkillMatrixTLData[i].empLevel === 'TL') {
        let row = {};
        row["c" + 0] = i + 1;
        row["c" + 1] = this.filteredSkillMatrixTLData[i].empId;
        row["c" + 2] = this.filteredSkillMatrixTLData[i].empName;
        row["c" + 3] = this.filteredSkillMatrixTLData[i].experience;
        row["c" + 4] = this.filteredSkillMatrixTLData[i].empLevel;
        for (let j = 5; j < machineIndexColCount + 5; j++) {
          sheetColWidths.push(20);
          for (var key in this.filteredSkillMatrixTLData[i]) {
            if (key == tempWorkstationList[j - 5]) {
              let checked = this.isChecked(this.filteredSkillMatrixTLData[i], key);
              row["c" + j] = checked.level;
              if (checked.status == this.constant.EQUAL) {
                checkedIndexes.push({
                  row: i + 5,
                  col: j + 1
                });
              }
              break;
            }
          }
        }
        row["c" + (machineIndexColCount + 5)] = this.filteredSkillMatrixTLData[i].skillLevel;
        row["c" + (machineIndexColCount + 6)] = this.filteredSkillMatrixTLData[i].skillingPer + '%';
        row["c" + (machineIndexColCount + 7)] = this.filteredSkillMatrixTLData[i].marks;
        exportData.push(row);
      }
    }
    exportData.push({});
    for (let i = 0; i < this.skillMatrixDetails.tableEmpData.length; i++) {
      if (this.skillMatrixDetails.tableEmpData[i].empLevel === 'TL') {
        let row = {};
        row["c" + 0] = i + 1;
        row["c" + 1] = this.skillMatrixDetails.tableEmpData[i].empId;
        row["c" + 2] = this.skillMatrixDetails.tableEmpData[i].empName;
        row["c" + 3] = this.skillMatrixDetails.tableEmpData[i].experience;
        row["c" + 4] = this.skillMatrixDetails.tableEmpData[i].empLevel;
        for (let j = 5; j < machineIndexColCount + 5; j++) {
          sheetColWidths.push(20);
          for (var key in this.skillMatrixDetails.tableEmpData[i]) {
            if (key == tempWorkstationList[j - 5]) {
              let checked = this.isChecked(this.skillMatrixDetails.tableEmpData[i], key);
              row["c" + j] = checked.level;
              if (checked.status == this.constant.EQUAL) {
                checkedIndexes.push({
                  row: i + 5,
                  col: j + 1
                });
              }
              break;
            }
          }
        }
        row["c" + (machineIndexColCount + 5)] = this.skillMatrixDetails.tableEmpData[i].skillLevel;
        row["c" + (machineIndexColCount + 6)] = this.skillMatrixDetails.tableEmpData[i].skillingPer + '%';
        row["c" + (machineIndexColCount + 7)] = this.skillMatrixDetails.tableEmpData[i].marks;
        exportData.push(row);
      }
    }
    // console.log(exportData)



    //SECTION 6 - Bottom small level tables - Data
    row = {};
    row["c" + 0] = "Skill Level";
    row["c" + 1] = "REQD.";
    row["c" + 2] = "ACT.";
    row["c" + 3] = "GAP";
    exportData.push(row);

    for (let i = 0; i < this.skillMatrixDetails.levelSummary.length; i++) {
      if (this.skillMatrixDetails.levelSummary[i].levelName != 'L4') {
        row = {};
        row["c" + 0] = "L" + (i + 1);
        row["c" + 1] = this.skillMatrixDetails.levelSummary[i].requiredCount;
        row["c" + 2] = this.skillMatrixDetails.levelSummary[i].actualCount;
        if ((this.skillMatrixDetails.levelSummary[i].requiredCount && this.skillMatrixDetails.levelSummary[i].requiredCount > 0)
          && (this.skillMatrixDetails.levelSummary[i].requiredCount > this.skillMatrixDetails.levelSummary[i].actualCount)) {
          row["c" + 3] = this.skillMatrixDetails.levelSummary[i].requiredCount - this.skillMatrixDetails.levelSummary[i].actualCount;
        } else {
          row["c" + 3] = 0;
        }
        exportData.push(row);
      }
    }


    exportData.push({});
    row = {};
    row["c" + 0] = "Average Multiskilling %";
    row["c" + 1] = this.multiskillingPercentage + " %";
    exportData.push(row);

  
    // console.log(exportData);

    let headers: any = [];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Skill Matrix", {});

    for (let index = 0; index < columnCount; index++) {
      headers.push({
        key: ["c" + index], width: sheetColWidths[index]
      });
    }

    worksheet.columns = headers;

    var rows = [];
    var rowslist: any = {};
    Object.assign({}, rowslist);

    exportData.forEach((element) => {
      rowslist = {};
      for (var x in element) {
        rowslist[x] = element[x]
      }
      rows.push(rowslist);
    });

    worksheet.addRows(rows, "n");

    //Merging cells for MACHINE INDEX RATING, MIN.SKILL LEVL REQ. & REQUIRED NUMBER TRAINED cells
    for (let rowNumber = 1; rowNumber < 4; rowNumber++) {
      worksheet.mergeCells(rowNumber, 4, rowNumber, 5);
    }

    /* worksheet.mergeCells(1, 51, 2, 51); // Merge cells for rows 1 and 2 in column 51 ("c51")
     const areCellsMerged = worksheet.getCell(1, 51).isMerged || worksheet.getCell(1, 52).isMerged;
 
     if (!areCellsMerged) {
       // Merge cells for rows 1 and 2 in columns 51 and 52 ("c51" and "c52")
       worksheet.mergeCells(1, 52, 1, 53);
       worksheet.mergeCells(2, 53, 2, 53);
     }
     worksheet.mergeCells(3, 51, 4, 51); // Merge cells for rows 1 and 2 in column 51 ("c51")
     worksheet.mergeCells(3, 52, 4, 52); // Merge cells for rows 1 and 2 in column 51 ("c51")
     worksheet.mergeCells(3, 53, 4, 53); // Merge cells for rows 1 and 2 in column 51 ("c51")
     //Setting bold font to all cells first 4 rows*/


    // console.log(isNotTE)
    worksheet.mergeCells((isNotTE + 6), 1, (isNotTE + 6), 5);
    worksheet.mergeCells((isNotTE + 7), 1, (isNotTE + 7), (this.skillMatrixDetails.workstationLvlCount.length + 5 + 3));
    for (let rowNumber = 1; rowNumber < 5; rowNumber++) {
      let row = worksheet.getRow(rowNumber);
      row.font = {
        bold: true
      }
    }

    for (let rowNumber = 1; rowNumber < 4; rowNumber++) {
      let row = worksheet.getRow(rowNumber);

      // Loop through all columns starting from F (index 6 in Excel)
      for (let colNumber = 6; colNumber <= row.cellCount; colNumber++) {
        // Get the current cell
        let cell = row.getCell(colNumber);

        // Apply center alignment if the column is F or beyond
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
      }
    }
    //Setting bold font to headers of bottom level table
    let lvlTblRowIndex = 3 + 1 + 2 + this.skillMatrixDetails.tableEmpData.length;
    {
      let row = worksheet.getRow(lvlTblRowIndex);
      row.font = {
        bold: true
      }
    }

    //Setting borders to cells from tableData which shows level(L0,L1,L2) in RED & GREEN color
    for (let i = 5; i < this.skillMatrixDetails.tableEmpData.length + 5; i++) {
      let row = worksheet.getRow(i);
      row.eachCell((cell, colNumber) => {
        if (colNumber > 5) {
          cell.border = {
            top: { style: 'double', color: { argb: 'f6f6f6' } },
            left: { style: 'double', color: { argb: 'f6f6f6' } },
            bottom: { style: 'double', color: { argb: 'f6f6f6' } },
            right: { style: 'double', color: { argb: 'f6f6f6' } }
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }
      });
    }

    //Setting text center to cells of bottom lelve table
    if (this.hasSkillMatrixData) {
      lvlTblRowIndex = 3 + 1 + 2 + this.skillMatrixDetails.tableEmpData.length + this.filteredSkillMatrixTLData.length + 5;
    }
    else{
      lvlTblRowIndex = 3 + 1 + 2 + this.skillMatrixDetails.tableEmpData.length + this.filteredSkillMatrixTLData.length + 4;
    }
  
    // console.log('lvlTblRowIndex:', lvlTblRowIndex);
    // console.log('Total Rows:', worksheet.rowCount);

    for (let i = 0; i < this.skillMatrixDetails.levelSummary.length; i++) {
      let row = worksheet.getRow(lvlTblRowIndex + i + 1);
      row.alignment = {
        horizontal: 'center'
      }
      if (this.skillMatrixDetails.levelSummary[i].levelId == 1) {
        //RED color to L1 cell
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }
        }
      } else if (this.skillMatrixDetails.levelSummary[i].levelId == 2) {
        //GREEN color to L2 cell
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D9D9D9' }
        }
      } else if (this.skillMatrixDetails.levelSummary[i].levelId == 3) {
        //YELLOW color to L3 cell
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '99cd3a' }
        }
      }
      /* else if (this.skillMatrixDetails.levelSummary[i].levelId == 4) {
        //YELLOW color to L4 cell
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '99cd3a' }
        }
      } */
    }

    //Highlighting EQUAL, NOT EQUAL Cells with RED and GREEN color
    let nonTlEmployees = [];
    let tlEmployees = [];

    for (let i = 0; i < this.skillMatrixDetails.tableEmpData.length; i++) {
      if (this.skillMatrixDetails.tableEmpData[i].empLevel !== 'TL') {
        nonTlEmployees.push(this.skillMatrixDetails.tableEmpData[i]);
      } else {
        tlEmployees.push(this.skillMatrixDetails.tableEmpData[i]);
      }
    }
    for (let rowNumber = 5; rowNumber < nonTlEmployees.length + 5; rowNumber++) {
      let row = worksheet.getRow(rowNumber);
      for (let colNumber = 6; colNumber < machineIndexColCount + 5 + 4; colNumber++) {
        let isChecked = false;
        checkedIndexes.forEach(element => {
          if (element.row === rowNumber && element.col === colNumber) {
            isChecked = true;
          }
        });

        // Get the value of the current cell
        let cellValue = row.getCell(colNumber).value;

        // Check if the cell value is "L1", "L2", or "L3"
        if (cellValue === "L1") {
          // Set the fill color for "L1"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0000' } // Yellow
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else if (cellValue === "L2") {
          // Set the fill color for "L2"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9D9D9' } // Orange
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else if (cellValue === "L3") {
          // Set the fill color for "L3"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '99cd3a' } // Red
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }
        else if (cellValue === "L4") {
          // Set the fill color for "L3"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '99cd3a' } // Red
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else {
          // Handle other cases if needed
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }

      }
    }
    for (let rowNumber = 5 + nonTlEmployees.length; rowNumber < this.skillMatrixDetails.tableEmpData.length + 5 + 4; rowNumber++) {
      let row = worksheet.getRow(rowNumber);
      for (let colNumber = 6; colNumber < machineIndexColCount + 5 + 4; colNumber++) {
        let isChecked = false;
        checkedIndexes.forEach(element => {
          if (element.row === rowNumber && element.col === colNumber) {
            isChecked = true;
          }
        });

        // Get the value of the current cell
        let cellValue = row.getCell(colNumber).value;

        // Check if the cell value is "L1", "L2", or "L3"
        if (cellValue === "L1") {
          // Set the fill color for "L1"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0000' } // Yellow
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else if (cellValue === "L2") {
          // Set the fill color for "L2"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9D9D9' } // Orange
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else if (cellValue === "L3") {
          // Set the fill color for "L3"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '99cd3a' } // Red
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }
        else if (cellValue === "L4") {
          // Set the fill color for "L3"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '99cd3a' } // Red
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else {
          // Handle other cases if needed
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }

      }
    }
    for (let rowNumber = 5; rowNumber < this.skillMatrixDetails.workstationLvlCount.length + 5 ; rowNumber++) {
      let row = worksheet.getRow(rowNumber);
      for (let colNumber = 6; colNumber < machineIndexColCount + 5 + 1 + 1 ; colNumber++) {
        let isChecked = false;
        checkedIndexes.forEach(element => {
          if (element.row === rowNumber && element.col === colNumber) {
            isChecked = true;
          }
        });

        // Get the value of the current cell
        let cellValue = row.getCell(colNumber).value;

        // Check if the cell value is "L1", "L2", or "L3"
        if (cellValue === "L1") {
          // Set the fill color for "L1"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0000' } // Yellow
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else if (cellValue === "L2") {
          // Set the fill color for "L2"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9D9D9' } // Orange
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else if (cellValue === "L3") {
          // Set the fill color for "L3"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '99cd3a' } // Red
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else if (cellValue === "L4") {
          // Set the fill color for "L3"
          row.getCell(colNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '99cd3a' } // Red
          };
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else {
          // Handle other cases if needed
          row.getCell(colNumber).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }

      }
    }
    for (let rowNumber = 1; rowNumber < 4; rowNumber++) {
      worksheet.mergeCells(rowNumber, 1, rowNumber, 3);
    }

    


      // Common Function to Define colors for L1, L2, L3, L4 and implement it
      const colorMapping = {
        "L1": "FF0000",  // Red
        "L2": "D9D9D9",  // Light Gray
        "L3": "99CD3A",  // Greenish
        "L4": "99CD3A", 
       
    };
    const highlightValues = ["Actual No Trained", "Team Leader Skill Level","Skill Level","Average Multiskilling %"];
    const startColumn = "A";
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 3) { // Skip first 3 rows
          row.eachCell((cell) => {
              let cellValue = cell.value ? cell.value.toString() : ""; // Convert value to string
              if (colorMapping[cellValue]) {
                  cell.fill = {
                      type: "pattern",
                      pattern: "solid",
                      fgColor: { argb: colorMapping[cellValue] }, // Apply background color
                  };
                  cell.alignment = {
                      vertical: "middle", // Center vertically
                      horizontal: "center", // Center horizontally
                  };
                  cell.font = {
                      bold: true, // Make text bold
                  };
                  cell.border = {
                    top: { style: "thin", color: { argb: "808080" } }, // Gray border
                    bottom: { style: "thin", color: { argb: "808080" } },
                    left: { style: "thin", color: { argb: "808080" } },
                    right: { style: "thin", color: { argb: "808080" } },
                  };
              }
               // Array of values to check

              if (highlightValues.includes(cellValue)) {
                cell.alignment = {
                  vertical: "middle", //  vertically
                  horizontal: "left", //  horizontally
              };
              cell.font = {
                  bold: true, // Make text bold
              };
              }
          
        const columnIndex = cell.col; 

        const minWidth = 20; 
        const currentWidth = worksheet.getColumn(columnIndex).width || 10; 
        if (currentWidth < minWidth) {
            worksheet.getColumn(columnIndex).width = minWidth;
        }
          });
      }
      // if (rowNumber === (this.hasSkillMatrixData ? 5 : 4)) {
      //   row.alignment = {
      //     vertical: "middle",
      //     horizontal: "center",
      //   };
        
      // }
      if (rowNumber === (this.hasSkillMatrixData ? 4 : 3)) {
        row.eachCell((cell, colNumber) => {
          if (colNumber > 5) { // Exclude columns A to E (1 to 5)
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }
        });
      }
      
      // if (rowNumber === (this.hasSkillMatrixData ? 4 : 3)) {
      //   row.alignment = {
      //     vertical: "middle",
      //     horizontal: "center",
      //   };
    
      // }
   });
   // Apply center alignment for all cells in columns M (13) and N (14)
    worksheet.getColumn(13).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getColumn(14).alignment = { vertical: "middle", horizontal: "center" };

    workbook.xlsx.writeBuffer().then((data) => {
      var excelName = "Skill Matrix";
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, excelName + ".xlsx");
    });

  }
  testCell() {


    return true;
  }


  sortFunction(array, key) {
    if (array != null && array.length > 0) {
      array.sort(function (a, b) {
        var nameA = (!Number(a[key])) ? a[key].toUpperCase() : a[key];
        var nameB = (!Number(b[key])) ? b[key].toUpperCase() : b[key];
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

  getSearchList(flag: any) {

  }
  getSkillMatrixDetails() {

  }
  getBCForfReqSkillLvl(levelName: string): string {
    switch (levelName) {
      case 'Level 1':
        return 'white';
      case 'Level 2':
        return 'yellow';
      case 'Level 3':
        return '#acc906';
      case 'Level 4':
        return '#acc906';
      default:
        return ''; // You can set a default color here if needed
    }
  }
  getLevelNameForWorkstation(employee, workstationId) {
    const workstation = employee.workstations.find(data => data.id === workstationId);
    return workstation ? workstation.levelName : '';
  }
  getBackgroundColorForLevel(employee: any, workstationId: number): string {
    const levelName = this.getLevelNameForWorkstation(employee, workstationId);
    switch (levelName) {
      case 'Level 1':
        return 'white';
      case 'Level 2':
        return 'yellow';
      case 'Level 3':
        return '#acc906';
      case 'Level 4':
        return '#acc906';
      default:
        return ''; // You can set a default color here if needed
    }
  }
  getHighestWorkstationLevel(workstations) {
    const highestWorkstation = workstations.reduce((highest, current) => {
      if (!highest || current.reqSkillLevelId > highest.reqSkillLevelId) {
        return current;
      }
      return highest;
    }, null);

    return highestWorkstation ? highestWorkstation.levelName : '';
  }
  getBackgroundColorForHighestLevel(workstations: any[]): string {
    const highestLevelName = this.getHighestWorkstationLevel(workstations);

    switch (highestLevelName) {
      case 'Level 1':
        return 'white';
      case 'Level 2':
        return 'yellow';
      case 'Level 3':
        return '#acc906';
      case 'Level 4':
        return '#acc906';
      default:
        return ''; // You can set a default color here if needed
    }
  }
  filterModalOpen(modal) {
    this.searchDet.filterFlag = true;
    this.modalService.open(modal, {
      windowClass: 'filterPopup',
      backdrop: 'static',
      keyboard: false
    });
  }
  submitFilterForm(form) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      return;
    }
    this.isAppliedFilter = true;
    this.searchDet.filterFlag = false;
    this.modalService.dismissAll();
    this.getSkillMatixData();
  }
  removeFilter() {
    this.isAppliedFilter = false;
    this.filterData.reset();
    this.searchDet.branch = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
    this.searchDet.branchId = [];
    this.searchDet.deptId = [];
    this.searchDet.lineIds = [];
    this.searchDet.dept = [];
    this.searchDet.cell = [];
    this.searchDet.fromDate = null;
    this.searchDet.toDate = null;
    //this.searchDet.statusId = [];
    this.getSkillMatixData();
  }

  onChangeShift(ev: any) {
    // console.log(ev);
    this.getSkillMatixData();
  }

  filterList(): void {
    const searchValue = this.searchInput.trim().toLowerCase();
  
    this.filteredEmpData = this.skillMatrixDetails.tableEmpData.filter(row => 
      Object.values(row).some(value =>
        value.toString().toLowerCase().includes(searchValue)
      )
    );
  }
  
  clearSearch(): void {
     this.searchInput = '';
     this.filteredEmpData = [...this.skillMatrixDetails.tableEmpData];
  }
}
