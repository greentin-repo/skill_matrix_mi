import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { SkillingService } from '../../skilling.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AlertService } from 'src/app/theme/shared/components';
import { MatDatepicker, MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import * as moment from 'moment';
import { error } from 'console';

@Component({
  selector: 'app-add-view-workforce',
  templateUrl: './add-view-workforce.component.html',
  styleUrls: ['./add-view-workforce.component.scss']
})
export class AddViewWorkforceComponent implements OnInit {
  @Input() close;
  @Input() selectedDet;
  searchDet: any = {};
  shiftList: any = [];
  branchAccessList: any = [];
  deptList: any = [];
  cellList: any = [];
  userDet: any = {};
  submitLoader: boolean = false;
  listLoader: boolean = false;
  skillMatrixDetails: any = {};
  columns = [];
  SingleDropdownSettings: IDropdownSettings = {};
  constant: any = {};
  minDate: any = moment();
  constructor(
    public apiService: SkillingService,
    public alertService: AlertService,
    @Inject('Constant') Constant: any
  ) {
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    this.minDate = new Date();
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    if (this.selectedDet.title == 'View') {
      this.searchDet = {
        branch: [{ id: this.selectedDet.branchId, name: this.selectedDet.branchName }],
        dept: [{ id: this.selectedDet.deptId, name: this.selectedDet.deptName }],
        cell: [{ id: this.selectedDet.lineId, name: this.selectedDet.lineName }],
        shift: [{ id: this.selectedDet.shiftId, name: this.selectedDet.shiftName }],
        maxDate: new Date(moment(new Date()).format("YYYY,MM,DD")),
        fromDate: new Date(moment(this.selectedDet.fromDate).format("YYYY,MM,DD")),
        toDate: new Date(moment(this.selectedDet.toDate).format("YYYY,MM,DD"))
      }
      this.getWFDetails();
    } else {
      this.searchDet.maxDate = new Date(moment(new Date()).format("YYYY,MM,DD"));
      this.getBranchAccessList();
    }
  }
  /* gets Branch access list on employee
       @Author Mahesh
       @Date Oct 05, 2023
    */
  getBranchAccessList() {
    this.apiService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        } else {
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      } else {
        this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
      this.branchAccessList = this.sortFunction(this.branchAccessList, 'branchName');
      this.searchDet.branch = [this.branchAccessList[0]];
      this.getDeptList();
      this.getShiftData(this.searchDet.branch[0]);
    })
  }

  /* Change branch selction
     @Author Mahesh
     @Date Oct 05, 2023
  */
  onChangeBranch(event: any) {
    if (event) {
      this.getDeptList();
      // this.getCellList(event);
      this.getShiftData(event);
      this.shiftList = [];
      this.searchDet.shift = [];
    } else {
      this.deptList = [];
      this.searchDet.dept = [];
      this.cellList = [];
      this.searchDet.cell = [];
      this.shiftList = [];
      this.searchDet.shift = [];
    }
  }

  onChangeDept(data: any) {
    if (data) {
      this.getCellList();
      // this.getSkillMatixData();
      // this.getShiftData(data);
    } else {
      this.skillMatrixDetails = {};
      this.cellList = [];
      this.searchDet.cell = [];
    }
  }
  /* Change dept selction
     @Author Mahesh
     @Date Oct 05, 2023
  */
  onChangeCell(data: any) {
    if (data) {
      this.getSkillMatixData();
    } else {
      this.skillMatrixDetails = {};
    }
  }
  /* Change dept selction
     @Author Mahesh
     @Date Oct 05, 2023
  */
  onChangeShift(data: any) {
    if (data) {

    } else {

    }
  }
  getDeptList() {
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      this.apiService.getdepartmentlistbybranchid('getdepartmentlistbybranchid/' + this.searchDet.branch[0].id).subscribe((res: any) => {
        if (res.result) {
          if (res.deptList != null && res.deptList.length > 0) {
            /* Use For Add Screen */
            this.deptList = this.setArray(res.deptList, 'deptId', 'deptName');
            this.deptList = this.sortFunction(this.deptList, 'deptName');
            this.searchDet.dept = [this.deptList[0]];
            this.getCellList();
            // this.getSkillMatixData();
          } else {
            this.deptList = [];
          }
        } else {
          this.deptList = [];
        }
      })
    } else {
      this.cellList = [];
      this.searchDet.cell = [];
      this.skillMatrixDetails = {};
    }
  }

  /* get department list on branch selection
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
          this.getSkillMatixData();
        } else {
          this.cellList = [];
        }
      } else {
        this.cellList = [];
      }
    })
  }

  getShiftData(branch) {
    let req = {
      branchId: branch.id
    }
    this.apiService.getShiftData('apis/sm/getShiftList', req).subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          response.dataList = this.sortFunction(response.dataList, 'shiftName');
          this.shiftList = this.setArray(response.dataList, 'id', 'shiftName');
        } else {
          this.shiftList = [];
        }
      } else {
        this.shiftList = [];
      }
    })
  }
  selectDate(type, ev) {

  }

  getWFDetails() {
    this.skillMatrixDetails = {};
    this.listLoader = true;
    let req: any = {
      "deptId": this.selectedDet.deptId,
      "shiftId": this.selectedDet.shiftId,
      "branchId": this.selectedDet.branchId,
      "lineId": this.selectedDet.lineId
    }
    this.apiService.getWFDetailsList('apis/sm/getWorkForceDeploymentDetails', req).subscribe((res: any) => {
      this.listLoader = false;
      if (res.result) {
        this.skillMatrixDetails = res.data;
        if (this.skillMatrixDetails.columns != null && this.skillMatrixDetails.columns.length > 0) {
          for (let index = 0; index < this.skillMatrixDetails.columns.length; index++) {
            this.skillMatrixDetails.columns[index].id = this.skillMatrixDetails.columns[index].workstationId;
            this.skillMatrixDetails.columns[index].levelName = this.skillMatrixDetails.columns[index].level;
          }
        }
        if (this.skillMatrixDetails.empList != null && this.skillMatrixDetails.empList.length > 0) {
          this.selectedWorkForceData = [];
          for (let index = 0; index < this.skillMatrixDetails.empList.length; index++) {
            this.skillMatrixDetails.empList[index].isSelected = true;
            this.selectedWorkForceData.push(this.skillMatrixDetails.empList[index]);
          }
        }

      } else {
        this.skillMatrixDetails = {};
      }
    }, (error: any) => {
      this.skillMatrixDetails = {};
      this.listLoader = false;
    })
  }
  getSkillMatixData() {
    this.skillMatrixDetails = {};
    this.listLoader = true;
    let req: any = {
      "orgId": this.userDet.organization.orgId,
      "branchId": this.searchDet.branch[0].id
    }
    if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
      req.deptId = this.searchDet.dept[0].id;
    }
    if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
      req.lineId = this.searchDet.cell[0].id;
    }
    // getSkillMatrixList
    this.apiService.getSkillMatrixData('apis/sm/getSkillMatrixEmpList', req).subscribe((res: any) => {
      console.log(res);
      this.listLoader = false;
      if (res.result) {
        this.skillMatrixDetails = res.data;
        if (this.skillMatrixDetails.tableData != null && this.skillMatrixDetails.tableData.length > 0) {
          this.columns = [];
          for (let i = 0; i < this.skillMatrixDetails.columns.length; i++) {
            this.columns.push(this.skillMatrixDetails.columns[i].field);
            // console.log(this.columns)
          }
          // for (let j = 0; j < this.skillMatrixDetails.tableData.length; j++) {
          //   for (let i = 0; i < this.columns.length; i++) {
          //     const result = this.isCheckedStatus(this.skillMatrixDetails.tableData[j], this.columns[i]);
          //     // Check if the object exists before updating the property
          //     if (this.skillMatrixDetails.tableData[j]) {
          //       this.skillMatrixDetails.tableData[j].isEligible = result;
          //     }
          //   }
          // }
          console.log(this.skillMatrixDetails);

          for (let index = 0; index < this.skillMatrixDetails.tableData.length; index++) {
            this.skillMatrixDetails.tableData[index].isSelected = false;
          }
        }
        this.skillMatrixDetails.tableDataCopy = this.setArray(this.skillMatrixDetails.tableData, 'empId', 'empName');
        this.skillMatrixDetails.tableData = this.setArray(this.skillMatrixDetails.tableData, 'empId', 'empName');
      } else {
        this.skillMatrixDetails = {};
      }
    }, (error: any) => {
      this.skillMatrixDetails = {};
      this.listLoader = false;
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (this.selectedWorkForceData != null && this.selectedWorkForceData.length > 0) {
      for (const element of this.selectedWorkForceData) {
        let i = this.skillMatrixDetails.tableData.length;
        while (i--) {
          this.skillMatrixDetails.tableData[i].isSelected = false;
          if (this.skillMatrixDetails.tableData[i].empId == element.empId) {
            this.skillMatrixDetails.tableData[i].isSelected = true;
          }
        }
      }
    }
  }

  /* Comparison of Required skill level & Current skill level
     @Author Sanket B. (Modifier)
    * @Date Dec 28, 2023
  */
  isCheckedStatus(row: any, field: any) {
    for (let item in row) {
      if (field === item && row[item].hasOwnProperty("currentSkillLevelId") && row[item].hasOwnProperty("requireSkillLevelId")) {
        const currentLevel = row[item].currentSkillLevelId;
        const requiredLevel = row[item].requireSkillLevelId;
        if (currentLevel >= requiredLevel) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }
  // return obj;
  // }
  isEligibleCheck(ev, row) {
    let flag = false;
    // console.log(row.levelId + '>' + ev[row.field].currentSkillLevelId)
    if (ev[row.field].currentSkillLevelId >= row.levelId) {
      flag = true;
    }
    return flag;
  }

  selectedWorkForceData: any = [];
  onChangeEmp(ev, row, type) {
    console.log(ev)
    console.log(row)
    if (type == 'add') {
      let name = ev.name;
      if (!this.isObjectEmpty(this.isChecked(ev, row.field))) {
        name += ' (' + this.isChecked(ev, row.field).level + ')';
      }
      let obj = {
        "empId": ev.id,
        "empName": name,
        "workstationId": row.id,
        "isSelected": true,
        "isEligible": this.isEligibleCheck(ev, row)
      }
      this.selectedWorkForceData.push(obj);
      let j = this.skillMatrixDetails.tableData.length;
      while (j--) {
        if (this.skillMatrixDetails.tableData[j].empId == ev.empId)
          this.skillMatrixDetails.tableData[j].isSelected = true;
      }
      console.log(this.selectedWorkForceData)
    } else {
      if (this.selectedWorkForceData != null && this.selectedWorkForceData.length > 0) {
        let i = this.selectedWorkForceData.length;
        while (i--) {
          if (this.selectedWorkForceData[i].empId == ev.empId)
            this.selectedWorkForceData.splice(i, 1);
        }
      }
      let j = this.skillMatrixDetails.tableData.length;
      while (j--) {
        if (this.skillMatrixDetails.tableData[j].empId == ev.empId)
          this.skillMatrixDetails.tableData[j].isSelected = false;
      }
    }
  }
  saveWorkForce() {
    this.submitLoader = true;
    let cellObj: any = {};
    // if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
    //   cellObj = this.cellList.filter(x => x.id == this.searchDet.cell[0].id);
    // } else {
    //   this.alertService.error('Please select cell / line');
    //   this.submitLoader = false;
    //   return;
    // }
    if (this.searchDet.dept == null || this.searchDet.dept.length == 0) {
      this.alertService.error('Please select department');
      this.submitLoader = false;
      return;
    }
    if (this.searchDet.cell == null || this.searchDet.cell.length == 0) {
      this.alertService.error('Please select cell / line');
      this.submitLoader = false;
      return;
    }
    if (this.searchDet.shift == null || this.searchDet.shift.length == 0) {
      this.alertService.error('Please select shift');
      this.submitLoader = false;
      return;
    }
    if (!this.searchDet.fromDate || !this.searchDet.toDate) {
      this.alertService.error('Please select from and to date');
      this.submitLoader = false;
      return;
    }
    if (this.selectedWorkForceData != null && this.selectedWorkForceData.length > 0) {
      for (let index = 0; index < this.selectedWorkForceData.length; index++) {
        this.selectedWorkForceData[index].deptId = this.searchDet.dept[0].id;
        this.selectedWorkForceData[index].lineId = this.searchDet.cell[0].id;
        this.selectedWorkForceData[index].shiftId = this.searchDet.shift[0].id;
        this.selectedWorkForceData[index].fromDt = moment(this.searchDet.fromDate).format('YYYY-MM-DD');
        this.selectedWorkForceData[index].toDt = moment(this.searchDet.toDate).format('YYYY-MM-DD');
      }
    }
    let req: any = {
      createdBy: this.userDet.empId,
      empList: this.selectedWorkForceData
    }
    if (req.empList == null || req.empList.length == 0) {
      this.alertService.error('Please select employee');
      this.submitLoader = false;
      return;
    }
    console.log(req);
    /* let x = 0;
    if (x == 0) {
      this.submitLoader = false;
      return;
    } */
    this.apiService.saveWorkforceData('apis/sm/saveWorkForceDeployment', req).subscribe((res: any) => {
      this.submitLoader = false;
      if (res.result) {
        this.alertService.success('Workforce deployment saved successfully.');
        this.close('Cross Click');
      } else {
        if (res.statusCode == 100) {
          this.alertService.error(res.reason);
        } else {
          this.alertService.error('Error occurred while saving data. Please try again');
        }
      }
    }, (error: any) => {
      this.submitLoader = false;
    })

  }
  isObjectEmpty(objectName) {
    return Object.keys(objectName).length == 0
  }

  isChecked(row: any, field: string) {
    let obj: any = {};
    // console.log(row, field)
    for (let item in row) {
      if (this.selectedDet.title == 'View') {
        if (field == row.workstationName) {
          if (!this.isObjectEmpty(row) && row.hasOwnProperty("currentSkillLevel") && row.hasOwnProperty("currentSkillLevelId") && row.currentSkillLevelId != null) {
            if (row.currentSkillLevelId) {
              return { 'status': this.constant.EQUAL, level: row.currentSkillLevel };
            }
          } else {
            if (row.currentSkillLevelId == null) {
              return { 'status': this.constant.NOT_ELIGIBLE, level: 'L0' };
            } else {
              return { 'status': this.constant.NOT_ELIGIBLE, level: 'L0' };
            }
          }
        }
      }
      else if (field == item) {
        // console.log(item);
        if (!this.isObjectEmpty(row) && row[item].hasOwnProperty("currentSkillLevel") && row[item].hasOwnProperty("currentSkillLevelId")) {
          if (row[item].currentSkillLevelId == row[item].requireSkillLevelId) {
            return { 'status': this.constant.EQUAL, level: row[item].currentSkillLevel };
          } else if (row[item].currentSkillLevelId > row[item].requireSkillLevelId) {
            return { 'status': this.constant.EQUAL, level: row[item].currentSkillLevel };
          } else if ((row[item].requireSkillLevelId - row[item].currentSkillLevelId) == 1) {
            return { 'status': this.constant.ELIGIBLE, level: row[item].currentSkillLevel };
          } else if ((row[item].requireSkillLevelId - row[item].currentSkillLevelId) > 1) {
            return { 'status': this.constant.NOT_ELIGIBLE, level: row[item].currentSkillLevel };
          }
        } else {
          if (row[item].requireSkillLevelId == 1) {
            return { 'status': this.constant.NOT_ELIGIBLE, level: 'L0' };
          } else {
            return { 'status': this.constant.NOT_ELIGIBLE, level: 'L0' };
          }
        }
      }

    }
    return obj;
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


  /*
     Common function for set an array for dropdown
     Author: Mahesh
     Date : 05 Oct 2023
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
}
