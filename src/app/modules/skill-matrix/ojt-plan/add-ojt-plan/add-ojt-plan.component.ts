import { Component, Inject, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SkillingService } from '../../skilling.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatDatepicker, MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from 'src/app/theme/shared/components';



@Component({
  selector: 'app-add-ojt-plan',
  templateUrl: './add-ojt-plan.component.html',
  styleUrls: ['./add-ojt-plan.component.scss'],
  providers: [NgbModal, DatePipe]
})
export class AddOjtPlanComponent implements OnInit {
  addOJTPlan: FormGroup;
  userDet: any = {};
  ojtPlanData: any = {};
  submitLoader: boolean = false;
  submitSpinner: boolean = false;
  branchAccessList: any = [];
  ojtPlan: any = {};
  deptList: any = [];
  cellList: any = [];
  filterFlag: boolean = false;
  SingleDropdownSettings: IDropdownSettings = {};
  SingleDropdownSettingsOjtPlan: IDropdownSettings = {};
  date = new FormControl(moment());
  minDate: any;
  maxDate: any = moment();
  masterLevelList: any = [];

  empDetailsList: any = {};
  filteredEmpData: any = {};
  searchDet: any = {};
  worksatationData: any = [];
  selectedEntries: any = [];
  userTypeList: any = [];
  isSubmitSpinner: boolean = false;
  ojtPlanDetails: any = {};
  planDetails: any = {};
  selectedWorkstation: { [empId: string]: string } = {};
  columns: any;
  constant: any = {};
  errorList: any = [];
  searchInput: any;


  constructor(
    private modalService: NgbModal,
    private apiService: SkillingService,
    public datepipe: DatePipe,
    private fb: FormBuilder,
    private alertService: AlertService,
    @Inject('Constant') Constant: any
  ) {
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    console.log(this.userDet);
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.SingleDropdownSettingsOjtPlan = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: false,
      closeDropDownOnSelection: true,
    };
    // this.getSkillMatrixEmpList();
    // this.ojtPlan.ojtPlanDate = new Date;
    this.getOjtPlanDetails();
    // this.updateCheckboxes();
    this.getMasterSkillLevelList()
  }
  /* get OJT Plan Details
    @Author Jayshri Kolase
   * @Date August 26, 2023
 */
  getOjtPlanDetails() {
    this.ojtPlanData = JSON.parse(localStorage.getItem('ojtPlanDetails'));
    console.log(this.ojtPlanData)
    if (this.ojtPlanData.isEditable && this.ojtPlanData.planId > 0) {
      this.ojtPlan.branch = [{ id: this.ojtPlanData.branchId, name: this.ojtPlanData.branch }];
      // this.ojtPlan.cell = [{ id: this.ojtPlanData.deptId, name: this.ojtPlanData.deptName }];
      // this.ojtPlan.cell[0].deptId = this.ojtPlanData.deptId;
      // this.ojtPlan.ojtPlanDate = new Date(this.ojtPlanData.createdDate);
      var parsedDate = moment(this.ojtPlanData.createdDate, "YYYY-MM-DDTHH:mm:ss.SSSZ");
      // Format the parsed date into the desired moment.js format
      this.ojtPlan.ojtPlanDate = parsedDate.format("YYYY-MM-DD HH:mm:ss");

      console.log(this.ojtPlan.ojtPlanDate);
      this.getPlanDetailsById(this.ojtPlanData.planId);

    }
    else {
      this.getBranchAccessList();
      // this.getWorkstationList();
      // this.getSkillMatrixEmpList();
    }
  }
  /* gets selected plan details
   @Author Jayshri Kolase
   * @Date August 25, 2023
 */
  getPlanDetailsById(planId) {
    this.apiService.getOJTPlanDetails('apis/sm/getOJTPlanDetails/' + planId).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        if (response.ojtPlan) {
          this.planDetails = response.ojtPlan;
          if (this.planDetails.ojtRegiList != null && this.planDetails.ojtRegiList.length > 0) {
            for (let i = 0; i < this.planDetails.ojtRegiList.length; i++) {
              this.selectedEntries.push({
                ojtRegisId: this.planDetails.ojtRegiList[i].ojtRegiId,
                empId: this.planDetails.ojtRegiList[i].oeEmpId,
                desiredSkillLevelId: this.planDetails.ojtRegiList[i].desiredSkillLvlId,
                workstationId: this.planDetails.ojtRegiList[i].workstationId,
                action: "UPDATE"
              });
            }
          }
          if (this.planDetails.ojtRegiList != null) {
            this.ojtPlan.trainer = [{ id: this.planDetails.ojtRegiList[0].trainerEmpId, name: this.planDetails.ojtRegiList[0].trainerName }];
            this.ojtPlan.cell = [{ id: this.planDetails.ojtRegiList[0].lineId, name: this.planDetails.ojtRegiList[0].lineName }];
            this.ojtPlan.cell[0].deptId = this.planDetails.deptId;
            this.ojtPlan.dept = [{ id: this.planDetails.ojtRegiList[0].deptId, name: this.planDetails.ojtRegiList[0].deptName }];
          }
          console.log(this.ojtPlan.trainer);
          const datePipe = new DatePipe('en-US');
          // this.ojtPlan.ojtPlanDate = datePipe.transform(this.planDetails.startDate, 'yyyy-MM-dd');
          this.ojtPlan.ojtPlanDate = new Date(moment(this.planDetails.startDate).format("YYYY,MM,DD"));
          console.log(this.ojtPlan.ojtPlanDate)
          this.getWorkstationList();
          this.getUserTypeList();
          this.getSkillMatrixEmpList();

        }
      }
    })
  }


  /* gets Branch access list on employee
 @Author Jayshri Kolase
* @Date August 25, 2023
*/
  getBranchAccessList() {
    this.apiService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
          console.log(this.branchAccessList);
          this.branchAccessList = this.sortFunction(this.branchAccessList, 'name');
          this.ojtPlan.branchId = [this.branchAccessList[0]];
          // this.ojtPlan.branch = [this.branchAccessList[0]];
          console.log(this.ojtPlan.branch);
        } else {
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      } else {
        this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
      // this.ojtPlan.branch = [this.branchAccessList[0]];
      // this.ojtPlan.branchId = [this.branFchAccessList[0]];

      console.log(this.ojtPlan.branch);
      // this.getDeptList(this.ojtPlan.branchId[0]);
      // this.getLineList(this.ojtPlan.branchId[0]);

    })
  }

  /* Change branch selction
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  onChangeBranch(event: any) {
    this.ojtPlan.branchId = event.branchId;
    console.log(event);
    this.selectedEntries = [];
    this.cellList = [];
    this.ojtPlan.cell = [];
    this.getDeptList(event);
    // this.getLineList(event);
    // this.getWorkstationList();
    // this.getUserTypeList();
  }
  /* get Line list on branch selection
     @Author Jayshri Kolase
    * @Date oct 05, 2023
  */
  getLineList() {
    console.log(this.ojtPlan.dept)
    if (this.ojtPlan.dept != null) {
      const req = {
        "branchId": this.ojtPlan.branch[0].id,
        "deptId": this.ojtPlan.dept[0].id
      }
      this.apiService.getCellList('apis/sm/getCellList', req).subscribe((response: any) => {
        if (response.result) {
          if (response.dataList != null && response.dataList.length > 0) {
            this.cellList = this.setArray(response.dataList, 'lineId', 'lineName');
            console.log(this.cellList)
            if (this.cellList != null && this.cellList.length > 0) {
              this.cellList = this.sortFunction(this.cellList, 'lineName');
              // this.ojtPlan.cell = [this.cellList[0]];
              // this.ojtPlan.cell = [this.cellList[0]];
              this.getWorkstationList();
              this.getUserTypeList();
              this.getSkillMatrixEmpList();

            }
          }
          else {
            this.cellList = [];
          }
        }
      })
    }
  }
  /* get department list on branch selection
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  getDeptList(branch) {
    this.apiService.getdepartmentlistbybranchid('getdepartmentlistbybranchid/' + branch.id).subscribe((response: any) => {
      if (response.result) {
        if (response.deptList != null && response.deptList.length > 0) {
          /* Use For Add Screen */
          this.deptList = this.setArray(response.deptList, 'deptId', 'deptName');
          /* Use For Filter */
          this.searchDet.deptList = this.setArray(response.deptList, 'deptId', 'deptName');
          console.log(response);
          // this.deptList = response.deptList;
          // console.log(this.deptList);
          if (this.deptList != null && this.deptList.length > 0) {
            console.log(this.deptList[0]);
            // this.ojtPlan.dept = [this.deptList[0]];
            console.log(this.ojtPlan.dept);
            // this.getOjtPlanDetails();
            this.getLineList();
            this.getWorkstationList();
            this.getSkillMatrixEmpList();
          }
        }
      }
      else {
        this.deptList = [];
      }
    })
  }
  /* Change dept selction
     @Author Shashi
     @Date Sptember 12, 2023
  */
  onChangeDept(data: any) {
    if (data) {
      console.log(data);
      this.selectedEntries = [];
      this.cellList = [];
      this.ojtPlan.cell = [];
      this.empDetailsList = [];
      this.getLineList()
      // this.getWorkstationList();
      // this.getUserTypeList();
      // this.getSkillMatrixEmpList();
    } else {
      this.cellList = [];
      this.selectedEntries = [];
    }
  }
  /* On Change Line
    @Author Jayshri Kolase
   * @Date August 25, 2023
 */
  onChangeLine(data: any) {
    console.log(data);
    this.selectedEntries = [];
    this.getWorkstationList();
    this.getUserTypeList();
    this.getSkillMatrixEmpList();
  }
  /* Get Workstation List
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  getWorkstationList() {
    if (this.ojtPlan.branch != null && this.ojtPlan.dept != null && this.ojtPlan.cell != null) {
      let deptId;
      if (this.ojtPlanData.isEditable) {
        deptId = this.ojtPlan.cell[0].deptId;
      }
      else {
        // for (let i = 0; i < this.cellList.length; i++) {
        //   if (this.ojtPlan.cell[0].id == this.cellList[i].lineId) {
        deptId = this.ojtPlan.dept[0].id;
        //   }
        // }
      }
      let getReq = {
        "orgId": this.userDet.organization.orgId,
        "branchId": this.ojtPlan.branch[0].id,
        "deptId": deptId,
        "lineIds": [parseInt(this.ojtPlan.cell[0].id)]
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
  /* Get SkillMatrix Employee List
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  getSkillMatrixEmpList() {
    if (this.ojtPlan.branch != null && this.ojtPlan.cell != null) {
      let deptId;
      if (this.ojtPlanData.isEditable) {
        deptId = this.ojtPlan.cell[0].deptId;
      }
      else {
        for (let i = 0; i < this.cellList.length; i++) {
          if (this.ojtPlan.cell[0].id == this.cellList[i].lineId) {
            deptId = this.cellList[i].deptId;
          }
        }
      }
      let reqData: any = {
        "branchId": this.ojtPlan.branch[0].id,
        "deptId": deptId
      }
      if (this.ojtPlan.cell != null && this.ojtPlan.cell.length > 0) {
        reqData.lineId = parseInt(this.ojtPlan.cell[0].id);
      }
      if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
        reqData.search = this.searchDet.searchInput;
      }
      this.submitSpinner = true;

      this.apiService.getSkillMatrixEmpList('apis/sm/getSkillMatrixEmpList', reqData).subscribe((response: any) => {
        if (response.result) {
          this.submitSpinner = false;
          if (response.data) {
            this.empDetailsList = response.data;
            this.columns = this.empDetailsList.columns;
            this.filteredEmpData = this.empDetailsList.tableData;

            if (this.empDetailsList.tableData != null && this.empDetailsList.tableData.length > 0) {
              for (let i = 0; i < this.empDetailsList.tableData.length; i++) {
                if (this.planDetails.ojtRegiList != null && this.planDetails.ojtRegiList.length > 0) {
                  for (let j = 0; j < this.planDetails.ojtRegiList.length; j++) {
                    if (this.planDetails.ojtRegiList[j].oeEmpId == this.empDetailsList.tableData[i].empId) {
                      // this.empDetailsList.tableData[i].isSelected = true;
                      let data = this.empDetailsList.tableData[i]
                      for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                          // Check if the key is not equal to the field and if the key contains empSelectedLevel
                          if (this.planDetails.ojtRegiList[j].workstation == key) {
                            data[this.planDetails.ojtRegiList[j].workstation].empSelectedLevel = this.planDetails.ojtRegiList[j].desiredSkillLvlId;
                          }
                        }
                      }
                      this.empDetailsList.tableData[i] = data;
                    }
                  }
                }
              }
              for (let i = this.empDetailsList.tableData.length - 1; i >= 0; i--) {
                if (this.empDetailsList.tableData[i].oJTPending === "Y" && this.ojtPlanData.isEditable) {
                  // Remove the record from the array when oJTPending is "Y"
                  if (this.planDetails.ojtRegiList != null)
                    for (let j = 0; j < this.planDetails.ojtRegiList.length; j++) {
                      if (this.planDetails.ojtRegiList[j].oeEmpId != this.empDetailsList.tableData[i].empId) {
                        this.empDetailsList.tableData.splice(i, 1);
                      }
                    }
                }
              }
            }
            // console.log(this.empDetailsList)
            for (let i = this.empDetailsList.tableData.length - 1; i >= 0; i--) {
              if (this.empDetailsList.tableData[i].oJTPending === "Y" && !this.ojtPlanData.isEditable) {
                // Remove the record from the array when oJTPending is "Y"
                this.empDetailsList.tableData.splice(i, 1);
              }
            }

            if (this.empDetailsList.tableData != null && this.empDetailsList.tableData.length > 0) {
              for (let i = 0; i < this.empDetailsList.tableData.length; i++) {
                this.empDetailsList.tableData[i].isSelected = false;
              }
            }
            console.log(this.empDetailsList)
          }
        }
      })
    }
  }
  /* Get Heading With Level
     @Author Jayshri Kolase
    * @Date August 25, 2023
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

  /* After select Check Box
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */

  isChecked(row: any, field: string) {
    let obj: any = {};
    this.isSelected(row, field);
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



  toggleCheckBox(row: any, columnId: number) {
    // return rowWorkstationId === columnId;

    if (Array.isArray(row.workstationList) && row.workstationList.length > 0) {
      return row.workstationList.some(workstation => workstation.workstationId === columnId);
    }

    return false;
  }

  /* On Checkbox Change
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  onCheckboxChange(row: any, columnField: string): void {
    if (!this.ojtPlanData.isEditable) {
      // Find the selected workstation for this checkbox
      const workstationMatch = this.worksatationData.find(item => item.workstation === columnField);
      if (workstationMatch) {
        const empId = row.empId;
        const isSelectedField = this.isSelectedField(empId, columnField); // Check if already selected
        if (row[columnField].currentSkillLevelId >= parseInt(row[columnField].empSelectedLevel)) {
          this.alertService.error('Upgrade level must be greater than the current skill level.');
          row[columnField].empSelectedLevel = '';
          return;
        }
        if (isSelectedField) {
          // If it's already selected, deselect it
          this.deselectCheckbox(row, columnField);
        } else {
          // If it's not selected, select it
          this.selectCheckbox(row, columnField);
        }
      }
    } else {
      const workstationMatch = this.worksatationData.find(item => item.workstation === columnField);
      if (workstationMatch) {
        if (row[columnField].currentSkillLevelId >= parseInt(row[columnField].empSelectedLevel)) {
          this.alertService.error('Upgrade level must be greater than the current skill level.');
          row[columnField].empSelectedLevel = '';
          return;
        }
        const empId = row.empId;
        const isSelected = this.isSelectedField(empId, columnField); // Check if already selected
        const isAlreadyExist = this.isAlreadyExist(row, columnField);

        // if (isSelected || isAlreadyExist) {
        // If it's already selected, deselect it
        this.deselectCheckbox(row, columnField);
        // } else {
        // If it's not selected, select it
        this.selectUpdatedCheckbox(row, columnField);
        // }
      }
    }
  }
  isSelectedField(empId: string, columnField: string): boolean {
    return this.selectedWorkstation[empId] === columnField;
  }
  isAlreadyExist(row: any, field: string) {
    if (this.ojtPlanData.isEditable) {
      for (let i = 0; i < this.planDetails.ojtRegiList.length; i++) {
        // && this.planDetails.ojtRegiList[i].workstation === field 
        if (this.planDetails.ojtRegiList[i].oeEmpId === row.empId) {
          // row.isSelected = false;
          return true;
        }
      }
      return false;
    }
  }

  getSkillValue(array: any, value: any) {
    var obj: any = undefined;
    if (array != null && array.length > 0) {
      for (let index = 0; index < array.length; index++) {
        if (array[index].id === value) {
          obj = array[index];
          break;
        }
      }
    }
    return obj;
  }
  resetSelectedWorkstation(upRow: any, field: any) {
    if (typeof upRow === 'object' && !Array.isArray(upRow)) {
      for (const key in upRow) {
        if (upRow.hasOwnProperty(key)) {
          // Check if the key is not equal to the field and if the key contains empSelectedLevel
          if (key !== field && typeof upRow[key] === 'object' && upRow[key].hasOwnProperty('empSelectedLevel')) {
            delete upRow[key].empSelectedLevel;
          }
        }
      }
    }
    // Remove the entry from selectedEntries
    const existingIndex = this.selectedEntries.findIndex(entry =>
      entry.empId === upRow.empId
    );
    if (existingIndex !== -1) {
      this.selectedEntries.splice(existingIndex, 1);
    }
    // Update the selected workstation
    this.selectedWorkstation[upRow.empId] = undefined;
    console.log(this.selectedEntries)
  }
  deselectCheckbox(upRow: any, field: string): void {
    if (typeof upRow === 'object' && !Array.isArray(upRow)) {
      for (const key in upRow) {
        if (upRow.hasOwnProperty(key)) {
          // Check if the key is not equal to the field and if the key contains empSelectedLevel
          if (key !== field && typeof upRow[key] === 'object' && upRow[key].hasOwnProperty('empSelectedLevel')) {
            delete upRow[key].empSelectedLevel;
          }
        }
      }
    }
    // Remove the entry from selectedEntries
    const existingIndex = this.selectedEntries.findIndex(entry =>
      entry.empId === upRow.empId
    );
    if (existingIndex !== -1) {
      this.selectedEntries.splice(existingIndex, 1);
    }
    // Update the selected workstation
    this.selectedWorkstation[upRow] = undefined;
    console.log(this.selectedEntries)
  }

  // set New OJT Plan Register Request Body
  selectCheckbox(row: any, columnField: string): void {
    const empId = row.empId;
    const workstationMatch = this.worksatationData.find(item => item.workstation === columnField);
    if (row[columnField].empSelectedLevel == '' || row[columnField].empSelectedLevel == undefined || row[columnField].empSelectedLevel == 0) {
      return;
    }
    if (workstationMatch) {
      // Add the new entry
      this.selectedEntries.push({
        empId: empId,
        currentSkillLevelId: row.empLevelId,
        desiredSkillLevelId: parseInt(row[columnField].empSelectedLevel),
        workstationId: workstationMatch.id,
        action: "ADD"
      });

      // Update the UI to deselect the previous checkbox
      const previousWorkstation = this.selectedWorkstation[empId];
      if (previousWorkstation) {
        this.deselectCheckbox(row, columnField);
      }

      // Update the selected workstation for this employee
      this.selectedWorkstation[empId] = columnField;

      console.log(this.selectedEntries)
    }
  }
  // set Update OJT Plan Register Request Body
  selectUpdatedCheckbox(row: any, columnField: string): void {
    console.log(row);
    console.log(columnField);

    if (row[columnField].empSelectedLevel == '' || row[columnField].empSelectedLevel == undefined || row[columnField].empSelectedLevel == 0) {
      return;
    }
    // Find the selected workstation for this checkbox
    const workstationMatch = this.worksatationData.find(item => item.workstation === columnField);

    // if (workstationMatch) {
    const empId = row.empId;
    // Check if the employee has already applied for a workstation skill
    const existingIndex = this.selectedEntries.findIndex(entry =>
      entry.empId === empId
    );
    const existingWorkstationIndex = this.selectedEntries.findIndex(entry =>
      entry.workstationId === workstationMatch.id
    );
    if (existingIndex !== -1) {
      // Employee has already applied for a workstation skill
      // Remove the previous entry if it exists
      this.selectedEntries.splice(existingIndex, 1);
    }
    if (existingWorkstationIndex !== -1) {
      // Employee has already applied for a workstation skill
      // Remove the previous entry if it exists
      this.selectedEntries.splice(existingWorkstationIndex, 1);
    }
    // Check if empId exists in this.planDetails.ojtRegiList as oeEmpId
    const ojtRegiItem = this.planDetails.ojtRegiList.find(item => item.oeEmpId === empId);
    let ojtRegiId;
    let isWorkstation;
    let isWorkstationAvail;
    for (let i = 0; i < this.planDetails.ojtRegiList.length; i++) {
      if (this.planDetails.ojtRegiList[i].oeEmpId == empId) {
        ojtRegiId = this.planDetails.ojtRegiList[i].ojtRegiId;
        isWorkstation = this.planDetails.ojtRegiList[i].workstation;
        this.selectedWorkstation[empId] = isWorkstation;
        isWorkstationAvail = this.planDetails.ojtRegiList[i].workstation === columnField;


        // If the checkbox is unchecked, create a DELETE action
        /* if (this.planDetails.ojtRegiList[i].workstation !== columnField || isWorkstationAvail) {
          this.selectedEntries.push({
            ojtRegisId: this.planDetails.ojtRegiList[i].ojtRegiId,
            empId: this.planDetails.ojtRegiList[i].oeEmpId,
            desiredSkillLevelId: this.planDetails.ojtRegiList[i].desiredSkillLvlId,
            workstationId: this.planDetails.ojtRegiList[i].workstationId,
            action: "DELETE"
          });
        } */


        if (ojtRegiId != undefined) {
          if (ojtRegiItem) {
            // Update the selected workstation for this employee
            this.selectedWorkstation[empId] = columnField;

          }
          // Add the new entry only if the checkbox is checked
          this.selectedEntries.push({
            ojtRegisId: ojtRegiId,
            empId: empId,
            desiredSkillLevelId: parseInt(row[columnField].empSelectedLevel),
            workstationId: workstationMatch.id,
            action: "UPDATE"
          });

          // // Update the selected workstation for this employee
          this.selectedWorkstation[empId] = columnField;

        }

      }
    }
    if (ojtRegiId == undefined || ojtRegiId == "") {
      this.selectedEntries.push({
        "empId": empId,
        "desiredSkillLevelId": parseInt(row[columnField].empSelectedLevel),
        "workstationId": workstationMatch.id,
        "action": "ADD",
        "updatedBy": this.userDet.empId,
        "createdBy": this.userDet.empId
      });
      // Update the selected workstation for this employee
      this.selectedWorkstation[empId] = columnField;

    }
    console.log(this.selectedEntries);
  }

  onOjtPlanDateSelected(event: MatDatepickerInputEvent<Date>) {
    this.ojtPlan.ojtPlanDate = event.value;
  }

  /* Get User Type List
    @Author Jayshri Kolase
   * @Date August 25, 2023
  */
  getUserTypeList() {
    if (this.ojtPlan.branch != null && this.ojtPlan.cell != null) {
      let deptId;
      if (this.ojtPlanData.isEditable) {
        deptId = this.ojtPlan.cell[0].deptId;
      }
      else {
        for (let i = 0; i < this.cellList.length; i++) {
          if (this.ojtPlan.cell[0].id == this.cellList[i].lineId) {
            deptId = this.cellList[i].deptId;
          }
        }
      }
      let reqData: any = {};
      reqData = {
        "orgId": this.userDet.organization.orgId,
        "branchId": this.ojtPlan.branch[0].id,
        "deptId": deptId
      }
      if (this.ojtPlan.cell != null && this.ojtPlan.cell.length > 0) {
        reqData.lineIds = [parseInt(this.ojtPlan.cell[0].id)];
      }
      this.apiService.getUserTypeList('apis/sm/getUserTypeList', reqData).subscribe((response: any) => {
        if (response.result) {
          if (response.dataList != null && response.dataList.length > 0) {
            // this.userTypeList = response.dataList;
            let data: any = [];
            for (let i = 0; i < response.dataList.length; i++) {
              if (response.dataList[i].userType == "TRAINER") {
                data.push(response.dataList[i]);
              }
            }
            this.userTypeList = this.setArray(data, 'empId', 'empName');
            console.log(response);
            // this.ojtPlan.trainer = [this.userTypeList[0]];
          }
          else {
            this.userTypeList = [];
            this.ojtPlan.trainer = [];
          }
        }
        else {
          this.userTypeList = [];
          this.ojtPlan.trainer = [];
        }
      })
    }
  }
  /* Show default selected
    @Author Jayshri Kolase
   * @Date Oct 06, 2023
  */
  isSelected(row: any, field: string) {
    if (this.ojtPlanData.isEditable) {
      for (let i = 0; i < this.planDetails.ojtRegiList.length; i++) {
        if (this.planDetails.ojtRegiList[i].oeEmpId == row.empId) {
          if (this.planDetails.ojtRegiList[i].workstation == field) {
            const newCheckboxId = `checkbox${row.empId}_${field}`;
            const newCheckboxElement = document.getElementById(newCheckboxId) as HTMLInputElement;
            if (newCheckboxElement) {
              newCheckboxElement.checked = true;
              row.isSelected = true;
            }
          }
        }
      }
    }
  }

  /* Submit OJT Plan
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  submitOJTPlan(status, content) {
    this.isSubmitSpinner = true;
    console.log(this.ojtPlan.ojtPlanDate);
    if (this.ojtPlan.branch == null || this.ojtPlan.branch.length == 0 || this.ojtPlan.branch == undefined) {
      this.alertService.error('Please select Plant.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    if (this.ojtPlan.dept == null || this.ojtPlan.dept.length == 0 || this.ojtPlan.dept == undefined) {
      this.alertService.error('Please select Department.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    if (this.ojtPlan.cell == null || this.ojtPlan.cell.length == 0 || this.ojtPlan.cell == undefined) {
      this.alertService.error('Please select Cell.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    if (this.ojtPlan.trainer == null || this.ojtPlan.trainer.length === 0 || this.ojtPlan.trainer == undefined) {
      this.alertService.error('Please select trainer.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    if (!this.ojtPlan.ojtPlanDate) {
      this.alertService.error('Please select OJT plan date.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }

    if (!this.selectedEntries == null || this.selectedEntries.length === 0) {
      this.alertService.error('Please select an employee for level upgrade.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no entries are selected
    }
    let formattedDate
    if (this.ojtPlan.ojtPlanDate) {
      // Format the date in 'YYYY/MM/DD' format
      formattedDate = this.datepipe.transform(this.ojtPlan.ojtPlanDate, 'yyyy-MM-dd');

      // Extract month and year components (if needed)
      const dateComponents = formattedDate.split('-');
      this.ojtPlan.ojtPlanMonth = dateComponents[1]; // Month component (MM)
      this.ojtPlan.ojtPlanYear = dateComponents[0];  // Year component (yyyy)

      console.log('Formatted Date:', formattedDate);
      console.log('Month:', this.ojtPlan.ojtPlanMonth);
      console.log('Year:', this.ojtPlan.ojtPlanYear);
    }
    let deptId;
    for (let i = 0; i < this.cellList.length; i++) {
      if (this.ojtPlan.cell[0].id == this.cellList[i].lineId) {
        deptId = this.cellList[i].deptId;
      }
    }

    console.log(status);
    if (this.ojtPlan.branch != null && this.ojtPlan.cell != null && this.ojtPlan.trainer != null && this.ojtPlan.ojtPlanDate != undefined && this.selectedEntries != null && this.selectedEntries.length > 0) {
      // Add the trainerEmpId to each entry in this.selectedEntries
      const trainerEmpId = this.ojtPlan.trainer[0].id;
      for (const entry of this.selectedEntries) {
        entry.trainerEmpId = trainerEmpId;
      }
      const lineId = this.ojtPlan.cell[0].id;
      for (const entry of this.selectedEntries) {
        entry.lineId = lineId;
      }
      let reqData = {
        "branchId": this.ojtPlan.branch[0].id,
        "deptId": deptId,
        "lineId": this.ojtPlan.cell[0].id,
        "yearValue": this.ojtPlan.ojtPlanYear,
        "monthValue": this.ojtPlan.ojtPlanMonth,
        "startDate": formattedDate,
        "status": status,
        "updatedBy": this.userDet.empId,
        "createdBy": this.userDet.empId,
        "ojtRegisList": this.selectedEntries
      };
      console.log(reqData);
      this.apiService.submitOJTPlan('apis/sm/submitOJTPlan', reqData).subscribe((response: any) => {
        console.log(response);
        this.isSubmitSpinner = false;
        if (response.result) {
          this.alertService.success("OJT Plan registartion completed.")
          this.modalService.dismissAll();
        } else {
          if (response.statusCode == 100) {
            if (response.errorList) {
              if (response.errorList) {
                if (response.errorList != null && response.errorList.length > 0) {
                  this.errorList = response.errorList;
                  this.modalService.open(content, {
                    windowClass: "errorListClass",
                  });
                }
              }

            }
            else {
              this.alertService.error(response.reason);
            }
          }
          else if (response.statusCode == 500) {
            console.log("500")
            this.alertService.error("Oops! Something went wrong");
          } else {
            this.alertService.success(response.reason)
          }
        }
      })
    }

  }
  /* Update OJT Plan
    @Author Jayshri Kolase
   * @Date Aug 06, 2023
  */
  UpdateOJTPlan(status, content) {
    this.isSubmitSpinner = true;
    console.log(this.ojtPlan.ojtPlanDate);
    if (this.ojtPlan.branch == null || this.ojtPlan.branch.length == 0 || this.ojtPlan.branch == undefined) {
      this.alertService.error('Please select Plant.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    if (this.ojtPlan.dept == null || this.ojtPlan.dept.length == 0 || this.ojtPlan.dept == undefined) {
      this.alertService.error('Please select Department.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    if (this.ojtPlan.cell == null || this.ojtPlan.cell.length == 0 || this.ojtPlan.cell == undefined) {
      this.alertService.error('Please select Cell.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    if (!this.ojtPlan.trainer == null || this.ojtPlan.trainer.length === 0) {
      this.alertService.error('Please select trainer.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    if (!this.ojtPlan.ojtPlanDate) {
      this.alertService.error('Please select OJT plan date.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }

    if (!this.selectedEntries == null || this.selectedEntries.length === 0) {
      this.alertService.error('Please select an employee for level upgrade.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no entries are selected
    }
    let formattedDate
    if (this.ojtPlan.ojtPlanDate) {
      // Format the date in 'YYYY/MM/DD' format
      formattedDate = this.datepipe.transform(this.ojtPlan.ojtPlanDate, 'yyyy-MM-dd');

      // Extract month and year components (if needed)
      const dateComponents = formattedDate.split('-');
      this.ojtPlan.ojtPlanMonth = dateComponents[1]; // Month component (MM)
      this.ojtPlan.ojtPlanYear = dateComponents[0];  // Year component (yyyy)

      console.log('Formatted Date:', formattedDate);
      console.log('Month:', this.ojtPlan.ojtPlanMonth);
      console.log('Year:', this.ojtPlan.ojtPlanYear);
    }

    console.log(status);
    if (this.ojtPlan.branch != null && this.ojtPlan.cell != null && this.ojtPlan.ojtPlanDate != undefined && this.selectedEntries != null && this.selectedEntries.length > 0) {
      const trainerEmpId = this.ojtPlan.trainer[0].id;
      for (const entry of this.selectedEntries) {
        entry.trainerEmpId = trainerEmpId;
      }
      let reqData = {
        "ojtPlanId": this.planDetails.ojtPlanId,
        "yearValue": this.ojtPlan.ojtPlanYear,
        "monthValue": this.ojtPlan.ojtPlanMonth,
        "startDate": formattedDate,
        "status": status,
        "updatedBy": this.userDet.empId,
        "action": "UPDATE",
        "branchId": this.ojtPlan.branch[0].id,
        "deptId": this.ojtPlan.dept[0].id,
        "lineId": parseInt(this.ojtPlan.cell[0].id),
        "ojtRegisList": this.selectedEntries,
      };
      console.log(reqData);
      this.apiService.submitOJTPlan('apis/sm/updateOJTPlan', reqData).subscribe((response: any) => {
        console.log(response);
        this.isSubmitSpinner = false;
        if (response.result) {
          this.alertService.success("OJT plan updated successfully.")
          this.modalService.dismissAll();
        }
        //  else {
        //   if (response.statuCode == 100) {
        //     this.alertService.error(response.reason);
        //   } else {
        //     this.alertService.success("Error occurred while submitting data. Please try again")
        //   }
        // }
        else {
          if (response.statusCode == 100) {
            if (response.errorList) {
              if (response.errorList) {
                if (response.errorList != null && response.errorList.length > 0) {
                  this.errorList = response.errorList;
                  this.modalService.open(content, {
                    windowClass: "errorListClass",
                  });
                }
              }

            }
            else {
              this.alertService.error(response.reason);
            }
          }
          else if (response.statusCode == 500) {
            console.log("500")
            this.alertService.error("Oops! Something went wrong");
          } else {
            this.alertService.success(response.reason)
          }
        }
      })
    }

  }
  /* Set Month And Year
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  setMonthAndYear(normalizedMonthAndYear: _moment.Moment, datepicker: MatDatepicker<_moment.Moment>) {
    const ctrlValue = this.date.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }
  /* Close Modal
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  closeModal() {
    this.searchDet.selectedRegiType = "";
    this.modalService.dismissAll();
  }
  /*
     Single Select Dropdown onChange function
     Author: Jayshri Kolase
     Date : 21 Aug 2023
  */
  onChange(ev: any, type) {
    if (ev) {
      if (type == 'plant') {
        this.getDeptList(this.ojtPlan.branch[0]);
        // this.getLineList(this.ojtPlan.branchId[0]);
      }
    } else {
      if (type == 'plant') {
        this.ojtPlan.departmentList = [];
        this.resetFormField(this.addOJTPlan, 'deptIds');
      } /*else if (type == 'dept') {
          } else if (type == 'userType') { }*/
    }
  }
  /* 
      Reset Form function
      Author: Mahesh W
      Date : 21 Aug 2023
  */
  resetFormField(form, keyName) {
    Object.keys(form.controls).forEach(key => {
      if (keyName != '' && key == keyName) {
        form.get(keyName).reset();
        form.get(keyName).markAsPristine();
        form.get(keyName).markAsUntouched();
      } else {
        form.get(key).reset();
        form.get(key).markAsPristine();
        form.get(key).markAsUntouched();
      }
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
  /*
     Combined Header Employee Name and Employee Level
     Author: Mahesh W
     Date : 21 Aug 2023
  */
  getCombinedHeader() {
    const empLevelColumn = this.empDetailsList.columns.find(column => column.field === 'empName');
    return ` ${empLevelColumn.heading}`;
  }
  /*
     Should Show Checkbox
     Author: Mahesh W
     Date : 21 Aug 2023
  */
  shouldShowCheckbox(columnField: string): boolean {
    // Add your logic here to determine whether a checkbox should be displayed
    // For example, you can check if the columnField is a specific field that requires a checkbox
    return columnField === 'fieldName1' || columnField === 'fieldName2';
  }

  /* Common function For Searching  
  @Author Saurabh salunke
  * @Date August 31, 2023*/
  getSearchList(ev) {
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.searchDet.searchInput != undefined) {
      for (let i = 0; i < this.empDetailsList.tableData.length; i++) {
        if (this.empDetailsList.tableData[i].cmpyEmpId != this.searchDet.searchInput || this.empDetailsList.tableData[i].empName != this.searchDet.searchInput) {
          this.empDetailsList.tableData.splice(i, 1);
        }
      }
    }
  }
  clearSearch(ev) {
    this.searchDet.searchData = false
    this.searchDet.searchInput = '';
    this.getSkillMatrixEmpList();
  }
  getSortFunction(array, fieldToSort) {
    // console.log(array, fieldToSort);
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
  getMasterSkillLevelList() {
    this.apiService.getMasterLevelList('apis/sm/getLevelList').subscribe((res: any) => {
      if (res.result) {
        if (res.dataList != null && res.dataList.length > 0) {
          const list = [];
          for (let i = 0; i < res.dataList.length; i++) {
            if (res.dataList[i].id !== 4) {
              list.push(res.dataList[i]);
            }
          }
          this.masterLevelList = this.setArray(list, 'id', 'levelName');
          console.log(this.masterLevelList)
        } else {
          this.masterLevelList = [];
        }
      } else {
        this.masterLevelList = [];
      }
    })
  }
  isCurrentLevelCheck(row: any, field: string) {
    let obj: any = {};
    this.isSelected(row, field);
    for (let item in row) {
      if (field == item) {
        //Condition 1
        if (row[item].currentSkillLevelId == undefined || row[item].currentSkillLevelId == 0) {
          return "L0";
        } else if (row[item].currentSkillLevelId == 1) {
          return row[item].currentSkillLevel;
        } else if (row[item].currentSkillLevelId == 2) {
          return row[item].currentSkillLevel;
        } else if (row[item].currentSkillLevelId == 2) {
          return row[item].currentSkillLevel;
        } else if (row[item].currentSkillLevelId == 4) {
          return row[item].currentSkillLevel;
        }
      }
    }
  }
  getOptionBackgroundColor(currentSkillLvl: any, levelId: any): any {
    const defaultColor = { 'background-color': '#d9d9d9' };
    if (currentSkillLvl.currentSkillLevelId == null || currentSkillLvl.currentSkillLevelId == undefined) {
      currentSkillLvl.currentSkillLevelId = 0;
    }
    if (currentSkillLvl.currentSkillLevelId == levelId) {
      return { 'background-color': 'green' };
    } else if (currentSkillLvl.currentSkillLevelId > levelId) {
      return { 'background-color': 'green' };
    } else if (levelId > currentSkillLvl.currentSkillLevelId + 1) {
      return { 'background-color': 'red' };
    }
    else {
      return defaultColor;
    }
  }


  filterList(): void {
    const searchValue = this.searchInput.trim().toLowerCase();
    // empDetailsList.tableData
    this.filteredEmpData = this.empDetailsList.tableData.filter(row =>
      Object.values(row).some(value =>
        value.toString().toLowerCase().includes(searchValue)
      )
    );
    console.log(this.filteredEmpData);

  }

  clearModalSearch(): void {
    this.searchInput = '';
    this.filteredEmpData = [...this.empDetailsList.tableData];
  }
}


