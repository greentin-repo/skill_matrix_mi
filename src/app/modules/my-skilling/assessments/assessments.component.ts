import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssessmentsService } from './assessments.service'
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit {
  // @Input() selectedDetail;
  selectedRecForModal: string;
  loggedInEmpDet: any = {};
  selectedBranch: any = {};
  worksatationData: any = [];
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  };

  listLoading: boolean = false;
  isUpload: boolean = false;
  searchDet: any = {
    searchFlag: false,
    searchInput: ''
  }
  submitSpinner: boolean = false;
  sorting: any;
  filterFlag: boolean = false;
  assessementList: any[];
  plantList: any;
  masterLevelList: any;
  masterDeptList: any;
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  filterData: FormGroup;
  masterWorkList: any[];
  selectedAssessmentDetail: any = {};
  assessmentDetailId: any;
  submitAttempted: boolean = false;
  cellList: any = [];

  constructor(
    private modalService: NgbModal,
    private assessmentService: AssessmentsService,
    public fb: FormBuilder) { }

  ngOnInit(): void {
    this.loggedInEmpDet = JSON.parse(localStorage.getItem('userDet'));
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
      // itemsShowLimit: 3,
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
    this.filterData = this.fb.group({
      branchId: new FormControl('', Validators.required),
      deptIds: new FormControl(''),
      cell: new FormControl(''),
      masterWork: new FormControl('')
    });
    this.getAccessiblePlantList();
    this.getMasterSkillLevelList();
    this.getAssessmentList('')

  }

  getCheckedValue() {
    return true;
  }

  /*
    @DESC : Function to clear pagination 
    @Author: Shashi
    @Date : 30 Aug 2023
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

  // My skilling Assessment modal
  // author simran
  // created date 29/08/2023
  // description : open assessment modal
  openViewModal(modal, data) {
    console.log(data);
    this.selectedRecForModal = '';
    this.selectedRecForModal = data;
    this.selectedAssessmentDetail = data;
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
  // My skilling Assessment 
  // author simran
  // created date 29/08/2023
  // description : you will get list here
  getAssessmentList(searchFilter) {
    this.assessementList = [];
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      'orgId': this.loggedInEmpDet.organization.orgId,
      'empId': this.loggedInEmpDet.empId,
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
    }
    if (searchFilter == 'filter') {
      if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0) {
        req.branchId = this.searchDet.branchId[0].id;
      }
      if (this.searchDet.deptIds != null && this.searchDet.deptIds.length > 0) {
        req.deptIds = this.getIDsArray(this.searchDet.deptIds)
      }
      if (this.searchDet.lineIds != null && this.searchDet.lineIds.length > 0) {
        req.lineIds = this.getIDsArray(this.searchDet.lineIds)
      }
      if (this.searchDet.masterWorkList != null && this.searchDet.masterWorkList.length > 0) {
        req.workstationIds = this.getIDsArray(this.searchDet.masterWorkList)
      }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      req.search = this.searchDet.searchInput;
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active;
        req.orderType = this.sorting.direction.toUpperCase();
      }
    }
    console.log(req);
    this.assessmentService.getAssessmentList('apis/sm/getOJTAssessmentsList', req).subscribe((response: any) => {
      if (response.result) {
        console.log(response);
        this.staticPagination.total = (response.dataList != null && response.dataList.length > 0) ? response.dataList.length : 0;
        this.staticPagination.totalPages = (this.staticPagination.total > 0) ? Math.ceil(this.staticPagination.total / this.staticPagination.itemsPerPage) : 0;
        if (response.dataList != null && response.dataList.length > 0) {
          this.assessementList = response.dataList;
          console.log(this.assessementList);
          this.assessmentDetailId = this.selectedAssessmentDetail.ojtAssessmentId
          this.staticPagination.listLength = this.assessementList.length;
        } else {
          this.assessementList = [];
          this.staticPagination.listLength = this.assessementList.length;
        }
      } else {
        this.assessementList = [];
        this.listLoading = false;
        this.staticPagination.listLength = this.assessementList.length;
      }
    })
  }
  filterModalOpen(modal) {
    this.filterFlag = true
    this.modalService.open(modal, {
      windowClass: 'filterPopup',
    });
    this.getAssessmentList('filter')
  }
  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will get branch list
  getAccessiblePlantList() {
    this.assessmentService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.loggedInEmpDet.organization.orgId + "/" + this.loggedInEmpDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
          this.searchDet.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
          // this.selectedBranch.selectedBranched = [this.plantList[0]];
          // this.selectedBranch.branch = [this.plantList[0]];
          console.log(this.selectedBranch.branch)   // Corrected assignment 
        } else {
          this.plantList = [{ id: this.loggedInEmpDet.branch.branchId, name: this.loggedInEmpDet.branch.name }];
        }
      } else {
        this.plantList = [{ id: this.loggedInEmpDet.branch.branchId, name: this.loggedInEmpDet.branch.name }];
      }
      // this.searchDet.branchId = [this.searchDet.plantList[0]];
      // this.getMasterDepartmentList(this.searchDet.branchId[0]);
      // this.getAssessmentList('');
      // this.getMasterDepartmentList();
    })
  }

  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will get level list
  getMasterSkillLevelList() {
    this.assessmentService.getMasterLevelList('apis/sm/getLevelList').subscribe((res: any) => {
      if (res.result) {
        if (res.dataList != null && res.dataList.length > 0) {
          this.masterLevelList = this.setArray(res.dataList, 'id', 'levelName');
          this.searchDet.masterLevel = this.setArray(res.dataList, 'id', 'levelName');
          this.searchDet.masterLevel = [this.searchDet.masterLevel[0]];
          console.log(this.searchDet.masterLevel)
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
    this.assessmentService.getMasterDepartmentList('getdepartmentlistbybranchid/' + selectedBranchId.id).subscribe((res: any) => {
      if (res.result) {
        console.log(res)
        if (res.deptList != null && res.deptList.length > 0) {
          this.masterDeptList = this.setArray(res.deptList, 'deptId', 'deptName');
          this.searchDet.departmentList = this.setArray(res.deptList, 'deptId', 'deptName');
          console.log(this.searchDet.departmentList)
          // this.searchDet.deptIds = this.searchDet.departmentList;
          // this.getWorkstationList();
          // this.searchDet.skillLvlId = [this.masterLevelList[0]];
        } else {
          this.masterDeptList = [];
        }
      } else {
        this.masterDeptList = [];
      }
    })
  }

  getCellList() {
    if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0 && this.searchDet.deptIds != null && this.searchDet.deptIds.length > 0) {
      var req: any = {
        branchId: this.searchDet.branchId[0].id
      }
      if (this.searchDet.deptIds != null && this.searchDet.deptIds.length > 0) {
        req.deptId = this.searchDet.deptIds[0].id;
      }
      this.assessmentService.getCellList('apis/sm/getCellList', req).subscribe((response: any) => {
        if (response.result) {
          if (response.dataList != null && response.dataList.length > 0) {
            // for (let index = 0; index < response.dataList.length; index++) {
            //   response.dataList[index].tmpName = '';
            //   if (response.dataList[index].lineName) {
            //     response.dataList[index].tmpName += response.dataList[index].lineName;
            //     if (response.dataList[index].deptName) {
            //       response.dataList[index].tmpName += ' (Department : ' + response.dataList[index].deptName + ')';
            //     }
            //   }
            // }
            this.cellList = this.setArray(response.dataList, 'lineId', 'tmpName');
            this.searchDet.cellList = this.setArray(
              response.dataList,
              "lineId",
              "lineName"
            );
            this.searchDet.cell = [];
            console.log(this.searchDet.cellList)
          } else {
            this.cellList = [];
            this.searchDet.cellList = [];
          }
        } else {
          this.cellList = [];
          this.searchDet.cellList = [];
        }
      })
    } else {
      this.cellList = [];
    }
  }

  // Assessment module
  // Author: Simran
  // created date: 25/08/2023
  // description : you will workstation list
  getWorkstationList() {
    this.listLoading = true;
    // let deptIds = [];

    let getReq: any = {
      "orgId": this.loggedInEmpDet.organization.orgId,
      "branchId": this.searchDet.branchId[0].id,
      // "deptIds": []
    }
    console.log(this.searchDet.deptIds)
    if (this.getIDsArray(this.searchDet.deptIds) != null && this.getIDsArray(this.searchDet.deptIds).length > 0) {
      for (let i = 0; i < this.getIDsArray(this.searchDet.deptIds).length; i++) {
        getReq.deptIds = this.getIDsArray(this.searchDet.deptIds)
        console.log(getReq.deptIds)
      }
    }
    console.log(getReq);
    this.assessmentService.getWorkstationList('apis/sm/getWorkstationList', getReq).subscribe((response: any) => {
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

  // Assessment module
  // Author: Simran
  // created date: 31/08/2023
  // description : when you change branch

  onChangeBranch(event: any) {
    console.log(event)
    this.selectedBranch.branchId = event.id;
    this.getMasterDepartmentList(this.selectedBranch.branchId)
    // this.getWorkstationList();
  }

  /*
       Single Select Dropdown onChange function
       Author: Mahesh W
       Date : 21 Aug 2023
   */
  onChange(ev: any, type) {
    if (ev) {
      if (type == 'plant') {
        this.getMasterDepartmentList(ev);
        this.searchDet.deptIds = [];
        this.searchDet.lineIds = [];
        this.searchDet.deptIds = [];
        this.masterDeptList = [];
      }
      if (type == 'dept') {
        this.searchDet.lineIds = [];
        this.getWorkstationList();
        this.getCellList();
      }
    } else {
      if (type == 'plant') {
        console.log("in")
        if (this.searchDet) {
          console.log("out");


          this.searchDet.departmentList = [];
          this.resetFormField(this.filterData, 'deptIds');
        } else {

        }
      } /*else if (type == 'dept') {
      } else if (type == 'userType') { }*/
    }
  }
  /*
       Multi Select Dropdown onChange function
       Author: Mahesh W
       Date : 21 Aug 2023
   */
  onChangeAll(ev: any, type) {
    if (ev) {
      console.log('Select All action');
    } else {
      console.log('Unselect All action');
    }
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

  /* 
     Load More Pagination next page Data
     @Author : Simran
     @Date : 30/08/2023
   */
  loadMore(ev: any) {
    this.staticPagination = ev;
    if (this.filterFlag) {
      this.getAssessmentList('filter');
    } else {
      this.getAssessmentList('');
    }
  }

  sortData(sort: Sort) {
    this.sorting = sort;
    console.log(this.sorting)
    this.getAssessmentList('')
  }

  /*
     Apply filter function
     Author: simran
     Date : 30/08/2023
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
    Date : 30/08/2023
  */
  removeFilter() {
    this.submitAttempted = false;
    this.filterData.patchValue({
      branchId: [],
      skillLvlId: []
      // branchId: [this.plantList[0]],
      // skillLvlId: [this.masterLevelList[0]]
    })
    this.searchDet.branchId = [];
    this.searchDet.skillLvlId = [];
    // this.searchDet.branchId = [this.plantList[0]];
    // this.searchDet.skillLvlId = [this.masterLevelList[0]];
    this.searchDet.filterFlag = false;
    this.getAssessmentList('');
  }

  /* 
     Reset Form function
     Author: Simran
     Date : 30/08/2023
 */
  resetFormField(form, keyName) {
    if (keyName != '') {
      Object.keys(form.controls).forEach(key => {
        if (key == keyName) {
          form.get(keyName).reset();
          form.get(keyName).markAsPristine();
          form.get(keyName).markAsUntouched();
        }
      });
    } else {
      Object.keys(form.controls).forEach(key => {
        form.get(key).reset();
        form.get(key).markAsPristine();
        form.get(key).markAsUntouched();
      });
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
  getSortFunction(array, fieldToSort) {
    console.log(array, fieldToSort);
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "plant" || fieldToSort === "cell" || fieldToSort === "level" || fieldToSort === "work") {
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
