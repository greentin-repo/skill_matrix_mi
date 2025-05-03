import { Component, OnInit, TemplateRef, ViewChild, ElementRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SkillingService } from '../skilling.service';
import Swal from 'sweetalert2';
import { AlertService } from 'src/app/theme/shared/components';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Sort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';

@Component({
  selector: "app-ojt-registration",
  templateUrl: "./ojt-registration.component.html",
  styleUrls: ["./ojt-registration.component.scss"],
})
export class OjtRegistrationComponent implements OnInit {
  submitAttempted: boolean = false;
  filterFlag: boolean = false;
  formdata: FormGroup;
  searchDet: any = {};
  constant: any = {};
  userDet: any = {};
  listLoading = false;
  ojtRegList: any = [];
  sorting: any;
  isDropdownOpen: boolean = false;
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  SingleDropdownTypeSettings: IDropdownSettings = {};
  branchAccessList: any = [];
  cellList: any = [];
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0,
  };
  selectedOjtDetails: any = {};
  isAppliedFilter: boolean = false;
  isSuperAdmin: any;

  constructor(private router: Router,
    public modalConfig: NgbModalConfig,
    public modalService: NgbModal,
    private apiService: SkillingService,
    private alertService: AlertService,
    private fb: FormBuilder,
    @Inject('Constant') Constant: any,) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem("userDet"));
    this.formdata = this.fb.group({
      branch: new FormControl("", Validators.required),
      cell: new FormControl(""),
    });
    this.SingleDropdownTypeSettings = {
      singleSelection: true,
      idField: "id",
      textField: "type",
      allowSearchFilter: false,
      itemsShowLimit: 1,
      showSelectedItemsAtTop: true,
      closeDropDownOnSelection: true,
    };
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "name",
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
    this.getBranchAccessList();
    this.getOjtRegList("");
    this.checkIsSuperAdmin();
  }

  getBranchAccessList() {
    this.apiService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.branchAccessList = res.branchAccessList;
          this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        } else {
          this.branchAccessList = [
            {
              id: this.userDet.branch.branchId,
              name: this.userDet.branch.name,
            },
          ];
        }
      }
      else {
        this.branchAccessList = [
          {
            id: this.userDet.branch.branchId,
            name: this.userDet.branch.name,
          },
        ];
      }
    });
  }

  onChangeBranch(event: any) {
    console.log(event);
    // this.getDeptList(event);
    this.searchDet.cell = [];
    this.getCellList();
  }
  onChangeDept(event: any) {
    if (!Array.isArray(this.searchDet.dept)) {
      this.searchDet.dept = [];
    }
    if (!this.searchDet.dept.some(dept => dept.id === event.id)) {
      this.searchDet.dept.push({ id: event.id, name: event.name });
    }
  }
  
  
  onDeptDeselect(event: any): void {
    if (!Array.isArray(this.searchDet.dept)) {
      this.searchDet.dept = [];
    }
    this.searchDet.dept = this.searchDet.dept.filter(dept => dept.id !== event.id);
  }
  

  getCellList() {
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      var req: any = {
        branchId: this.searchDet.branch[0].id
      }
      if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
        req.deptId = this.searchDet.dept[0].id;
      }
      this.apiService.getCellList('apis/sm/getCellList', req).subscribe((response: any) => {
        if (response.result) {
          if (response.dataList != null && response.dataList.length > 0) {
            for (let index = 0; index < response.dataList.length; index++) {
              response.dataList[index].tmpName = '';
              if (response.dataList[index].lineName) {
                response.dataList[index].tmpName += response.dataList[index].lineName;
                if (response.dataList[index].deptName) {
                  response.dataList[index].tmpName += ' (Department : ' + response.dataList[index].deptName + ')';
                }
              }
            }
            this.cellList = this.setArray(response.dataList, 'lineId', 'tmpName');
          } else {
            this.cellList = [];
          }
        } else {
          this.cellList = [];
        }
      })
    } else {
      this.cellList = [];
    }
  }

  filterModalOpen(modal) {
    console.log("In filter");
    if (!this.filterFlag) {
      // this.filterData.reset();
    }
    this.modalService.open(modal, {
      windowClass: "filterPopup",
    });
  }

  getFilterList(form: any) {
    this.submitAttempted = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach((key) => {
        form.controls[key].markAsDirty();
      });
      return;
    }
    this.clearPagination();
    this.isAppliedFilter = true;
    this.searchDet.filterFlag = true;
    this.searchDet.filterPopupOpen = false;
    this.modalService.dismissAll();
    this.getOjtRegList("Filter");
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

  clearPagination() {
    this.staticPagination = {
      total: 0,
      page: 1,
      maxSize: 5,
      itemsPerPage: 10,
      totalPages: 0,
      listLength: 0,
    };
  }

  sortData(sort: Sort) {
    this.sorting = sort;
    this.getOjtRegList("");
  }

  removeFilter() {
    this.submitAttempted = false;
    this.formdata.reset();
    this.searchDet.branch = [];
    this.searchDet.cell = [];
    this.submitAttempted = false;
    this.isAppliedFilter = false;
    this.searchDet.filterFlag = false;
    this.searchDet.filterPopupOpen = false;
    this.ojtRegList = [];
    this.searchDet.dept = [];
    this.getOjtRegList("");
  }

  loadMore(data: any) {
    this.staticPagination = data;
    this.ojtRegList = [];
    this.listLoading = true;
    if (this.filterFlag) {
      this.getOjtRegList("filter");
    } else {
      this.getOjtRegList("");
    }
    // this.getTrainingTestDetails();
  }

  getOjtRegList(searchfilter) {
    this.listLoading = true;
    if (
      this.staticPagination.offset > 0 &&
      this.filterFlag == false &&
      searchfilter == "filter"
    ) {
      this.clearPagination();
    }
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset =
        (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let reqData: any = {
      orgId: this.userDet.organization.orgId,
      offset: this.staticPagination.offset,
      limit: this.staticPagination.itemsPerPage,
    };
    if (this.sorting) {
      if (this.sorting.direction != "") {
        reqData.colName = this.sorting.active;
        reqData.orderType = this.sorting.direction;
      }
    }
    if (
      this.searchDet.searchData &&
      this.searchDet.searchInput &&
      this.searchDet.searchInput != ""
    ) {
      reqData.search = this.searchDet.searchInput;
    }
    if (searchfilter == "filter") {
      if (this.formdata.invalid) {
        Object.keys(this.formdata.controls).forEach((key) => {
          this.formdata.controls[key].markAsDirty();
        });
        return;
      }
    }
    if (this.searchDet.branch != null && this.searchDet.branch.length > 0) {
      reqData.branchId = this.searchDet.branch[0].id;
    }
    else {
      reqData.branchId = this.userDet.branch.branchId;
    }
    
    if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
    reqData.lineIds = this.searchDet.dept.map(dept => dept.id);
    }

    const matchingLineIds = this.cellList
    .filter(cell => 
        this.searchDet.dept.some(dept => 
            dept.id === cell.lineId && 
            dept.name.includes(cell.lineName) && 
            dept.name.includes(cell.deptName)
        )
    )
    .map(cell => cell.deptId);

    if (matchingLineIds.length > 0) {
      reqData.deptIds = matchingLineIds;
    }
    

    // if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
    //   for (let i = 0; i < this.cellList.length; i++) {
    //     if (this.cellList[i].lineId == this.searchDet.cell[0].id) {
    //       reqData.deptIds = [this.cellList[i].deptId];
    //     }
    //   }
    // }

    console.log(reqData);
    this.apiService.getOJTRegistration("apis/sm/getOJTRegistrationList", reqData).subscribe((response: any) => {
      console.log(response);
      this.listLoading = false;
      if (response.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalMyActionCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.ojtRegList = response.dataList;
          console.log(this.ojtRegList);
          this.staticPagination.listLength = response.dataList.length;
        }
        else {
          this.ojtRegList = [];
        }
      } else {
        this.ojtRegList = [];
      }
      (error: any) => {
        this.ojtRegList = [];
        this.listLoading = false;
      }
    }, (error: any) => {
      this.ojtRegList = []
      this.listLoading = false;

    })
  }
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

  handleIconClick(data: any, modal) {
    console.log(data);
    this.selectedOjtDetails = data;
    console.log("In filter");
    if (!this.filterFlag) {
      // this.filterData.reset();
    }
    this.modalService.open(modal, {
      windowClass: "bottom",
    });
  }
  getSearchListData(ev) {
    // this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = "";
    }
    if (this.filterFlag) {
      this.getOjtRegList("filter");
    } else {
      this.getOjtRegList("");
    }
  }

  checkIsSuperAdmin() {    
    this.isSuperAdmin = this.userDet.roles.some((role: any) => role.name === "SUPERADMIN")
  }

  handleDeletePendingOJT(obj) {
    let payload = {
      ojtId: obj.ojtRegisId
    }
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want remove this OJT ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#7044cd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Remove it',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteOJTPlan(`deleteOjtRegistration`, payload).subscribe((response: any) => {
          if (response.result) {
            this.alertService.success("OJT Deleted successfully");
            this.getOjtRegList("");
          } else {
            this.alertService.error("Error deleting OJT");
          }
        });
      }
    });
  }
}
