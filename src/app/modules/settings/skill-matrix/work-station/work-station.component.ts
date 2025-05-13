import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SkillMatrixService } from '../skill-matrix.service';
import { AlertService } from 'src/app/theme/shared/components';
import Swal from 'sweetalert2';
import { Sort } from '@angular/material/sort';


@Component({
  selector: 'app-work-station',
  templateUrl: './work-station.component.html',
  styleUrls: ['./work-station.component.scss']
})
export class WorkStationComponent implements OnInit {
  formdata: FormGroup;
  filterData: FormGroup;
  filterFormData: FormGroup;
  searchDet: any = {};
  filterFlag: boolean = false;
  multipleDropdownSettings: IDropdownSettings = {};
  array: any = {};
  selected: any = {}
  skillLevelList: any = [];
  userDet: any = {};
  branchAccessList: any = [];
  deptList: any = [];
  workstationData: any = [];
  mappingStationData: any = [];
  formSubmitLoader: boolean = false;
  SingleDropdownSettings: IDropdownSettings = {};
  submitAttempted: boolean = false;
  workstationDet: any = {};
  selctedWorkstationId: Number = 0;
  dataSpinner: any = [];
  selectedBranch: any = {};
  branchId: any;
  listLoading: boolean = false;
  sorting: Sort;
  activeEmployeesObject: any = {};
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0
  }

  departmentList: any[];
  submitSpinner: boolean = false;
  isEditing: boolean = false;
  deparmentList: any = [];
  cellLevelList: any = [];
  selectedCell: any;
  isSubmit: boolean = false;
  modalTital: String = "";
  selectedTab: any;
  isVisible: boolean = false;
  workstationMappingForm: FormGroup;
  filteredWorkstationList: any; 
  workstationList: any[] = []; // For workstation mapping 
  @ViewChild('workstationMappingTemplate') workstationMappingTemplate: TemplateRef<any>;

  constructor(
    private skillMatrixService: SkillMatrixService,
    modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private alertService: AlertService) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    console.log(this.userDet)
    this.getBranchAccessList();
    this.getWorkstationList();
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.getLevelList();
    this.multipleDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
    this.formdata = this.fb.group({
      branch: new FormControl('', Validators.required),
      dept: new FormControl('', Validators.required),
      cell: new FormControl('', Validators.required),
      workstation: new FormControl('', Validators.required),
      machineIndex: ['', [Validators.required, this.floatValidator()]],
      machineCount: ['', [Validators.required, this.floatAndGreaterThanZeroValidator()]],
      reqWorkforce: ['', [Validators.required, this.floatValidator()]],
      reqSkillLvl: new FormControl('', Validators.required)

    });
    this.workstationMappingForm = this.fb.group({
      branch: new FormControl('', Validators.required),
      masterWorkstation: new FormControl('', Validators.required),
      mappingWorkstations: new FormControl('', Validators.required),
    });
    this.filterFormData = this.fb.group({
      branch: new FormControl('', Validators.required),
      dept: new FormControl(''),
      cell: new FormControl(''),
    });

    this.selectTab('workStation');
    this.getMappingList();
  }

  /* gets Branch access list on employee
    @Author Jayshri Kolase
   * @Date August 18, 2023
  */
  getBranchAccessList() {
    this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId)
      .subscribe((res: any) => {
        console.log(res);
        if (res.result) {
          if (res.branchAccessList != null && res.branchAccessList.length > 0) {
            this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
            this.selectedBranch.branched = [this.branchAccessList[0]];


          } else {
            this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
          }
        } else {
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }

      });
  }
  /* get skill level list
   @Author Jayshri Kolase
  * @Date August 18, 2023
*/
  getLevelList() {
    this.skillMatrixService.getLevelList('apis/sm/getLevelList').subscribe((response: any) => {
      console.log(response)
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.skillLevelList = this.setArray(response.dataList, 'id', 'levelName');
        } else {
          this.skillLevelList = []
        }
      } else {
        this.skillLevelList = []
      }
    })
  }

  /* get department list on branch selection
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  getDeptList(branchId) {
    console.log(branchId)
    this.skillMatrixService.getdepartmentlistbybranchid('getdepartmentlistbybranchid/' + branchId).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        if (response.deptList != null && response.deptList.length > 0) {
          console.log(response);

          this.deparmentList = response.deptList;
          /* Use For Add Screen */
          this.deptList = this.setArray(response.deptList, 'deptId', 'deptName');
          /* Use For Filter */
          this.searchDet.deptList = this.setArray(response.deptList, 'deptId', 'deptName');
          // if (this.deptList != null && this.deptList.length > 0) {
          // this.selectedBranch.dept = this.searchDet.deptList;
          // }

          if (this.workstationData == null || this.workstationData.length == 0) {
            this.getWorkstationList();
          }
        }

        else {
          this.deptList = [];
        }
      }
      else {
        this.deptList = [];
      }
    })
  }
  /* open filter modal popup
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  filterModalOpen(FilterModal) {
    // this.searchDet.deptList = [];
    // this.cellLevelList = [];
    this.clearPagination();
    console.log("In filter")
    if (!this.filterFlag) {
      // this.filterData.reset();
    }
    // this.getInterventions();
    this.modalService.open(FilterModal, {
      windowClass: 'filterPopup',
    });
  }
  /* Close filter modal popup
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  closeFilterPopup() {
    this.submitAttempted = false;
    this.selectedBranch.branch = []
    // this.deparmentList = [];
    this.selectedBranch.dept = [];
    // this.cellLevelList = [];
    this.selectedBranch.cell = [];
    this.selected.cell = []
    this.modalService.dismissAll();
  }


  /* get workstation list on branch selection and department selection
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  getWorkstationList() {
    this.listLoading = true;
    this.submitSpinner = true;
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }

    let getReq: any = {
      "orgId": this.userDet.organization.orgId,
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
    }
    if (this.getIDsArray(this.selectedBranch.cell) != null && this.getIDsArray(this.selectedBranch.cell).length > 0) {
      for (let i = 0; i < this.getIDsArray(this.selectedBranch.cell).length; i++) {
        getReq.lineIds = this.getIDsArray(this.selectedBranch.cell)
      }
    }
    if (this.selectedBranch.branch != null && this.selectedBranch.branch.length > 0) {
      for (let i = 0; i < this.selectedBranch.branch.length; i++) {
        getReq.branchId = this.selectedBranch.branch[0].id;

      }
    }
    else{
      getReq.branchId = this.userDet.branch.branchId; 
    }
    if (this.selectedBranch.dept != null && this.selectedBranch.dept.length > 0) {
      for (let i = 0; i < this.selectedBranch.dept.length; i++) {
        getReq.deptId = this.selectedBranch.dept[0].id
      }
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        getReq.colName = this.sorting.active,
          getReq.orderType = this.sorting.direction.toUpperCase();

      }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      getReq.search = this.searchDet.searchInput;
    }
    console.log(getReq);
    this.skillMatrixService.getWorkstationList('apis/sm/getWorkstationList', getReq).subscribe((response: any) => {
      console.log(response);
      this.submitSpinner = false;
      this.listLoading = false;
      if (response.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(this.workstationData.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.workstationData = response.dataList.filter(item => item.isActive === true);
          this.staticPagination.listLength = this.workstationData.length;
          this.modalService.dismissAll();
        } else {
          this.workstationData = [];
          this.staticPagination.listLength = this.workstationData.length;
        }
      }
      else {
        this.workstationData = [];
        // this.modalService.dismissAll();
        this.staticPagination.listLength = this.workstationData.length;
      }
    }, (error: any) => {
      this.workstationData = [];
      this.listLoading = false;

    })
  }
  greaterThanZeroValidator(control: AbstractControl): ValidationErrors | null {
    const value = Number(control.value);
    return value > 0 ? null : { invalidInput: true };
  }
  
  /* add and update workstation details
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  addOrUpdateWorkstation(formdata) {
    console.log(formdata);
    this.isSubmit = true;
    this.submitSpinner = true;
    if (formdata.invalid) {
      Object.keys(formdata.controls).forEach(key => {
        formdata.controls[key].markAsDirty();
      });
      this.submitSpinner = false;
      return;
    }
    console.log(formdata);

    // const formControl = this.formdata.get('machineCount');
    // if (formControl) {
    //   const currentValue = formControl.value || '';
    //   const sanitizedValue = currentValue.replace(/\D/g, '');
    //   const validValue = Math.max(Number(sanitizedValue || 0), 1).toString();
    //   formControl.setValue(validValue, { emitEvent: false });
    // }
    if (formdata.status == "VALID" && this.selctedWorkstationId == 0) {
      let addReq = {

        "workstation": formdata.value.workstation,
        "machineIndex": parseFloat(formdata.value.machineIndex),
        "machineCount": parseFloat(formdata.value.machineCount),
        "requiredWorkforce": parseFloat(formdata.value.reqWorkforce),
        "isActive": "true",
        "deptId": formdata.value.dept[0].id,
        "lineId": formdata.value.cell[0].id,
        "branchId": formdata.value.branch[0].id,
        "reqSkillLevelId": formdata.value.reqSkillLvl[0].id
      }
      console.log(addReq)

      this.skillMatrixService.saveWorkstation('apis/sm/saveWorkstation', addReq).subscribe((response: any) => {
        console.log(response);
        this.submitSpinner = false;
        if (response.result) {
          this.alertService.success("Workstation saved successfully.")
          this.resetData();
          this.modalService.dismissAll();
          this.getWorkstationList();
        }
        else {
          if (response.statusCode == 400) {
            this.alertService.error(response.reason);
          } else {
            this.alertService.error('Error occurred while adding data. Please try again');
          }
        }
      })
    }
    else {
      let updateReq = {
        "id": this.selctedWorkstationId,
        "workstation": formdata.value.workstation,
        "machineIndex": formdata.value.machineIndex,
        "machineCount": formdata.value.machineCount,
        "requiredWorkforce": parseFloat(formdata.value.reqWorkforce),
        "isActive": true,
        "deptId": formdata.value.dept[0].id,
        "lineId": formdata.value.cell[0].id,
        "branchId": formdata.value.branch[0].id,
        "reqSkillLevelId": formdata.value.reqSkillLvl[0].id
      }

      console.log(updateReq)

      this.skillMatrixService.saveWorkstation('apis/sm/updateWorkstation', updateReq).subscribe((response: any) => {
        console.log(response);
        this.submitSpinner = false;
        if (response.result) {
          this.alertService.success("Workstation details updated successfully.")
          this.modalService.dismissAll();
          this.resetData();
          this.getWorkstationList();
        }
        else {
          if (response.statusCode == 100) {
            this.alertService.error(response.reason);
          } else {
            this.alertService.error('Error occurred while updating data. Please try again');
          }
        }
      })
    }

  }
  /* reset worksation add or update details form data
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  resetData() {
    this.resetFormField(this.formdata, 'branch');
    this.resetFormField(this.formdata, 'dept');
    this.resetFormField(this.formdata, 'workstation');
    this.resetFormField(this.formdata, 'machineIndex');
    this.resetFormField(this.formdata, 'machineCount');
    this.resetFormField(this.formdata, 'reqWorkforce');
    this.resetFormField(this.formdata, 'reqSkillLvl');
    this.formdata.reset();
  }

  /* 
    Reset Form function
    Author: Saurabh s
    Date :18 oct 2023
  */
  resetFormField(form, keyName) {
    if (keyName != "") {
      Object.keys(form.controls).forEach((key) => {
        if (key == keyName) {
          form.get(keyName).reset();
          form.get(keyName).markAsPristine();
          form.get(keyName).markAsUntouched();
        }
      });
    } else {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).reset();
        form.get(key).markAsPristine();
        form.get(key).markAsUntouched();
      });
    }
  }
  /* delete or deactivate workstation details
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  deactivateWorkstationDetails(data) {
    console.log(data)
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this workstation ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7044cd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Remove It',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      this.dataSpinner[data] = true;
      if (result.isConfirmed) {
        let reqbody = {
          "id": data.id
        }
        this.skillMatrixService.deleteWorkstationDetails('apis/sm/deActivateWorkstation', reqbody).subscribe((data: any) => {
          this.dataSpinner[data.id] = false;
          if (data.result) {
            this.alertService.success("Workstation removed successfully");
            this.getWorkstationList();
          }
          else {
            if (data.statusCode == 100) {
              this.alertService.error(data.reason);
            } else {
              this.alertService.error('Error occurred while removing data. Please try again');
            }
          }
        })
      } else {
        this.dataSpinner[data.id] = false;
      }
    });
  }

  /* Common function For Searching  
  @Author Saurabh salunke
* @Date August 31, 2023*/
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (!ev) {
      this.getWorkstationList();
    } else {
      this.getWorkstationList();
    }
  }


  /* To clear pagination  
  @Author Saurabh salunke
* @Date Oct 12, 2023*/
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
  /* Change function
    @Author saurabh salunke
   * @Date Oct 4, 2023
 */
  onChangeAll(ev: any, type) {
    if (ev) {
      console.log('Select All action');
    } else {
      console.log('Unselect All action');
    }
  }

  /* Change function
     @Author saurabh salunke
    * @Date Oct 4, 2023
  */
  onChange(ev, type) {
    console.log(ev, type);
    if (ev) {

      if (type == 'dept') {
        console.log(ev.id, type);
        const deptId = ev.id;
        // this.formdata.get('cell').setValue('', { emitEvent: false });
        this.resetFormField(this.formdata, 'cell')
        this.selectedBranch.cell = [];
        this.getCellList(deptId);

      }
      if (type == 'Plant') {
        this.filterFormData.get('dept')?.setValue(null);
        this.filterFormData.get('dept')?.markAsUntouched();
        this.filterFormData.get('dept')?.markAsPristine();
        this.formdata.get('dept')?.setValue(null);
        this.formdata.get('dept')?.markAsUntouched();
        this.formdata.get('dept')?.markAsPristine();
        this.selectedBranch.cell = [];
        this.branchId = ev.id;

        this.getDeptList(this.branchId);
      }
    } else {
      if (type == "Plant") {
        this.selectedBranch.dept = [];
        this.selectedBranch.cell = [];
        this.resetFormField(this.formdata, 'dept');
        this.deparmentList = [];
        this.searchDet.deptList = [];
        this.resetFormField(this.formdata, 'cell');
        this.cellLevelList = [];
      } else if (type == 'dept') {

        this.resetFormField(this.formdata, 'cell');
        this.cellLevelList = [];
        this.selectedBranch.cell = [];
      }
    }
  }
  /* 
  Remove Filter
   @Author Saurabh salunke
* @Date August 31, 2023
*/
  removeFilter() {
    this.filterFormData.reset();
    // this.submitAttempted = false;
    this.clearPagination();
    this.selectedBranch.branch = null;
    this.selectedBranch.branch = [];
    this.selectedBranch.dept = [];
    this.selectedBranch.cell = [];
    this.searchDet.filterFlag = false;
    this.searchDet.filterPopupOpen = false;
    this.workstationData = [];
    // this.getDeptList(this.branchAccessList[0].id)
    this.getWorkstationList();
    this.filterFormData.reset();
  }

  /* show add or update workstation modal popup
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  modalOpen(modal, popupClass) {
    this.isEditing = false;
    this.selctedWorkstationId = 0;
    this.resetData();    
    this.workstationMappingForm.reset();
    // this.deparmentList = [];
    // this.cellLevelList = [];
    this.modalTital = this.isVisible ? "Add Workstation" : "Add Workstation Mapping";
    const screenWidth = window.innerWidth;
    let modifiedPopupClass = popupClass;

    if (screenWidth <= 1024) {
      // Apply different styles for screens up to 1024px width
      modifiedPopupClass += ' custom-modal-1024';
    }
    this.modalService.open(modal, {
      windowClass: modifiedPopupClass
    });
  }
  /* set selected workstation details for update workstation details
       @Author Jayshri Kolase
      * @Date August 18, 2023
    */
  updateWorkstationForm(modal, data) {
    this.isEditing = true;
    console.log(data);
    this.modalTital = "Update Workstation"

    this.selctedWorkstationId = data.id;
    // const isBranchAndDeptSelected = data.branchId && data.deptId;
    this.formdata.patchValue({
      branch: [{ id: data.branchId, name: data.branchName }],
      dept: [{ id: data.deptId, name: data.deptName }],
      cell: [{ id: data.lineId, name: data.lineName }],
      workstation: data.workstation,
      machineIndex: data.machineIndex,
      machineCount: data.machineCount,
      reqWorkforce: data.requiredWorkforce,
      reqSkillLvl: [{ id: data.reqSkillLevelId, name: data.levelName }]
    });
    this.modalService.open(modal, {
      windowClass: 'top'
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

  /* Sorts workstation table data
       @Author Saurabh salunke
      * @Date August 29, 2023
    */
  sortData(sort: Sort) {
    this.sorting = sort;
    console.log(this.sorting)
    this.getWorkstationList()
  }

  /*
  Common function For get Ids from array
  @Author Saurabh salunke
  * @Date August 31, 2023
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
      Apply filter function
      @Author Saurabh salunke
    * @Date August 29, 2023
*/
  submitFilterForm(form) {
    this.submitAttempted = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      return;
    }

    this.searchDet.filterFlag = true;
    this.searchDet.filterPopupOpen = false;
    this.getWorkstationList();
    this.modalService.dismissAll();
  }
  /*
       Apply filter function
       @Author Saurabh salunke
     * @Date August 29, 2023
 */
  loadMore(ev) {

    this.workstationData = [];
    this.listLoading = true;
    this.formdata.get('dept').reset();
    this.formdata.get('dept').markAsUntouched();
    this.staticPagination = ev;
    this.getWorkstationList();
  }


  /* get cell/line list
   @Author Saurabh salunke
     * @Date 5 oct 2023
 */

  getCellList(deptId) {

    const getReq: any = {}
    if (this.branchId) {
      getReq.branchId = this.branchId;
    }
    if (deptId) {
      getReq.deptId = deptId
    }
    if (this.selectedBranch.branch != null && this.selectedBranch.branch.length > 0) {
      for (let i = 0; i < this.selectedBranch.branch.length; i++) {
        getReq.branchId = this.selectedBranch.branch[0].id;

      }
    }
    this.skillMatrixService.getLineList('apis/sm/getCellList', getReq).subscribe((response: any) => {
      console.log(response)
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.cellLevelList = this.setArray(response.dataList, 'lineId', 'lineName');

        } else {
          this.cellLevelList = [];
        }
      } else {
        this.cellLevelList = [];
      }
    })
  }


  /* To apply validation
   @Author Saurabh salunke
     * @Date 5 oct 2023
 */

  numericValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const numericPattern = /^[0-9]+$/;

      if (control.value && !control.value.match(numericPattern)) {
        return { 'invalidInput': true };
      }

      return null;
    };
  }

  /* To apply validation to select float value
  @Author Saurabh salunke
    * @Date 5 oct 2023
*/
  floatValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const floatValue = parseFloat(control.value);

      if (control.value && isNaN(floatValue)) {
        return { 'invalidInput': true };
      }

      return null;
    };
  }
  floatAndGreaterThanZeroValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null; 
      }

      const floatValue = parseFloat(value);
      if (isNaN(floatValue)) {
        return { invalidInput: true }; 
      }

      if (floatValue <= 0) {
        return { lessThanOrEqualToZero: true }; 
      }

      return null;
    };
  }
  /* To add sorting in dropdown
@Author Aniket
  * @Date 20 oct 2023
*/
  getSortFunction(array, fieldToSort) {
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

  selectTab(tab) {
    this.selectedTab = tab;
    this.isVisible = tab === 'workStation' ? true : false;
    this.staticPagination = {
      total: 0,
      page: 1,
      maxSize: 5,
      itemsPerPage: 10,
      totalPages: 0,
      listLength: 0
    }
  }

  onChangeMappingPlant(event) {
    if (event) {
      this.workstationMappingForm.patchValue({
        masterWorkstation: '',
        mappingWorkstations: ''
      });

      this.getListForMapping(event.id);

    } else {
      this.workstationList = [];
      this.filteredWorkstationList = [];
      this.workstationMappingForm.patchValue({
        masterWorkstation: '',
        mappingWorkstations: ''
      });
    }
  }
  
  /* Get workstation list for mapping */
  getListForMapping(branchId) {
    this.submitSpinner = true;
    
    let getReq: any = {
      "orgId": this.userDet.organization.orgId,
      "branchId": branchId || this.userDet.branch.branchId
    }
    
    this.skillMatrixService.getWorkstationList('apis/sm/getWorkstationList', getReq).subscribe((response: any) => {
      this.submitSpinner = false;
      
      if (response.result && response.dataList != null && response.dataList.length > 0) {
        this.workstationList = response.dataList.filter(item => item.isActive === true);
        this.filteredWorkstationList = this.setArray(this.workstationList, 'id', 'workstation');
      } else {
        this.workstationList = [];
        this.filteredWorkstationList = [];
      }
    }, (error: any) => {
      this.submitSpinner = false;
      this.workstationList = [];
      this.filteredWorkstationList = [];
    });
  }
  
  onMasterWorkstationSelect(event) {
    this.updateFilteredWorkstationList();
  }
  
  onMasterWorkstationDeselect() {
    this.updateFilteredWorkstationList();
  }
  
  updateFilteredWorkstationList() {
    const selectedMaster = this.workstationMappingForm.get('masterWorkstation').value;

    if (selectedMaster && selectedMaster.length > 0) {
      // Clear the mappingWorkstations field
      this.workstationMappingForm.get('mappingWorkstations').reset();

      // Filter out the selected master workstation
      this.filteredWorkstationList = this.workstationList.filter(item => 
        item.id !== selectedMaster[0].id
      );
    } else {
      this.filteredWorkstationList = [...this.workstationList];
    }
  }

  getMappingList() {
    this.listLoading = true;
    this.submitSpinner = true;
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }

    let getReq: any = {
      "orgId": this.userDet.organization.orgId,
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
    }
    if (this.getIDsArray(this.selectedBranch.cell) != null && this.getIDsArray(this.selectedBranch.cell).length > 0) {
      for (let i = 0; i < this.getIDsArray(this.selectedBranch.cell).length; i++) {
        getReq.lineIds = this.getIDsArray(this.selectedBranch.cell)
      }
    }
    if (this.selectedBranch.branch != null && this.selectedBranch.branch.length > 0) {
      for (let i = 0; i < this.selectedBranch.branch.length; i++) {
        getReq.branchId = this.selectedBranch.branch[0].id;

      }
    }
    else{
      getReq.branchId = this.userDet.branch.branchId; 
    }
    if (this.selectedBranch.dept != null && this.selectedBranch.dept.length > 0) {
      for (let i = 0; i < this.selectedBranch.dept.length; i++) {
        getReq.deptId = this.selectedBranch.dept[0].id
      }
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        getReq.colName = this.sorting.active,
          getReq.orderType = this.sorting.direction.toUpperCase();

      }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      getReq.search = this.searchDet.searchInput;
    } 
    this.skillMatrixService.getWorkstationMappingList('apis/sm/workstation-mapping/get-all', getReq).subscribe((response: any) => {
      this.submitSpinner = false;
      this.listLoading = false;
      if (response.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(this.mappingStationData.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.mappingStationData = response.dataList.filter(item => item.isActive === true);
          this.staticPagination.listLength = this.mappingStationData.length;
          this.modalService.dismissAll();
        } else {
          this.mappingStationData = [];
          this.staticPagination.listLength = this.mappingStationData.length;
        }
      }
      else {
        this.mappingStationData = [];
        // this.modalService.dismissAll();
        this.staticPagination.listLength = this.mappingStationData.length;
      }
    }, (error: any) => {
      this.mappingStationData = [];
      this.listLoading = false;

    })
  }
  
  submitWorkstationMapping(form) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.get(key).markAsTouched();
      });
      return;
    }
    
    this.submitSpinner = true;
    
    // Get the selected master workstation to extract deptId and lineId
    const selectedMasterWorkstationId = form.value.masterWorkstation[0].id;
    
    // Find the corresponding entry in workstationList to get deptId and lineId
    const masterWorkstation = this.workstationList.find(item => item.id === selectedMasterWorkstationId);
    
    const mappingData = {
      orgId: this.userDet.organization.orgId,
      branchId: form.value.branch[0].id,
      parentWorkstationId: selectedMasterWorkstationId,
      childWorkstationId: this.getIDsArray(form.value.mappingWorkstations),
      isActive: true,
      deptId: masterWorkstation ? masterWorkstation.deptId : null,
      lineId: masterWorkstation ? masterWorkstation.lineId : null
    };
    
    this.skillMatrixService.saveWorkstationMapping('apis/sm/workstation-mapping/save', mappingData).subscribe(
      (response: any) => {
        this.submitSpinner = false;
        if (response.result) {
          this.alertService.success("Workstation mapping saved successfully.");
          this.workstationMappingForm.reset();
          this.modalService.dismissAll();
        } else {
          this.alertService.error('Error occurred while saving mapping. Please try again');
        }
      },
      (error: any) => {
        this.submitSpinner = false;
        this.alertService.error('Error occurred while saving mapping. Please try again');
      }
    );
  }
  
}
