import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SkillMatrixService } from '../../skill-matrix.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/theme/shared/components';
import Swal from 'sweetalert2';
import { error } from 'console';

@Component({
  selector: 'app-add-ojt-check-sheet',
  templateUrl: './add-ojt-check-sheet.component.html',
  styleUrls: ['./add-ojt-check-sheet.component.scss']
})
export class AddOjtCheckSheetComponent implements OnInit {
  branchAccessList: any = [];
  SingleBranchDropdownSettings: IDropdownSettings = {};
  SingleLevelDropdownSettings: IDropdownSettings = {};
  SingleDropdownSettings: IDropdownSettings = {};
  SingleParaDropdownSettings: IDropdownSettings = {};
  userDet: any = {};
  checksheetForm: FormGroup;
  copyChecksheetForm: FormGroup;
  isCheckSheetAvailable: boolean = false;
  setChecksheetId: any = {};
  editChecksheet: boolean = false;
  isSelectedParaType:any;
  constant: any = {};
  // level: any;
  checksheetDetails: any = {};
  LevelList: any = [];
  savedChecksheetDet: any = {};
  checksheetPointList: any = [];
  editChecksheetData: any = {};
  parameterTypeList: any = [];
  dataSpinner: any = [];
  actionLoader: boolean = false;
  branchId: any[];
  reportBodyCell: any = {};
  branch: any[];
  cellList: any[];
  deptId: any;
  departmentList: any = [];
  workforceList: any = [];
  lineId: any = [];
  searchDet: any = {};
  levelList: any = [];
  noOfDays: any;
  filteredChecksheetDetails: any;
  checksheetList: any = [];
  copyChecksheetDetails: any = {};
  selectedchecksheet: any = {};
  isCopyChecksheetDetailsAvail: boolean = false;
  paraTypeList: any = [];
  isAddButtonClicked: boolean = false;
  isNumberParameter: boolean = false;
  isTextParameter: boolean = false;
  isCyclePlan: boolean = false;
  isDateTimeParameter: boolean = false;
  isModelParameter: boolean = false;
  isGapParameter: boolean = false;
  disableReferModel: boolean = false;
  parameterDet: any = {
    rec: []
  };

  addLoader: boolean = false;
  submitLoader: boolean = false
  isDirty: boolean = false;

  constructor(
    private modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private apiService: SkillMatrixService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef
  ) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  dayNumForm(): FormGroup {
    return this.fb.group({
      dayNo: '1',
      pointList: this.fb.array([])
    })
  }

  pointsForm(): FormGroup {
    return this.fb.group({
      itemName: new FormControl('', Validators.required),
      reference: new FormControl(''),//Validators.required
      id: new FormControl('0'),
      action: new FormControl('ADD')
    })
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    // console.log(this.userDet)
    this.getLocalStorageChecksheetData();
    this.checksheetForm = this.fb.group({
      plant: new FormControl('', Validators.required),
      deptId: new FormControl('', Validators.required),
      cellLineId: new FormControl('', Validators.required),
      workstationId: new FormControl('', Validators.required),
      level: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      noOfDays: new FormControl('', [Validators.required, this.onPointInputChange])
    });
    this.copyChecksheetForm = this.fb.group({
      plant: new FormControl('', Validators.required),
      deptId: new FormControl('', Validators.required),
      cellLineId: new FormControl('', Validators.required),
      workstationId: new FormControl('', Validators.required),
      level: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      noOfDays: new FormControl('', [Validators.required, this.onPointInputChange]),
      parameterTypeId: new FormControl(''),
      parameter: new FormControl(''),
      cycleValue: new FormControl(''),
      daysList: this.fb.array([])

    });
    this.getLevelList();
    this.getBranchAccessList();
    this.SingleBranchDropdownSettings = {
      singleSelection: true,
      idField: 'branchId',
      textField: 'branchName',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.SingleLevelDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'levelName',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.SingleParaDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'typeName',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    // this.getChecksheetPointList();
  }

  daysList(): FormArray {
    return this.copyChecksheetForm.get("daysList") as FormArray;
  }
  mainTab: any = 1;
  isSetMainTab = function (tabId) {
    return this.mainTab === tabId;
  };

  setMainTab(tabId) {
    this.mainTab = tabId;
    if (this.mainTab == 1) {

    } else if (this.mainTab == 2) {
      this.getParameterTypeList();
      this.getCopyParameterTypeList();
    }
  };

  mainChecksheetTab: any = 3;
  isSetChecksheetTab = function (tabId) {
    return this.mainChecksheetTab === tabId;
  }
  setcheckSheetTab(tabId) {
    this.mainChecksheetTab = tabId;
    if (this.mainTab == 3) {

    } else if (this.mainTab == 4) {

    }
  };

  /* Validation for checksheet point(is value not a 0 and not a negative and not a greater than no. of days)
  @Author Jayshri Kolase
  *@Date Sep 1, 2023
*/
  onPointInputChange = (control: any) => {
    const value = control.value;
    if (value === 0) {
      return { zeroValue: true };
    }
    if (value < 0) {
      return { negativeValue: true };
    }
    return null;
  };
  /* Get Local Storage Checksheet Data
     @Author Jayshri Kolase
   * @Date August 18, 2023
  */
  getLocalStorageChecksheetData() {
    if (localStorage.getItem('setChecksheetId')) {
      this.setChecksheetId = JSON.parse(localStorage.getItem('setChecksheetId'));
      if (this.setChecksheetId.isEditable && this.setChecksheetId.checkSheetId == 0) {
        this.editChecksheet = false;
        this.checksheetDetails = {};
      } else {
        console.log(this.setChecksheetId)
        if (this.setChecksheetId.checkSheetId == undefined && this.setChecksheetId.checkSheetId != 0) {
          this.setChecksheetId.checkSheetId = this.setChecksheetId.id;
        }
        this.getChecksheetDetails(this.setChecksheetId);
      }
      // this.getChecksheetDetails(this.setChecksheetId);
    } else {
    }
  }

  /* get skill level list
   @Author Jayshri Kolase
  * @Date August 18, 2023
*/
  getLevelList() {
    this.apiService.getLevelList('apis/sm/getLevelList').subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.LevelList = response.dataList;
        } else {
          this.LevelList = [];
        }
      }
    })
  }
  /* Get Branch Access List
  @Author Jayshri Kolase
 * @Date August 18, 2023
*/
  getBranchAccessList() {
    this.apiService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((response: any) => {
      // console.log(response);
      if (response.result) {
        this.branchAccessList = response.branchAccessList;
        console.log(this.branchAccessList)
        if (this.branchAccessList.length > 0) {
          // this.filterData.selectedBranch = [this.branchAccessList[0]]; // Set the default value
        }
        else {
          this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
        }
      }
      else {
        // this.branchAccessList = [];
        this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
        console.log(this.branchAccessList)
      }
    })
  }
  /* Get Checksheet Details
  @Author Jayshri Kolase
 * @Date August 18, 2023
*/
  getChecksheetDetails(data) {
    console.log(data);
    this.apiService.getChecksheetDetails('apis/sm/getChecksheetDetails/' + data.checkSheetId).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        localStorage.removeItem('setChecksheetId');
        /* Point */
        if (response.data.hasOwnProperty('pointList') && (response.data.pointList != null && response.data.pointList.length > 0)) {
          var resGroups = response.data.pointList.reduce(function (obj, item) {
            obj[item.dayNo] = obj[item.dayNo] || [];
            obj[item.dayNo].push(item);
            return obj;
          }, {});
          response.data.groupPointList = Object.keys(resGroups)
            .map(function (key) {
              return {
                dayNo: key,
                pointList: resGroups[key],
              };
            });
        }
        /* Parameter */
        if (response.data.parameterList != null && response.data.parameterList.length > 0) {
          for (let index = 0; index < response.data.parameterList.length; index++) {
            response.data.parameterList[index].isActionTaken = false;
            response.data.parameterList[index].editableParameter = response.data.parameterList[index].parameter;
            response.data.parameterList[index].editableCycleValue = response.data.parameterList[index].cycleValue;
          }
        }
        this.checksheetDetails = response.data;
        console.log(this.checksheetDetails);
        this.checksheetDetails.checkSheetId = this.checksheetDetails.id;
        this.isCheckSheetAvailable = true;
        localStorage.setItem('setChecksheetId', JSON.stringify(this.checksheetDetails));
        this.checksheetForm.controls['plant'].setValue([{ branchId: this.checksheetDetails.branchId, branchName: this.checksheetDetails.branchName }]);
        this.checksheetForm.controls['deptId'].setValue([{ id: this.checksheetDetails.deptId, name: this.checksheetDetails.deptName }]);
        this.checksheetForm.controls['cellLineId'].setValue([{ id: this.checksheetDetails.lineId, name: this.checksheetDetails.lineName }]);
        this.checksheetForm.controls['workstationId'].setValue([{ id: this.checksheetDetails.workstationId, name: this.checksheetDetails.workstation }]);
        this.checksheetForm.controls['level'].setValue([{ id: this.checksheetDetails.skillLevelId, levelName: this.checksheetDetails.skillLevel }]);
        this.checksheetForm.controls['title'].setValue(this.checksheetDetails.title);
        this.checksheetForm.controls['noOfDays'].setValue(this.checksheetDetails.noOfDays);
      }
    })
  }
  /* Save or Update Checksheet Details
 @Author Jayshri Kolase
* @Date August 18, 2023
*/
  saveChecksheetDetails(checksheetForm: any) {
    console.log(checksheetForm)
    if (checksheetForm.invalid) {
      Object.keys(checksheetForm.controls).forEach(key => {
        checksheetForm.controls[key].markAsDirty();
      });
      return;
    }
    this.getLocalStorageChecksheetData();
    if (this.setChecksheetId.checkSheetId == undefined || this.setChecksheetId.checkSheetId == "" || this.setChecksheetId.checkSheetId == 0) {
      let checksheetData = {
        branchId: checksheetForm.value.plant[0].branchId,
        deptId: checksheetForm.value.deptId[0].id,
        lineId: checksheetForm.value.cellLineId[0].id,
        workstationId: checksheetForm.value.workstationId[0].id,
        noOfDays: checksheetForm.value.noOfDays,
        skillLvlId: checksheetForm.value.level[0].id,
        title: checksheetForm.value.title
      }
      this.apiService.saveChecksheetDetails('apis/sm/addChecksheet', checksheetData).subscribe((response: any) => {
        if (response.result) {
          this.savedChecksheetDet = response.responseData;
          localStorage.removeItem('setChecksheetId');
          localStorage.removeItem('savedChecksheetDet');
          this.savedChecksheetDet.isEditable = true;
          this.savedChecksheetDet.isEditPoint = false;
          this.savedChecksheetDet.isEditParameter = false;
          localStorage.setItem('setChecksheetId', JSON.stringify(this.savedChecksheetDet));
          this.alertService.success("OJT checksheet details added successfully.")
          this.isCheckSheetAvailable = true;
          this.getLocalStorageChecksheetData();
        } else {
          if (response.statusCode == 100) {
            this.alertService.error(response.reason);
          } else {
            this.alertService.error('Error occurred while submitting data. Please try again');
          }
        }
      })
    } else {
      let checksheetData = {
        branchId: checksheetForm.value.plant[0].branchId,
        deptId: checksheetForm.value.deptId[0].id,
        lineId: checksheetForm.value.cellLineId[0].id,
        workstationId: checksheetForm.value.workstationId[0].id,
        noOfDays: checksheetForm.value.noOfDays,
        skillLvlId: checksheetForm.value.level[0].id,
        title: checksheetForm.value.title,
        updatedBy: this.userDet.empId,
        checkSheetId: this.checksheetDetails.checkSheetId
      }
      this.apiService.updateChecksheet('apis/sm/updateChecksheet', checksheetData).subscribe((response: any) => {
        if (response.result) {
          localStorage.removeItem('savedChecksheetDet');
          this.savedChecksheetDet.isEditable = true;
          this.savedChecksheetDet.isEditPoint = false;
          this.savedChecksheetDet.isEditParameter = false;
          this.savedChecksheetDet.checkSheetId = this.setChecksheetId.checkSheetId;
          localStorage.setItem('setChecksheetId', JSON.stringify(this.savedChecksheetDet));
          this.getLocalStorageChecksheetData();
          this.alertService.success("OJT checksheet details updated successfully.")
          this.isCheckSheetAvailable = true;
        } else {
          if (response.statusCode == 100) {
            this.alertService.error(response.reason);
          } else {
            this.alertService.error('Error occurred while submitting data. Please try again');
          }
        }
      })
    }
  }
  /* Open Add Checksheet Points Modal
   @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  openAddChecksheetPointsModal(modal) {
    localStorage.removeItem('selectedPointsDet');
    localStorage.removeItem('selectedParameterDet');
    let data: any = {};
    data = this.checksheetDetails;
    console.log(this.checksheetDetails);

    data.isEditPoint = false;
    data.checkSheetId = this.checksheetDetails.id;
    localStorage.setItem('setChecksheetId', JSON.stringify(data));
    var modalRef = this.modalService.open(modal, {
      windowClass: 'right',
    });
    modalRef.result.then(
      (result) => {
        // if (result === "success") {
        this.getChecksheetDetails(data);
        // }
      },
      (reason) => {
        this.getChecksheetDetails(data);
      }
    );
  }
  /* Open Update Point Modal
   @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  updatePoint(modal, data) {
    data.isEditPoint = true;
    data.checkSheetId = this.checksheetDetails.id
    localStorage.setItem('selectedPointsDet', JSON.stringify(data));
    let Obj = JSON.parse(localStorage.getItem('setChecksheetId'));
    var modalRef = this.modalService.open(modal, {
      windowClass: 'right',
    });
    modalRef.result.then(
      (result) => {
        // if (result === "success") {
        this.getChecksheetDetails(Obj);
        // }
      },
      (reason) => {
        this.getChecksheetDetails(Obj);
      }
    );
  }

  isActionTakenInParam() {
    let flag = false;
    if (this.checksheetDetails.parameterList != null && this.checksheetDetails.parameterList.length > 0) {
      for (let index = 0; index < this.checksheetDetails.parameterList.length; index++) {
        if (this.checksheetDetails.parameterList[index].isActionTaken) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }
  getParameterTypeList() {
    if (this.parameterTypeList != null && this.parameterTypeList.length > 0) {
      if (this.checksheetDetails.parameterList != null && this.checksheetDetails.parameterList.length > 0) {
        for (let index = 0; index < this.checksheetDetails.parameterList.length; index++) {
          this.checksheetDetails.parameterList[index].paramObj = this.parameterTypeList != null && this.parameterTypeList.filter(x => x.id == this.checksheetDetails.parameterList[index].parameterTypeId).length > 0 ? this.parameterTypeList.filter(x => x.id == this.checksheetDetails.parameterList[index].parameterTypeId)[0] : '';
        }
      }
      return;
    }
    this.apiService.getParameterTypeList('apis/sm/getParameterTypeList').subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.parameterTypeList = response.dataList;
          if (this.checksheetDetails.parameterList != null && this.checksheetDetails.parameterList.length > 0) {
            for (let index = 0; index < this.checksheetDetails.parameterList.length; index++) {
              this.checksheetDetails.parameterList[index].paramObj = this.parameterTypeList != null && this.parameterTypeList.filter(x => x.id == this.checksheetDetails.parameterList[index].parameterTypeId).length > 0 ? this.parameterTypeList.filter(x => x.id == this.checksheetDetails.parameterList[index].parameterTypeId)[0] : '';
            }
          }
        } else {
          this.parameterTypeList = [];
        }
      } else {
        this.parameterTypeList = [];
      }
    })
  }
  /* Open Update Parameter Modal
   @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  updateParameter(data, type) {
    if (type == '') {
      this.updateParameterData(data);
    } else {
      let flag = (type == 'cancel') ? false : true;
      data.isActionTaken = flag;
      data.editableCycleValue = data.cycleValue;
      data.editableParameter = data.parameter;
    }
  }
  updateParameterData(data) {
    this.actionLoader = true;
    if (!data.editableParameter) {
      this.alertService.error('Please enter paramater');
      this.actionLoader = false;
      return
    }
    if (data.paramObj.typeCaption == 'CyclePlan' && !data.editableCycleValue) {
      this.alertService.error('Please enter cycle value');
      this.actionLoader = false;
      return
    }
    let req: any = {
      "updatedBy": this.userDet.empId,
      "parameter": data.editableParameter,
      "checkSheetId": this.checksheetDetails.checkSheetId,
      "parameterTypeId": data.parameterTypeId,
      "parameterId": data.id
    }
    if (data.paramObj.typeCaption == 'CyclePlan') {
      req.cycleValue = data.editableCycleValue;
    }
    this.apiService.updateChecksheetParameter('apis/sm/updateChecksheetParameter', req).subscribe((response: any) => {
      this.actionLoader = false;
      if (response.result) {
        // this.alertService.success("OJT checksheet parameter updated successfully.");
        this.alertService.success("OJT verification parameter updated successfully.");
        this.getChecksheetDetails(this.checksheetDetails);
      } else {
        if (response.statusCode == 100) {
          this.alertService.error(response.reason);
        } else {
          this.alertService.error('Error occurred while updating data. Please try again');
        }
      }
    }, (error: any) => {
      this.actionLoader = false;
    })
  }
  /* Delete Checksheet Point
    @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  deleteChecksheetPoint(data) {
    // console.log(data)
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this point ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7044cd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes remove it',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let reqbody = {
          "checkSheetId": this.checksheetDetails.checkSheetId,
          "dayNo": data.dayNo
        }
        this.apiService.deleteChecksheetPoint('apis/sm/deleteChecksheetPoint', reqbody).subscribe((data: any) => {
          if (data.result) {
            // this.alertService.success("Checksheet point removed sucessfully");
            this.alertService.success("Key point removed sucessfully");
            this.getChecksheetDetails(this.setChecksheetId);
          } else {
            if (data.statusCode == 100) {
              this.alertService.error(data.reason);
            } else {
              this.alertService.error('Error occurred while removing data. Please try again');
            }
          }
        })
      } else {
      }
    });
  }
  /* Delete Checksheet Parameter
   @Author Jayshri Kolase
   * @Date August 18, 2023
  */
  deleteChecksheetParameter(data) {
    console.log(data)
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this parameter?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7044cd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes remove it',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let reqbody = {
          "parameterId": data.id
        }
        this.apiService.deleteChecksheetPoint('apis/sm/deleteChecksheetParameter', reqbody).subscribe((data: any) => {
          if (data.result) {
            // this.alertService.success("Checksheet parameter removed successfully");
            this.alertService.success("Verification parameter removed successfully");
            this.getChecksheetDetails(this.setChecksheetId);
          } else {
            if (data.statusCode == 100) {
              this.alertService.error(data.reason);
            } else {
              this.alertService.error('Error occurred while removing data. Please try again');
            }
          }
        })
      } else {
      }
    });
  }

  getSortFunction(array, fieldToSort) {
    // console.log(array, fieldToSort);
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "dept" || fieldToSort === "level") {
        array.sort(function (a, b) {
          var nameA = a.branchName ? a.branchName.toUpperCase() : "";
          var nameB = b.branchName ? b.branchName.toUpperCase() : "";
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
  /* get Department List
     @Author Simran 
     * @Date 27/10/2023
    */
  getDepartmentList(branch) {
    this.apiService
      .getDepartmentByBranch("getdepartmentlistbybranchid/" + branch)
      .subscribe((res: any) => {
        if (res.result) {
          if (res.deptList != null && res.deptList.length > 0) {
            /* Use For Add Screen */
            this.departmentList = this.setArray(
              res.deptList,
              "deptId",
              "deptName"
            );
            this.departmentList = this.sortFunction(this.departmentList, "deptName");
            this.searchDet.dept = [this.departmentList[0]];
            if (!this.searchDet.addForm) {
              /* Use For Filter */
              this.searchDet.departmentList = this.setArray(
                res.deptList,
                "deptId",
                "deptName"
              );
              // this.searchDet.deptIds = this.searchDet.departmentList;
            }

          } else {

            this.searchDet.departmentList = [];
          }
        } else {

          this.searchDet.departmentList = [];
        }
      });
  }


  /* get Cell/Line List
  @Author Simran 
  * @Date 27/10/2023
 */
  getCellList(ev) {
    console.log(ev);
    this.reportBodyCell = {
      branchId: this.branchId,
      deptId: ev,
    };
    this.apiService
      .getCellList("apis/sm/getCellList", this.reportBodyCell)
      .subscribe((res: any) => {
        console.log(res);
        if (res.result) {
          if (res.dataList != null && res.dataList.length > 0) {
            /* Use For Add Screen */
            this.cellList = this.setArray(res.dataList, "lineId", "lineName");
            console.log(this.cellList);
            this.cellList = this.sortFunction(this.cellList, "lineName");
            this.searchDet.dept = [this.cellList[0]];
            /* Use For Filter */
            this.searchDet.cellList = this.setArray(
              res.dataList,
              "lineId",
              "lineName"
            );

          } else {
            this.cellList = [];
            this.searchDet.cellList = [];
          }
        } else {
          // this.cellList = [];
          // this.searchDet.cellList = [];
        }
        // this.branchId = [this.searchDet.cellList[0]];
        // // this.getDepartmentList(this.branchId[0]);
      });
  }

  /* get Workstation List List
   @Author Simran 
   * @Date 27/10/2023
  */
  getWorkforceList(data) {
    // this.workforceList = [];
    // this.listLoader = true;
    console.log(data);
    let req: any = {
      branchId: this.branchId,
      orgId: this.userDet.organization.orgId,
      deptId: this.deptId,
      lineIds: [data]
    };
    console.log(req);
    // if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
    //   req.deptId = this.searchDet.dept[0].id;
    // }
    // if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
    //   req.lineId = this.searchDet.cell[0].id;
    // }
    this.apiService
      .getWorkforceDeploymentData("apis/sm/getWorkstationList", req)
      .subscribe((res: any) => {
        if (res.result) {
          console.log(res);
          if (res.dataList != null && res.dataList.length > 0) {
            this.workforceList = this.setArray(res.dataList, "id", "workstation");
            this.workforceList = this.sortFunction(this.workforceList, "workstation");
            this.searchDet.workforceList = [this.workforceList[0]];
            console.log(this.workforceList);
          } else {
            this.workforceList = [];
          }
        } else {
          this.workforceList = [];
        }
      });
  }
  /*
   Common function for set an array for dropdown
   Author: Simran
   Date : 27/10/2023
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
    Author: Simran
    Date : 27/10/2023
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
  Single Select Dropdown onChange function
  Author: Mahesh W
  Date : 21 Aug 2023
*/
  onChange(ev: any, type) {
    if (ev) {
      console.log(ev);

      if (type == "dept") {
        this.cellList = [];

        this.deptId = ev.id;
        this.searchDet.lineId = [];
        this.resetFormField(this.checksheetForm, "cellLineId");
        this.resetFormField(this.checksheetForm, "workstationId");
        this.getCellList(this.deptId);

        // this.resetFormField(this.checksheetForm, 'lineId')
      }
      if (type == "plant") {
        console.log(ev)
        this.branchId = ev.branchId;
        this.searchDet.deptIds = [];
        this.resetFormField(this.checksheetForm, "deptId");
        this.resetFormField(this.checksheetForm, "cellLineId");
        this.resetFormField(this.checksheetForm, "workstationId");
        this.getDepartmentList(this.branchId);
        if (this.searchDet.addForm) {
          console.log("inside");
          // this.resetFormField(this.checksheetForm, "deptId");
        }
      }
      if (type == "cell") {
        console.log(ev);
        this.lineId = ev.id;
        this.searchDet.work = [];
        this.resetFormField(this.checksheetForm, "workstationId");
        this.getWorkforceList(this.lineId);
      }
    } else {
      if (type == "plant") {
        if (this.searchDet) {
          this.departmentList = [];
          this.searchDet.departmentList = [];
          this.cellList = [];
          this.searchDet.cellList = [];
          // this.resetFormField(this.filterData, "deptIds");
          // this.resetFormField(this.stakeholderForm, "deptId");
          // this.resetFormField(this.stakeholderForm, 'lineId');
          this.searchDet.lineId = [];
        } else {
          // this.resetFormField(this.stakeholderForm, "empId");
        }
      } else if (type == 'dept') {
        // this.resetFormField(this.stakeholderForm, 'lineId');
        this.cellList = [];
        this.searchDet.cellList = [];
        this.searchDet.lineId = [];
      }
    }
  }
  resetFormField(form, keyName) {
    Object.keys(form.controls).forEach((key) => {
      if (key == keyName) {
        form.get(keyName).reset();
        form.get(keyName).markAsPristine();
        form.get(keyName).markAsUntouched();
      }
    });
  }
  updateLevelOptions(workstationId: number) {
    console.log(workstationId)
    this.checksheetForm.get('level').setValue(''); // Clear the selection
    const filteredLevels = this.levelList.filter(level => level.workstationId === workstationId);
    this.levelList = [...filteredLevels];
  }

  /*
  Single Select Dropdown onChange function
  Author: Mahesh W
  Date : 21 Aug 2023
*/
  onPlantChange(ev: any, type) {
    if (ev) {
      console.log(ev);
      if (type == "dept") {
        this.cellList = [];
        this.copyChecksheetDetails.deptId = ev.id;
        this.deptId = ev.id;
        this.searchDet.lineId = [];
        this.copyChecksheetDetails.level = [];
        this.resetFormField(this.copyChecksheetForm, "level");
        this.checksheetList = [];
        this.resetFormField(this.copyChecksheetForm, "cellLineId");
        this.resetFormField(this.copyChecksheetForm, "workstationId");
        this.getCellList(this.deptId);
        // this.getChecksheetList();
      }
      if (type == "plant") {
        console.log(ev)
        this.isDirty = true;
        this.copyChecksheetDetails.branchId = ev.branchId;
        this.branchId = ev.branchId;
        this.searchDet.deptIds = [];
        this.copyChecksheetDetails.level = [];
        this.resetFormField(this.copyChecksheetForm, "level");
        this.checksheetList = [];
        this.resetFormField(this.copyChecksheetForm, "deptId");
        this.resetFormField(this.copyChecksheetForm, "cellLineId");
        this.resetFormField(this.copyChecksheetForm, "workstationId");
        this.getDepartmentList(this.branchId);
        this.checksheetList = [];
        // this.getChecksheetList();
        if (this.searchDet.addForm) {
          console.log("inside");
        }
      }
      if (type == "cell") {
        console.log(ev);
        this.copyChecksheetDetails.lineId = ev.id;
        this.lineId = ev.id;
        this.searchDet.work = [];
        this.copyChecksheetDetails.level = [];
        this.resetFormField(this.copyChecksheetForm, "level");
        this.checksheetList = [];
        this.resetFormField(this.copyChecksheetForm, "workstationId");
        this.getWorkforceList(this.lineId);
        this.checksheetList = [];
        // this.getChecksheetList();
      }
      if (type == "level") {
        console.log(ev);
        this.copyChecksheetDetails.skillLevelId = ev.id;
        this.getChecksheetList();
      }
    } else {
      if (type == "plant") {
        if (this.searchDet) {
          this.departmentList = [];
          this.searchDet.departmentList = [];
          this.cellList = [];
          this.searchDet.cellList = [];
          this.searchDet.lineId = [];
          this.checksheetList = [];
        } else {
        }
      } else if (type == 'dept') {
        this.cellList = [];
        this.searchDet.cellList = [];
        this.searchDet.lineId = [];
        this.checksheetList = [];
      }
    }
  }

  /* Get Checksheet List
 @Author - Jayshri Kolase
 @Date January 30, 2024 */
  getChecksheetList() {
    this.checksheetList = [];
    let reqData: any = {
      createdBy: this.userDet.empId,
      orgId: this.userDet.organization.orgId,
      updatedBy: this.userDet.empId
    };
    if (this.copyChecksheetDetails.branchId != undefined && this.copyChecksheetDetails.branchId != '') {
      reqData.branchId = this.copyChecksheetDetails.branchId;
    }
    if (this.copyChecksheetDetails.deptId != undefined && this.copyChecksheetDetails.deptId != '') {
      reqData.deptId = this.copyChecksheetDetails.deptId;
    }
    if (this.copyChecksheetDetails.lineId != undefined && this.copyChecksheetDetails.lineId != '') {
      reqData.lineId = this.copyChecksheetDetails.lineId;
    }
    if (this.copyChecksheetDetails.skillLevelId != undefined && this.copyChecksheetDetails.skillLevelId != '') {
      reqData.skillLvlId = this.copyChecksheetDetails.skillLevelId;
    }
    console.log(reqData);

    this.apiService.getChecksheetList('apis/sm/getChecksheetList', reqData).subscribe((response: any) => {
      if (response.result) {
        this.checksheetList = response.dataList;
        var filteredChecksheetList = this.checksheetList.filter(item => {
          return item.title !== this.searchDet.title;
        });
        if (filteredChecksheetList != null && filteredChecksheetList.length > 0) {
          if (this.checksheetList.length === 1 && this.checksheetList[0].title === this.searchDet.title) {
            this.checksheetList = [];
          } else {
            filteredChecksheetList = this.sortFunction(filteredChecksheetList, "title");
            this.checksheetList = filteredChecksheetList;
          }
        } else {
          this.checksheetList = [];
          this.searchDet.checksheetList = [];
        }
      } else {
        if (response.statusCode == 100) {
        } else {
        }
      }
    })
  }

  /* Get Checksheet Details Onchange function
  @Author - Jayshri Kolase
  @Date Feb 20, 2024 */
  getSelectedChecksheetDetails(checkSheetId: any): void {
    this.isCopyChecksheetDetailsAvail = false;
    // Clear parameterDet.rec before populating with new data
    this.parameterDet.rec = [];

    // Clear daysList before populating with new data
    const daysList = this.daysList();
    if (daysList) {
      daysList.clear();
    }
    this.apiService.getChecksheetDetails('apis/sm/getChecksheetDetails/' + checkSheetId).subscribe((response: any) => {
      if (response.result) {
        if (response.data.hasOwnProperty('pointList') && (response.data.pointList != null && response.data.pointList.length > 0)) {
          var resGroups = response.data.pointList.reduce(function (obj, item) {
            obj[item.dayNo] = obj[item.dayNo] || [];
            obj[item.dayNo].push(item);
            return obj;
          }, {});
          response.data.groupPointList = Object.keys(resGroups)
            .map(function (key) {
              return {
                dayNo: key,
                pointList: resGroups[key],
              };
            });
        }
        if (response.data.groupPointList != null && response.data.groupPointList.length > 0) {
          for (let index = 0; index < response.data.groupPointList.length; index++) {
            if (index < response.data.groupPointList.length) {
              this.addcopyDaysRow(index);
            }
            this.daysList().controls[index].get('dayNo').setValue(response.data.groupPointList[index].dayNo);
            if (response.data.groupPointList[index].pointList != null && response.data.groupPointList[index].pointList.length > 0) {
              for (let x = 0; x < response.data.groupPointList[index].pointList.length; x++) {
                // Add a new FormGroup to pointList
                this.pointList(index).push(this.pointsForm());

                // Now you can set values for the newly added FormGroup
                const lastIndex = this.pointList(index).length - 1;
                this.pointList(index).controls[lastIndex].get('id').setValue('0');
                this.pointList(index).controls[lastIndex].get('action').setValue('ADD');
                this.pointList(index).controls[lastIndex].get('itemName').setValue(response.data.groupPointList[index].pointList[x].itemName);
                this.pointList(index).controls[lastIndex].get('reference').setValue(response.data.groupPointList[index].pointList[x].reference);
              }
            }
          }
        }
        if (response.data.parameterList != null && response.data.parameterList.length > 0) {
          this.checksheetDetails.copyCheckSheetId = response.data.id;
          for (let index = 0; index < response.data.parameterList.length; index++) {
            let obj: any = Object.assign({}, { parameterData: { typeName: response.data.parameterList[index].parameterType, typeCaption: response.data.parameterList[index].parameterType, id: response.data.parameterList[index].parameterTypeId }, parameterTypeId: response.data.parameterList[index].parameterTypeId, parameter: response.data.parameterList[index].parameter });
            const hasCyclePlanParameter = response.data.parameterList[index].parameterType === "cyclePlan";
            obj.cycleValue = response.data.parameterList[index].cycleValue
            if (obj.parameterData.typeName === "cyclePlan") {
              obj.cycleValue = response.data.parameterList[index].cycleValue;
            }
            this.parameterDet.rec.push(obj);
            // }
          }
        }
        this.filteredChecksheetDetails = response.data;
        if (this.filteredChecksheetDetails.groupPointList || this.filteredChecksheetDetails.parameterList) {
          this.isCopyChecksheetDetailsAvail = true;
        }
        this.setMainTab(1);
      }
    })
  }

  setChecksheet(data: any) {
    console.log(data)
    this.selectedchecksheet.id = data.id;
    this.getSelectedChecksheetDetails(this.selectedchecksheet.id);
  }

  /* Get Parameter Type List for copy functionality
  @Author Jayshri Kolase
  * @Date Feb 03, 2024
*/
  getCopyParameterTypeList() {
    this.apiService.getParameterTypeList('apis/sm/getParameterTypeList').subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.paraTypeList = response.dataList;
          this.copyChecksheetDetails.parameterType = [this.paraTypeList[0]]
          console.log(this.copyChecksheetDetails.parameterType);
          if (this.copyChecksheetDetails.parameterType[0].typeName == 'Text') {
            this.copyChecksheetForm.get('parameter').setValidators([Validators.required]);
            if (this.copyChecksheetForm.get('cycleValue')) {
              this.copyChecksheetForm.get('cycleValue').clearValidators();
            }
            this.isAddButtonClicked = false;
            this.isNumberParameter = false;
            this.isTextParameter = true;
            this.isDateTimeParameter = false;
            this.isModelParameter = false;
            this.isGapParameter = false;
          }

        } else {
          this.paraTypeList = [];
        }
      } else {
        this.paraTypeList = [];
      }
    })
  }
  /* get Parameter Sort Function copy Checksheet Parameter
   @Author Jayshri Kolase
   * @Date Feb 03, 2024
 */
  getParaSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "paraType") {
        array.sort(function (a, b) {
          var nameA = a.typeName ? a.typeName.toUpperCase() : "";
          var nameB = b.typeName ? b.typeName.toUpperCase() : "";
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

  /* to change input fields in parameterTye
  @Author Jayshri Kolase
  * @Date Feb 03, 2024
*/
  onParameterTypeSelect(event: any) {
    // this.copyChecksheetForm.get('parameter').reset();
    console.log(event);
    this.disableReferModel = true;
    const selectedParameterType = event.typeName;
    this.isSelectedParaType = event.typeName;


    if (selectedParameterType === 'Text') {
      this.copyChecksheetForm.get('parameter').setValidators([Validators.required]);
      this.copyChecksheetForm.get('cycleValue').clearValidators();
      this.isAddButtonClicked = false;
      this.isNumberParameter = false;
      this.isTextParameter = true;
      this.isCyclePlan = false;
      this.isDateTimeParameter = false;
      this.isModelParameter = false;
      this.isGapParameter = false;
    } else if (selectedParameterType === 'Number') {
      this.copyChecksheetForm.get('parameter').setValidators([Validators.required]);
      this.copyChecksheetForm.get('cycleValue').clearValidators();
      this.isAddButtonClicked = false;
      this.isTextParameter = false;
      this.isNumberParameter = true;
      this.isDateTimeParameter = false;
      this.isModelParameter = false;
      this.isGapParameter = false;
    } else if (selectedParameterType === 'cyclePlan') {
      this.copyChecksheetForm.get('cycleValue').setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.isTextParameter = false;
      this.isCyclePlan = true;
      this.isAddButtonClicked = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = false;
      this.isModelParameter = false;
      this.isGapParameter = false;
    } else if (selectedParameterType === 'Datetime') {
      this.copyChecksheetForm.get('parameter').setValidators([Validators.required]);
      this.copyChecksheetForm.get('cycleValue').clearValidators();
      this.isTextParameter = false;
      this.isAddButtonClicked = false;
      this.isGapParameter = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = true;
      this.isModelParameter = false;

    } else if (selectedParameterType === 'Gap') {
      this.copyChecksheetForm.get('cycleValue').clearValidators();
      this.isAddButtonClicked = false;
      this.isTextParameter = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = false;
      this.isModelParameter = false;
      this.isGapParameter = true;
    } else if (selectedParameterType === 'Model') {
      this.copyChecksheetForm.get('cycleValue').clearValidators();
      this.isAddButtonClicked = false;
      this.isTextParameter = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = false;
      this.isGapParameter = false;
      this.isModelParameter = true;
    } else {
      // Handle other parameter types if necessary
      this.isTextParameter = false;
      this.isAddButtonClicked = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = false;
      this.isGapParameter = false;
      this.isModelParameter = false;
      this.disableReferModel = false;
    }

    this.copyChecksheetForm.get('parameter').updateValueAndValidity();
    this.copyChecksheetForm.get('cycleValue').updateValueAndValidity();
  }

  /* Save or Update copy Checksheet Parameter
   @Author Jayshri Kolase
   * @Date Feb 03, 2024
  */
  addChecksheetParameter() {
    console.log("form");
    this.isAddButtonClicked = true;
    this.addLoader = true;

    if (this.copyChecksheetDetails.parameterType == null || this.copyChecksheetDetails.parameterType.length == 0) {
      this.addLoader = false;
      return;
    }
    if (this.copyChecksheetDetails.parameter == undefined || this.copyChecksheetDetails.parameter == '') {
      this.addLoader = false;
      return;
    }
    let obj: any = Object.assign({}, { parameterData: this.copyChecksheetDetails.parameterType[0], parameterTypeId: this.copyChecksheetDetails.parameterType[0].id, parameter: this.copyChecksheetDetails.parameter });
    const hasCyclePlanParameter = this.copyChecksheetDetails.parameterType.some(
      param => param.parameterType === "cyclePlan"
    );
    obj.cycleValue = this.copyChecksheetDetails.cycleValue
    if (obj.parameterData.typeName === "cyclePlan") {
      obj.cycleValue = this.copyChecksheetDetails.cycleValue;
    }
    if (hasCyclePlanParameter && obj.parameterData.typeName === "cyclePlan") {
      this.alertService.error('Only one cycle plan can be added for this checksheet.');
      this.addLoader = false;
    } else {
      this.parameterDet.rec.push(obj);
      this.addLoader = false;
    }
  }
  /* remove or Update copy Checksheet Parameter
 @Author Jayshri Kolase
 * @Date Feb 03, 2024
*/
  removeParameter(paramIndex) {
    this.parameterDet.rec.splice(paramIndex, 1);
  }
  /* on Parameter Input Change copy Checksheet Parameter
 @Author Jayshri Kolase
 * @Date Feb 03, 2024
*/
  onParameterInputChange(event: any, type: any) {
    let newValue = event.target.value;
    if (type === 'Number') {
      newValue = newValue.replace(/[^0-9]/g, "");
      newValue = newValue.replace(/^0+/g, "");
      if (newValue === "" || parseInt(newValue) < 1) {
        newValue = " ";
      }
    }
    else if (type === 'Text') {
      newValue = newValue.replace(/[^a-zA-Z0-9]/g, "");
    }
    event.target.value = newValue;
  }


  pointList(dayNumIndex: number): FormArray {
    return this.daysList().at(dayNumIndex).get("pointList") as FormArray;
  }
  addPointsRow(dayNumIndex: number) {
    this.pointList(dayNumIndex).push(this.pointsForm());
  }

  addDaysRow(dayNumIndex: number) {
    this.daysList().push(this.fb.group({
      dayNo: dayNumIndex + 1,
      pointList: this.fb.array([])
    }));
    this.addPointsRow(dayNumIndex);
    const totalDays = this.copyChecksheetDetails.noOfDays;
    const currentDays = this.daysList().length;

    if (currentDays >= totalDays) {
      this.alertService.error('Cannot add more days. Maximum number of days reached.');
      return;
    }
  }
  addcopyDaysRow(dayNumIndex: number) {
    this.daysList().push(this.fb.group({
      dayNo: dayNumIndex + 1,
      pointList: this.fb.array([])
    }));
    // this.addPointsRow(dayNumIndex);
    const totalDays = this.copyChecksheetDetails.noOfDays;
    const currentDays = this.daysList().length;

    if (currentDays >= totalDays) {
      this.alertService.error('Cannot add more days. Maximum number of days reached.');
      return;
    }
  }

  removePointRow(empNumIndex: number, pointIndex: number) {
    this.pointList(empNumIndex).removeAt(pointIndex);
  }

  updateDayField() {
    if (this.daysList().controls != null && this.daysList().controls.length > 0) {
      for (let index = 0; index < this.daysList().controls.length; index++) {
        this.daysList().at(index).get("dayNo").setValue(index + 1);
      }
    }
  }

  removeDayNumRow(dayNumIndex: number) {
    this.daysList().removeAt(dayNumIndex);
    this.updateDayField();
  }

  saveCopyChecksheetDetails(form) {
    // this.submitLoader = true
    this.isDirty = true;
    // Create a new form group containing only the desired fields
    const requiredFields = this.fb.group({
      plant: form.controls['plant'],
      deptId: form.controls['deptId'],
      cellLineId: form.controls['cellLineId'],
      workstationId: form.controls['workstationId'],
      level: form.controls['level'],
      title: form.controls['title'],
      noOfDays: form.controls['noOfDays']
    });

    // Check if the required fields are valid
    if (requiredFields.invalid) {
      Object.keys(requiredFields.controls).forEach(key => {
        requiredFields.controls[key].markAsDirty();
      });
      return;
    }
    console.log(form);
    if (form.value.daysList.length > form.value.noOfDays) {
      this.alertService.error('Cannot add more days. Maximum number of days reached.');
      return;
    }
    if (form.value.daysList.length < form.value.noOfDays) {
      this.alertService.error('It is mandatory to add checksheet points for all days.');
      this.submitLoader = false;
      return;
    }

    const req = {
      "branchId": parseInt(form.value.plant[0].branchId),
      "deptId": parseInt(form.value.deptId[0].id),
      "lineId": parseInt(form.value.cellLineId[0].id),
      "workstationId": parseInt(form.value.workstationId[0].id),
      "noOfDays": form.value.noOfDays,
      "skillLvlId": parseInt(form.value.level[0].id),
      "title": form.value.title,
      "updatedBy": this.userDet.empId,
      "createdBy": this.userDet.empId,
      "daysList": form.value.daysList,
      "parameterList": this.parameterDet.rec
    }
    this.apiService.saveCopyChecksheet('apis/sm/saveCopyChecksheet', req).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        // this.alertService.success("OJT checksheet details added successfully.");
        this.parameterDet.rec = [];
        const daysList = this.daysList();
        if (daysList) {
          daysList.clear();
        }
        localStorage.removeItem('setChecksheetId');
        localStorage.removeItem('savedChecksheetDet');
        this.savedChecksheetDet.isEditable = true;
        this.savedChecksheetDet.isEditPoint = false;
        this.savedChecksheetDet.isEditParameter = false;
        localStorage.setItem('setChecksheetId', JSON.stringify(response.responseData));
        this.alertService.success("OJT checksheet details added successfully.")
        this.isCheckSheetAvailable = true;
        this.getLocalStorageChecksheetData();
        this.mainChecksheetTab = 3;
        // this.getChecksheetDetails(response.responseData);
      } else {
        if (response.statusCode == 100) {
          this.alertService.error(response.reason);
        } else {
          this.alertService.error('Error occurred while submitting data. Please try again');
        }
      }
    })

  }
}
