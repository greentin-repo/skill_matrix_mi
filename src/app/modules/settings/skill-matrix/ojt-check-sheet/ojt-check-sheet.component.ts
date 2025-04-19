import { Component, Directive, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AddOjtCheckSheetModule } from './add-ojt-check-sheet/add-ojt-check-sheet.module';
import { SkillMatrixService } from '../skill-matrix.service';
import { AlertService } from 'src/app/theme/shared/components';
import Swal from 'sweetalert2';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-ojt-check-sheet',
  templateUrl: './ojt-check-sheet.component.html',
  styleUrls: ['./ojt-check-sheet.component.scss']
})
export class OjtCheckSheetComponent implements OnInit {
  searchDet: any = {};
  filterFormData: FormGroup;
  filterData: any = {}
  SingleBranchDropdownSettings: IDropdownSettings = {};
  SingleLevelDropdownSettings: IDropdownSettings = {};
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  branchAccessList: any = [];
  checksheetList: any = [];
  LevelList: any = [];
  assessmentForm: FormGroup;
  userDet: any = {};
  submitSpinner: boolean = false;
  listLoading: boolean = false;
  sorting: any;
  submitAttempted: boolean = false;
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0
  }
  branch: any[];
  cellList: any[];
  deptId: any;
  departmentList: any = [];
  workforceList: any = [];
  lineId: any = [];
  dataSpinner: any = [];
  branchId: any[];
  reportBodyCell: any = {};

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private skillMatrixService: SkillMatrixService,
    private fb: FormBuilder,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    console.log(this.userDet)
    this.getLevelList();
    this.getBranchAccessList();
    // this.filterList();
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
    this.multipleDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
    this.filterFormData = this.fb.group({
      branch: new FormControl('', Validators.required),
      lineId: new FormControl(''),
      workstationId: new FormControl(''),
      deptId: new FormControl(''),
      skillLvl: new FormControl('')
    });
    this.filterList('');
  }
  /* get skill level list
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  getLevelList() {
    this.skillMatrixService.getLevelList('apis/sm/getLevelList').subscribe((response: any) => {
      console.log(response)
      if (response.result) {
        this.LevelList = response.dataList;
        if (this.LevelList.length > 0) {
          // this.filterData.selectedLvl = [this.LevelList[0]]; // Set the default value
        }
      }
    })
  }

  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.searchDet.filterFlag) {
      this.filterList('filter');
    } else {
      this.filterList('');
    }
  }

  /* Open filter modal 
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  filterModalOpen(FilterModal) {
    console.log("In filter")
    this.clearPagination();
    if (!this.searchDet.filterFlag) {
      // this.filterData.reset();
    }
    // this.getInterventions();
    this.modalService.open(FilterModal, {
      windowClass: 'filterPopup',
    });
  }
  /* Get Branch Access List on orgId and empId
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  getBranchAccessList() {
    this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        this.branchAccessList = response.branchAccessList;
        console.log(this.branchAccessList)
        if (this.branchAccessList.length > 0) {
          // this.filterData.selectedBranch = [this.branchAccessList[0]]; // Set the default value
        }
        this.filterList('');
      }
      else {
        // this.branchAccessList = [];
        this.branchAccessList = [{ branchId: this.userDet.branch.branchId, branchName: this.userDet.branch.name }];
      }
    })
  }
  /* Popup save or update workstation modal from top
      @Author Jayshri Kolase
     * @Date August 18, 2023
   */
  modalOpen(modal, popupClass) {
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }
  /* redirect to OJT checksheet details page
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  goOJTChecksheetDetailPage(url: any, data: any, flag: boolean) {
    if (data == '') {
      var data: any = {
        isEditable: true,
        isEditPoint: false,
        isEditParameter: false,
        checkSheetId: 0
      }
    } else {
      var data: any = {
        isEditable: true,
        isEditPoint: false,
        isEditParameter: false,
        checkSheetId: data.id,
      }
    }
    data.isEditable = flag;
    var tmpData = Object.assign({}, data, { 'tmpPagination': this.staticPagination });
    if (url) {
      if (tmpData != undefined) {
        localStorage.removeItem('setChecksheetId');
        localStorage.setItem('setChecksheetId', JSON.stringify(tmpData));
      } else {
        localStorage.removeItem('setChecksheetId');
      }
      this.router.navigateByUrl(url);
    }
  }
  /* Get Checksheet List
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  filterList(searchfilter) {
    this.listLoading = true;
    this.submitSpinner = true;
    // if (this.staticPagination.offset > 0 && this.filterFlag == false && searchfilter == 'filter') {
    //   this.clearPagination();
    // }
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    }
    else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    console.log(this.filterData.slectedBranch)
    let reqData: any = {
      orgId: this.userDet.organization.orgId,
      offset: this.staticPagination.offset,
      limit: this.staticPagination.itemsPerPage,
      updatedBy: this.userDet.empId,
      createdBy: this.userDet.empId
    };
    if (this.sorting) {
      if (this.sorting.direction != "") {
        reqData.colName = this.sorting.active;
        reqData.orderType = this.sorting.direction.toUpperCase();
      }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      reqData.search = this.searchDet.searchInput;
    }
    if (searchfilter == 'filter') {
      if (this.filterFormData.invalid) {
        Object.keys(this.filterFormData.controls).forEach(key => {
          this.filterFormData.controls[key].markAsDirty();
        });
        return;
      }
      if (this.filterData.selectedBranch != null && this.filterData.selectedBranch.length > 0) {
        for (let i = 0; i < this.filterData.selectedBranch.length; i++) {
          reqData.branchId = this.filterData.selectedBranch[i].branchId
        }
      }
      if (this.filterData.selectedLvl != null && this.filterData.selectedLvl.length > 0) {
        for (let i = 0; i < this.filterData.selectedLvl.length; i++) {
          reqData.skillLvlId = this.filterData.selectedLvl[i].id
        }
      }
      if (this.getIDsArray(this.searchDet.workstation) != null && this.getIDsArray(this.searchDet.workstation).length > 0) {
        for (let i = 0; i < this.getIDsArray(this.searchDet.workstation).length; i++) {
          reqData.workstationIds = this.getIDsArray(this.searchDet.workstation)
        }
      }
      if (this.searchDet.deptIds != null && this.searchDet.deptIds.length > 0) {
        for (let i = 0; i < this.searchDet.deptIds.length; i++) {
          reqData.deptId = this.searchDet.deptIds[0].id;
        }
      }
      if (this.getIDsArray(this.searchDet.line) != null && this.getIDsArray(this.searchDet.line).length > 0) {
        for (let i = 0; i < this.getIDsArray(this.searchDet.line).length; i++) {
          reqData.lineIds = this.getIDsArray(this.searchDet.line)
        }
      }
    }
    else {
      reqData.branchId = this.userDet.branch.branchId;
    }

    console.log(reqData);
    this.skillMatrixService.getChecksheetList('apis/sm/getChecksheetList', reqData).subscribe((response: any) => {
      this.submitSpinner = false;
      this.listLoading = false;
      if (response.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.checksheetList = response.dataList;
          this.staticPagination.listLength = this.checksheetList.length;
        } else {
          this.staticPagination.listLength = this.checksheetList.length;
          this.listLoading = false;
          this.submitSpinner = false;
        }
      } else {
        this.listLoading = false;
        this.submitSpinner = false;
        this.checksheetList = [];
      }
    }, (error: any) => {
      this.listLoading = false;
    })
  }
  /* Delete Checksheet
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  deleteChecksheet(data) {
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this checksheet?',
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
        let reqData = {
          "updatedBy": this.userDet.empId,
          "createdBy": this.userDet.empId,
          "checkSheetId": data.id
        }
        this.skillMatrixService.deleteChecksheet('apis/sm/deleteChecksheet', reqData).subscribe((data: any) => {
          this.dataSpinner[data.id] = false;
          if (data.result) {
            this.alertService.success("OJT checksheet removed successfully.");
            if (this.searchDet.filterFlag) {
              this.filterList('filter');
            } else {
              this.filterList('');
            }
          } else {
            if (data.statusCode == 100) {
              this.alertService.error(data.reason);
            } else {
              this.alertService.error('Error occurred while removing data. Please try again');
            }
          }
        })
      } else {
        this.dataSpinner[data.checksheetPointId] = false;
      }
    });
  }
  sortData(sort: Sort) {
    this.sorting = sort;
    this.filterList('')
  }
  loadMore(data: any) {
    this.staticPagination = data;
    if (this.searchDet.filterFlag) {
      this.checksheetList = [];
      this.listLoading = true;
      this.filterList('filter');
    } else {
      this.checksheetList = [];
      this.listLoading = true;
      this.filterList('');
    }
  }
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
  // filter modal
  // Author simran
  // created date 07/09/2023
  // for closing filter modal on cross
  dismissModal() {
    this.submitAttempted = false;
    this.filterData.selectedBranch = [];
    this.searchDet.deptIds = [];
    this.searchDet.line = [];
    this.searchDet.workstation = [];
    this.filterData.selectedLvl = [];
    this.modalService.dismissAll()
  }

  /*
       Apply filter function
       Author: Mahesh W
       Date : 21 Aug 2023
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
    this.filterList('filter');
    this.modalService.dismissAll();
  }
  //  Remove filter
  // date 07/09/2023
  // author simran
  // for removing applied filter
  removeFilter() {
    this.submitAttempted = false;
    this.filterFormData.patchValue({
      branch: [],
      skillLvl: []
      // branchId: [this.plantList[0]],
      // skillLvlId: [this.masterLevelList[0]]
    })
    this.filterData.selectedBranch = [];
    this.searchDet.deptIds = [];
    this.searchDet.workstation = [];
    this.searchDet.line = [];
    this.filterData.selectedLvl = [];

    // this.searchDet.branchId = [this.plantList[0]];
    // this.searchDet.skillLvlId = [this.masterLevelList[0]];
    this.searchDet.filterFlag = false;
    this.filterList('');
  }
  getSortFunction(array, fieldToSort) {
    console.log(array, fieldToSort);
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
  /* get Department List
   @Author Simran 
   * @Date 27/10/2023
  */
  getDepartmentList(branch) {
    this.skillMatrixService
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
    this.skillMatrixService
      .getCellList("apis/sm/getCellList/", this.reportBodyCell)
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
    this.skillMatrixService
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
        this.resetFormField(this.filterFormData, "cellLineId");
        this.resetFormField(this.filterFormData, "workstationId");
        this.getCellList(this.deptId);

        // this.resetFormField(this.filterFormData, 'lineId')
      }
      if (type == "plant") {
        console.log(ev)
        this.branchId = ev.branchId;
        this.searchDet.deptIds = [];
        this.resetFormField(this.filterFormData, "deptId");
        this.resetFormField(this.filterFormData, "cellLineId");
        this.resetFormField(this.filterFormData, "workstationId");
        this.getDepartmentList(this.branchId);
        if (this.searchDet.addForm) {
          console.log("inside");
          // this.resetFormField(this.filterFormData, "deptId");
        }
      }
      if (type == "cell") {
        console.log(ev);
        this.lineId = ev.id;
        this.searchDet.work = [];
        this.resetFormField(this.filterFormData, "workstationId");
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

  /*
      Multi Select Dropdown onChange function
      Author: Simran
      Date : 27/10/2023
  */
  onChangeAll(ev: any, type) {
    if (ev) {
      console.log('Select All action');
    } else {
      console.log('Unselect All action');
    }
  }
}
