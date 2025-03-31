import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SkillingService } from '../../skilling.service';
// import { DatePipe } from '@angular/common';
import { AlertService } from 'src/app/theme/shared/components';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-ojt-register',
  templateUrl: './ojt-register.component.html',
  styleUrls: ['./ojt-register.component.scss']
})
export class OjtRegisterComponent implements OnInit {

  addOJTPlan: FormGroup;
  userDet: any = {};
  ojtPlanData: any = {};
  submitLoader: boolean = false;
  branchAccessList: any = [];
  ojtPlan: any = {};
  deptList: any = [];
  cellList: any = [];
  SingleBranchDropdownSettings: IDropdownSettings = {};
  SingleDeptDropdownSettings: IDropdownSettings = {};
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  empDetailsList: any = {};
  searchDet: any = {};
  worksatationData: any = [];
  selectedEntries: any = [];
  isSubmitSpinner: boolean = false;
  ojtPlanDetails: any = {};
  planDetails: any = {};
  @Output() childComponentClosed = new EventEmitter<void>();
  userTypeList: any = [];
  selectedWorkstation: { [empId: string]: string } = {};
  constant: any = {};
  OJTRegiData: any = {};

  constructor(
    public modalConfig: NgbModalConfig,
    public modalService: NgbModal,
    private apiService: SkillingService,
    private fb: FormBuilder,
    private alertService: AlertService,
    @Inject('Constant') Constant: any
  ) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    console.log(this.userDet);
    this.OJTRegiData = JSON.parse(localStorage.getItem('OJTRegiData'));
    console.log(this.OJTRegiData);
    const today = new Date();
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.ojtPlan.ojtPlanDate = new Date();
    this.getBranchAccessList();
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
          this.branchAccessList = this.getSortFunction(this.branchAccessList, 'name');
          this.ojtPlan.branch = [this.branchAccessList[0]];
        } else {
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      } else {
        this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
      // this.ojtPlan.branch = [this.branchAccessList[0]];
      // this.ojtPlan.branchId = [this.branchAccessList[0]];
      console.log(this.ojtPlan.branch);
      this.getDeptList(this.ojtPlan.branch[0]);
      this.getLineList(this.ojtPlan.branch[0]);
      this.getUserTypeList();
    })
  }

  /* Change branch selction
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  onChangeBranch(event: any) {
    this.ojtPlan.branchId = event.branchId;
    console.log(event);
    this.getDeptList(event);
    this.getLineList(event);
    this.getUserTypeList();
    // this.getWorkstationList();
  }
  /* get Line list on branch selection
     @Author Jayshri Kolase
    * @Date oct 05, 2023
  */
  getLineList(dept) {
    if (dept != null) {
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
              this.cellList = this.getSortFunction(this.cellList, 'lineName');
              this.ojtPlan.cell = [this.cellList[0]];
              this.getWorkstationList();
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
            this.ojtPlan.dept = [this.deptList[0]];
            // this.getOjtPlanDetails();
            this.getLineList(this.ojtPlan.dept)
            this.getWorkstationList();
            this.getSkillMatrixEmpList();
            this.getUserTypeList();
          }
        }
      }
      else {
        this.deptList = [];
      }
    })
  }
  /* After select Check Box
    @Author Jayshri Kolase
   * @Date August 25, 2023
 */

  isChecked(row: any, field: string) {
    let obj: any = {};
    for (let item in row) {
      if (field == item) {
        //Condition 1
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
            return { 'status': this.constant.ELIGIBLE, level: '-' };
          } else {
            return { 'status': this.constant.NOT_ELIGIBLE, level: '-' };
          }
        }
      }
    }
    return obj;
  }

  /* Change Line/Cell selction
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  onChangeLine(data: any) {
    console.log(data);
    this.getWorkstationList();
    this.getSkillMatrixEmpList();
    this.getUserTypeList();
  }
  /* Get Workstation List
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  getWorkstationList() {
    if (this.ojtPlan.branch != null && this.ojtPlan.cell != null) {
      let deptId;
      for (let i = 0; i < this.cellList.length; i++) {
        if (this.ojtPlan.cell[0].id == this.cellList[i].lineId) {
          deptId = this.cellList[i].deptId;
        }
      }
      let getReq = {
        "orgId": this.userDet.organization.orgId,
        "branchId": this.ojtPlan.branch[0].id,
        "deptId": deptId,
        "lineIds": [this.ojtPlan.cell[0].id]
      };
      console.log(getReq);
      this.apiService.getWorkstationList('apis/sm/getWorkstationList', getReq).subscribe((response: any) => {
        console.log(response);
        if (response.result) {
          this.worksatationData = response.dataList;
          console.log(this.worksatationData);
        }
        else {
          this.worksatationData = [];
        }
      });
    }
  }
  /* Get Skill Matrix Employee List
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  getSkillMatrixEmpList() {
    if (this.ojtPlan.branch != null && this.ojtPlan.cell != null) {
      let deptId;
      for (let i = 0; i < this.cellList.length; i++) {
        if (this.ojtPlan.cell[0].id == this.cellList[i].lineId) {
          deptId = this.cellList[i].deptId;
        }
      }
      let reqData: any = {
        "branchId": this.ojtPlan.branch[0].id,
        "deptId": deptId
      }
      if (this.ojtPlan.cell != null && this.ojtPlan.cell.length > 0) {
        reqData.lineId = this.ojtPlan.cell[0].id;
      }
      this.apiService.getSkillMatrixEmpList('apis/sm/getSkillMatrixEmpList', reqData).subscribe((response: any) => {
        if (response.result) {
          this.empDetailsList = response.data;
          console.log(response);
          for (let i = this.empDetailsList.tableData.length - 1; i >= 0; i--) {
            if (this.empDetailsList.tableData[i].oJTPending === "Y" && !this.ojtPlanData.isEditable) {
              // Remove the record from the array when oJTPending is "Y"
              this.empDetailsList.tableData.splice(i, 1);
            }
          }
        }
      })
    }

  }
  /* Get User Type List
     @Author Jayshri Kolase
    * @Date August 25, 2023
  */
  getUserTypeList() {
    if (this.ojtPlan.branch != null && this.ojtPlan.dept != null) {
      let deptId;
      // for (let i = 0; i < this.cellList.length; i++) {
      //   if (this.ojtPlan.dept[0].id == this.cellList[i].lineId) {
      deptId = this.ojtPlan.dept[0].deptId;
      // }
      // }
      let reqData = {
        "orgId": this.userDet.organization.orgId,
        "branchId": this.ojtPlan.branch[0].id,
        "deptIds": [deptId]
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
  }

  /* Change on check employee or apply emplyee for level upgrade
   @Author Jayshri Kolase
  * @Date August 25, 2023
*/
  onCheckboxChange(row: any, columnField: string): void {
    // Find the selected workstation for this checkbox
    const workstationMatch = this.worksatationData.find(item => item.workstation === columnField);
    if (workstationMatch) {
      const empId = row.empId;
      const isSelected = this.isSelected(empId, columnField); // Check if already selected

      if (isSelected) {
        // If it's already selected, deselect it
        this.deselectCheckbox(empId, columnField);
      } else {
        // If it's not selected, select it
        this.selectCheckbox(row, columnField);
      }
    }
  }

  isSelected(empId: string, columnField: string): boolean {
    return this.selectedWorkstation[empId] === columnField;
  }

  deselectCheckbox(empId: string, columnField: string): void {
    const checkboxId = `checkbox${empId}_${columnField}`;
    const checkboxElement = document.getElementById(checkboxId) as HTMLInputElement;
    if (checkboxElement) {
      checkboxElement.checked = false;
    }

    // Remove the entry from selectedEntries
    const existingIndex = this.selectedEntries.findIndex(entry =>
      entry.empId === empId
    );
    if (existingIndex !== -1) {
      this.selectedEntries.splice(existingIndex, 1);
    }

    // Update the selected workstation
    this.selectedWorkstation[empId] = undefined;
    console.log(this.selectedEntries)
  }
  selectCheckbox(row: any, columnField: string): void {
    const empId = row.empId;
    const workstationMatch = this.worksatationData.find(item => item.workstation === columnField);

    if (workstationMatch) {
      // Add the new entry
      this.selectedEntries.push({
        empId: empId,
        currentSkillLevelId: row.empLevelId,
        desiredSkillLevelId: workstationMatch.reqSkillLevelId,
        workstationId: workstationMatch.id,
      });

      // Update the UI to deselect the previous checkbox
      const previousWorkstation = this.selectedWorkstation[empId];
      if (previousWorkstation) {
        this.deselectCheckbox(empId, previousWorkstation);
      }

      // Update the selected workstation for this employee
      this.selectedWorkstation[empId] = columnField;

      // Update the UI to select the new checkbox
      const newCheckboxId = `checkbox${empId}_${columnField}`;
      const newCheckboxElement = document.getElementById(newCheckboxId) as HTMLInputElement;
      if (newCheckboxElement) {
        newCheckboxElement.checked = true;
      }
      console.log(this.selectedEntries)
    }
  }

  /* Submit or Save OJT Single Registartion
    @Author Jayshri Kolase
   * @Date August 25, 2023
 */
  submitOJTRegi(status) {
    this.isSubmitSpinner = true;
    console.log(status);
    if (!this.selectedEntries == null || this.selectedEntries.length === 0) {
      this.alertService.error('Please select an employee for level upgrade.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no entries are selected
    }
    if (!this.ojtPlan.trainer) {
      this.alertService.error('Please select trainer.');
      this.isSubmitSpinner = false;
      return; // Exit the function if no date is selected
    }
    let deptId;
    for (let i = 0; i < this.cellList.length; i++) {
      if (this.ojtPlan.cell[0].id == this.cellList[i].lineId) {
        deptId = this.cellList[i].deptId;
      }
    }
    if (this.ojtPlan.branch != null && this.ojtPlan.cell != null && this.ojtPlan.trainer != undefined && this.selectedEntries != null && this.selectedEntries.length > 0) {
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
        "createdBy": this.userDet.empId,
        "updatedBy": this.userDet.empId,
        "ojtRegisList": this.selectedEntries
      };
      console.log(reqData);
      this.apiService.submitOJTRegi('apis/sm/ojtRegistration', reqData).subscribe((response: any) => {
        console.log(response);
        this.isSubmitSpinner = false;
        if (response.result) {
          this.alertService.success("OJT registartion completed..");
          this.modalService.dismissAll();
        }
        else {
          if (response.statuCode == 100) {
            this.alertService.error(response.reason);
          } else {
            this.alertService.error(response.reason);
          }
        }
      })
    }

  }
  closeModal() {
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
        this.getDeptList(this.ojtPlan.branchId[0]);
        this.getLineList(this.ojtPlan.branchId[0]);
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
   Get Combined Header
    Author: Mahesh W
    Date : 21 Aug 2023
 */
  getCombinedHeader() {
    const empNameColumn = this.empDetailsList.columns.find(column => column.field === 'empName');
    return `${empNameColumn.heading}`;
  }
  isObjectEmpty(objectName) {
    return Object.keys(objectName).length == 0
  }
  shouldShowCheckbox(columnField: string): boolean {
    // Add your logic here to determine whether a checkbox should be displayed
    // For example, you can check if the columnField is a specific field that requires a checkbox
    return columnField === 'fieldName1' || columnField === 'fieldName2';
  }

  closeChildComponent() {
    // Any necessary logic to close the child component
    this.childComponentClosed.emit();
  }
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "trainer" || fieldToSort === "dept" || fieldToSort === "plant" || fieldToSort === "cell") {
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
      this.getLineList(data)
      // this.getWorkstationList();
      // this.getUserTypeList();
      // this.getSkillMatrixEmpList();
    } else {
      this.cellList = [];
      this.selectedEntries = [];
    }
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

}
