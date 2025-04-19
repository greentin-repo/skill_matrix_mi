import { Component, Input, OnInit } from '@angular/core';
import { SkillingService } from '../skilling.service'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AssessessmentDetailModalComponent } from 'src/app/theme/shared/components/assessessment-detail-modal/assessessment-detail-modal.component';
import { Sort } from '@angular/material/sort';
@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit {
  loggedInEmpDet: any;
  assessmentData: any;
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  searchDet: any = {};
  plantList: any;
  masterLevelList: any;
  filterData: FormGroup;
  masterDeptList: any[];
  selectedBranchId: any;
  selectedAssessData: any;
  selectedRecForModal: string;
  isUpload: boolean = false;
  filterFlag: boolean = false;
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0
  }
  sorting: any;
  // @Input() selectedDetail;

  listLoading: boolean;
  worksatationData: any;
  masterWorkList: any[];
  selectedBranch: any;
  submitAttempted: boolean = false;
  // @Input() masterActivity;

  constructor(private skillingService: SkillingService,
    private modalService: NgbModal,
    public fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.loggedInEmpDet = JSON.parse(localStorage.getItem('userDet'));
    this.filterData = this.fb.group({
      branchId: new FormControl('', Validators.required),
      masterWork: new FormControl(''),
      deptLvlId: new FormControl('')
    });
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.multipleDropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 2,
      allowSearchFilter: true,
    };
    this.getMasterSkillLevelList();
    this.getAccessiblePlantList();
    // this.getMasterDepartmentList();
    this.getAssessmentList('');
  }

  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will get assessmnet list 
  getAssessmentList(searchfilter) {
    this.assessmentData = [];
    // if (
    //   this.staticPagination.offset > 0 && this.filterFlag == false && searchfilter == "filter"
    // ) {
    //   this.clearPagination();
    // }
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let data: any = {
      "orgId": this.loggedInEmpDet.organization.orgId,
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
    }
    if (searchfilter == 'filter') {
      if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0) {
        data.branchId = this.searchDet.branchId[0].id;
      }
      if (this.searchDet.deptIds != null && this.searchDet.deptIds.length > 0) {
        data.deptIds = this.getIDsArray(this.searchDet.deptIds)
      }
      if (this.searchDet.masterWorkList != null && this.searchDet.masterWorkList.length > 0) {
        data.workstationIds = this.getIDsArray(this.searchDet.masterWorkList)
      }
    }
    else {
      data.branchId = this.loggedInEmpDet.branch.branchId;
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      data.search = this.searchDet.searchInput;
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        data.colName = this.sorting.active;
        data.orderType = this.sorting.direction.toUpperCase();
      }
    }
    console.log(data);
    this.skillingService.getAssessmentDisplay('apis/sm/getOJTAssessmentsList', data).subscribe((response: any) => {
      // if (response.result) {
      //   console.log(response);
      //   // (response.dataList != null && response.dataList.length > 0) ? response.dataList.length : 0;
      //   this.staticPagination.total = response.totalCount;
      //   // (this.staticPagination.total > 0) ? Math.ceil(this.staticPagination.total / this.staticPagination.itemsPerPage) : 0;
      //   this.staticPagination.totalPages =  Math.ceil(response.totalMyActionCount / this.staticPagination.itemsPerPage);
      //   if (response.dataList != null && response.dataList.length > 0) {
      //     this.assessmentData = response.dataList;
      //     console.log(this.assessmentData);
      //     this.staticPagination.listLength = this.assessmentData.length;
      //     console.log(response.dataList);
      //   }
      //   else {
      //     this.assessmentData = [];
      //     this.staticPagination.listLength = this.assessmentData.length;
      //   }
      // }
      // else {
      //   this.assessmentData = [];
      //   this.staticPagination.listLength = this.assessmentData.length;
      // }
      if (response.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.assessmentData = response.dataList;
          console.log(this.assessmentData);
          this.staticPagination.listLength = response.dataList.length;
        }
        else {
          this.assessmentData = [];
        }
      } else {
        this.assessmentData = [];
      }
      (error: any) => {
        this.assessmentData = [];
        this.listLoading = false;
      }
    })
  }
  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : filter modal open
  filterModalOpen(modal) {
    this.filterFlag = true
    this.modalService.open(modal, {
      windowClass: 'filterPopup',
    });
  }

  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will get branch list
  getAccessiblePlantList() {
    this.skillingService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.loggedInEmpDet.organization.orgId + "/" + this.loggedInEmpDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
          this.searchDet.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        } else {
          this.plantList = [{ id: this.loggedInEmpDet.branch.branchId, name: this.loggedInEmpDet.branch.name }];
        }
      } else {
        this.plantList = [{ id: this.loggedInEmpDet.branch.branchId, name: this.loggedInEmpDet.branch.name }];
      }
      // this.searchDet.branchId = [this.searchDet.plantList[0]];
      // this.getMasterDepartmentList(this.searchDet.branchId[0]);
      this.getAssessmentList('');
      // this.getMasterDepartmentList();
    })
  }

  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will get level list
  getMasterSkillLevelList() {
    this.skillingService.getMasterLevelList('apis/sm/getLevelList').subscribe((res: any) => {
      if (res.result) {
        if (res.dataList != null && res.dataList.length > 0) {
          this.masterLevelList = this.setArray(res.dataList, 'id', 'levelName');
          // this.searchDet.skillLvlId = [this.masterLevelList[0]];
        } else {
          this.masterLevelList = [];
        }
      } else {
        this.masterLevelList = [];
      }
    })
  }

  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will get department list
  getMasterDepartmentList(selectedBranchId) {
    this.skillingService.getMasterDepartmentList('getdepartmentlistbybranchid/' + selectedBranchId.id).subscribe((res: any) => {
      if (res.result) {
        console.log(res)
        if (res.deptList != null && res.deptList.length > 0) {
          this.masterDeptList = this.setArray(res.deptList, 'deptId', 'deptName');
          this.searchDet.departmentList = this.setArray(res.deptList, 'deptId', 'deptName');
          // this.searchDet.deptIds = this.searchDet.departmentList;
          this.getWorkstationList()
          // this.searchDet.skillLvlId = [this.masterLevelList[0]];
        } else {
          this.masterDeptList = [];
        }
      } else {
        this.masterDeptList = [];
      }
    })
  }

  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will workstation list
  getWorkstationList() {
    this.listLoading = true;
    let getReq: any = {
      "branchId": this.searchDet.branchId[0].id,
      "orgId": this.loggedInEmpDet.organization.orgId
    }
    if (this.getIDsArray(this.searchDet.deptIds) != null && this.getIDsArray(this.searchDet.deptIds).length > 0) {
      for (let i = 0; i < this.getIDsArray(this.searchDet.deptIds).length; i++) {
        getReq.deptIds = this.getIDsArray(this.searchDet.deptIds)
        console.log(getReq.deptIds)
      }
    }
    console.log(getReq);
    this.skillingService.getWorkstationList('apis/sm/getWorkstationList', getReq).subscribe((response: any) => {
      console.log(response);
      this.listLoading = false;
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.worksatationData = response.dataList;
          this.masterWorkList = this.setArray(response.dataList, 'id', 'workstation');
          this.searchDet.masterWorkStationList = this.setArray(response.dataList, 'id', 'workstation');
          // this.searchDet.masterWorkList = this.searchDet.masterWorkStationList;
          console.log(this.searchDet.masterWorkList);
        } else {
          this.worksatationData = [];
        }
      }
      else {
        this.worksatationData = [];
      }
    })

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
  // onChange(selectedPlant: any) {
  //   this.selectedBranchId = selectedPlant.id
  //   console.log(selectedPlant)
  //   // Fetch the departments based on the selected plant ID
  //   // const plantId = selectedPlant[0]?.id; // Assuming singleSelection is true
  //   if (selectedPlant.id) {
  //     this.getMasterDepartmentList(this.selectedBranchId)
  //   }
  //   else {
  //     this.masterDeptList = [];
  //   }
  // }
  // onDeSelectPlant(){
  //   this.masterDeptList = [];
  // }

  openViewModal(modal, data) {
    console.log(data);
    this.selectedRecForModal = '';
    this.selectedRecForModal = data;
    console.log(this.selectedRecForModal)
    var modalRef = this.modalService.open(modal, {
      windowClass: 'right'
    });
    // modalRef.componentInstance.selectedDet = data;
    modalRef.result.then((result) => {
      if (result === 'success') {
      }
    }, (reason) => {
    });
  }

  /* 
      Load More Pagination next page Data
      @Author : Simran
      @Date : 30/08/2023
    */
  loadMore(ev: any) {
    this.staticPagination = ev;
    this.getAssessmentList('');
  }

  sortData(sort: Sort) {
    this.sorting = sort;
    this.getAssessmentList('')
  }
  /*
       Apply filter function
       Author: simran
       Date : 30 Aug 2023
 */
  submitFilterForm(form) {
    this.submitAttempted = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      return;
    }
    this.clearPagination();
    this.searchDet.filterFlag = true;
    this.getAssessmentList('filter');
    this.modalService.dismissAll();
  }
  /* 
    Remove Filter
    Author : simran
    Date : 30 Aug 2023
  */
  removeFilter() {
    this.submitAttempted = false;
    this.filterData.patchValue({
      branchId: [],
      deptLvlId: [],
      masterWork: []

    })
    this.searchDet.branchId = [];
    this.searchDet.deptIds = [];
    this.searchDet.masterWorkList = [];
    this.searchDet.filterFlag = false;
    this.getAssessmentList('');
  }

  /* 
Reset Form function
Author: Simran
Date : 30/08/2023
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
    Multi Select Dropdown onChange function
    Author: simran
    Date : 04/09/2023
*/
  onChangeAll(ev: any, type) {
    if (ev) {
      console.log('Select All action');
    } else {
      console.log('Unselect All action');
    }
  }

  /*
    Single Select Dropdown onChange function
    Author: simran
    Date : 01/09/2023
*/
  onChange(ev: any, type) {
    if (ev) {
      if (type == 'plant') {
        this.getMasterDepartmentList(ev);
      }
    } else {
      if (type == 'plant') {
        if (this.searchDet.filterModalOpen) {
          this.searchDet.departmentList = [];
          this.resetFormField(this.filterData, 'deptIds');
        }
        // else {
        //   this.resetFormField(this.stakeholderForm, 'deptIds');
        // }
      } /*else if (type == 'dept') {
          } else if (type == 'userType') { }*/
    }
  }
  /*
       Common function For get Ids from array
       Author: simran
       Date : 01/09/2023
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
  Common function For Searching
  Author: simran
  Date : 09/09/2023
*/
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.filterFlag) {
      this.getAssessmentList('filter');
    } else {
      this.getAssessmentList('');
    }
  }
  /*
      @DESC : Function to clear pagination 
      @Author: Simran
      @Date : 09/09/2023
    */
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
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "plant" || fieldToSort === "cell" || fieldToSort === "work") {
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
}
