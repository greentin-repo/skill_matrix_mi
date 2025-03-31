import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { SkillMatrixService } from "../skill-matrix.service";
import { AlertService } from "src/app/theme/shared/components";
import Swal from "sweetalert2";
import { Sort } from "@angular/material/sort";

@Component({
  selector: "app-stake-holder",
  templateUrl: "./stake-holder.component.html",
  styleUrls: ["./stake-holder.component.scss"],
})
export class StakeHolderComponent implements OnInit {
  isEditing: boolean = false;
  filterFlag: boolean = false;
  submitAttempted: boolean = false;
  searchDet: any = {};
  userDet: any = {};
  masterLoader: boolean = false;
  formSubmitLoader: boolean = false;
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  filterData: FormGroup;
  stakeholderForm: FormGroup;
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 0,
  };
  submitSpinner: boolean = false;
  masterUserTypes: any = [];
  stakeholderList: any = [];
  employeeList: any = [];
  plantList: any = [];
  departmentList: any = [];
  dataSpinner: any = [];
  stakeHolderDet: any = {};
  sorting: any;
  branchId: any[];
  reportBodyCell: any = {};
  branch: any[];
  cellList: any[];
  deptId: any;

  constructor(
    public modalConfig: NgbModalConfig,
    public modalService: NgbModal,
    public apiService: SkillMatrixService,
    public fb: FormBuilder,
    public alertService: AlertService
  ) {
    modalConfig.backdrop = "static";
    modalConfig.keyboard = false;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem("userDet"));
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
    this.filterData = this.fb.group({
      branchId: new FormControl("", Validators.required),
      deptIds: new FormControl(""),
      lineId: new FormControl(""),
      // userTypeIds: new FormControl('')
    });
    this.stakeholderForm = this.fb.group({
      branchId: new FormControl("", Validators.required),
      deptId: new FormControl("", Validators.required),
      userTypeId: new FormControl("", Validators.required),
      lineId: new FormControl("", Validators.required),
      empId: new FormControl("", Validators.required),
    });
    this.getMasterUsertypeList();
    this.getAccessiblePlantList();
    this.getStakeholdersList();
  }
  /*
  on changes Sorting function 
  Author: Mahesh W
  Date : 1 Sept 2023
  */
  sortData(sort: Sort) {
    console.log(sort);
    this.sorting = sort;
    this.getStakeholdersList();
  }
  /*
  Get Master UserType List
  Author: Mahesh W
  Date : 21 Aug 2023
  */
  getMasterUsertypeList() {
    this.apiService
      .getMasterUserType("apis/sm/getMasterUserType")
      .subscribe((res: any) => {
        if (res.result) {
          if (res.dataList != null && res.dataList.length > 0) {
            /* Use For Add Screen */
            this.masterUserTypes = this.setArray(
              res.dataList,
              "id",
              "userType"
            );
            /* Use For Filter */
            this.searchDet.masterUserTypes = this.setArray(
              res.dataList,
              "id",
              "userType"
            );
            // this.searchDet.userTypeIds = this.searchDet.masterUserTypes;
          } else {
            this.masterUserTypes = [];
            this.searchDet.masterUserTypes = [];
          }
        } else {
          this.masterUserTypes = [];
          this.searchDet.masterUserTypes = [];
        }
      });
  }
  /*
  Get Department List
  Author: Mahesh W
  Date : 21 Aug 2023
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
            if (!this.searchDet.addForm) {
              /* Use For Filter */
              this.searchDet.departmentList = this.setArray(
                res.deptList,
                "deptId",
                "deptName"
              );
              // this.searchDet.deptIds = this.searchDet.departmentList;
            }
            if (
              this.stakeholderList == null ||
              this.stakeholderList.length == 0
            ) {
              this.getStakeholdersList();
            }
          } else {
            this.masterUserTypes = [];
            this.searchDet.departmentList = [];
          }
        } else {
          this.masterUserTypes = [];
          this.searchDet.departmentList = [];
        }
      });
  }
  /*
  Get Accessible Plant List
  Author: Mahesh W
  Date : 21 Aug 2023
  */
  getAccessiblePlantList() {
    this.apiService
      .getBranchAccessList(
        "getBranchAccessSetupByEmpId/" +
        this.userDet.organization.orgId +
        "/" +
        this.userDet.empId
      )
      .subscribe((res: any) => {
        if (res.result) {
          if (res.branchAccessList != null && res.branchAccessList.length > 0) {
            /* Use For Add Screen */
            this.plantList = this.setArray(
              res.branchAccessList,
              "branchId",
              "branchName"
            );
            /* Use For Filter */
            this.searchDet.plantList = this.setArray(
              res.branchAccessList,
              "branchId",
              "branchName"
            );
          } else {
            /* Use For Add Screen */
            this.plantList = [
              {
                id: this.userDet.branch.branchId,
                name: this.userDet.branch.name,
              },
            ];
            /* Use For Filter */
            this.searchDet.plantList = [
              {
                id: this.userDet.branch.branchId,
                name: this.userDet.branch.name,
              },
            ];
          }
        } else {
          /* Use For Add Screen */
          this.plantList = [
            {
              id: this.userDet.branch.branchId,
              name: this.userDet.branch.name,
            },
          ];
          /* Use For Filter */
          this.searchDet.plantList = [
            {
              id: this.userDet.branch.branchId,
              name: this.userDet.branch.name,
            },
          ];
        }
        // this.branchId = [this.searchDet.plantList[0]];
        // this.getDepartmentList(this.branchId[0]);
      });
  }
  getCellList(ev) {
    console.log(ev);
    this.reportBodyCell = {
      branchId: this.branchId,
      deptId: ev,
    };
    this.apiService
      .getCellList("apis/sm/getCellList/", this.reportBodyCell)
      .subscribe((res: any) => {
        console.log(res);
        if (res.result) {
          if (res.dataList != null && res.dataList.length > 0) {
            /* Use For Add Screen */
            this.cellList = this.setArray(res.dataList, "lineId", "lineName");
            console.log(this.cellList);
            /* Use For Filter */
            this.searchDet.cellList = this.setArray(
              res.dataList,
              "lineId",
              "lineName"
            );
            if (
              this.stakeholderList == null ||
              this.stakeholderList.length == 0
            ) {
              this.getEmployeeData();
            }
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
  getEmployeeData() {
    this.employeeList = [];
    console.log(this.employeeList);
    let tmpArray = [];
    if (
      this.stakeholderForm.get("branchId").value == null ||
      this.stakeholderForm.get("branchId").value.length == 0
    ) {
      console.log("return");
      return;
    }
    let plantId = this.stakeholderForm.get("branchId").value[0].id;
    this.apiService
      .getEmployeeList("getAllEmpList/0/" + plantId + "/0")
      .subscribe(
        (res: any) => {
          console.log(res);
          if (res.result) {
            if (res.allEmpDetails != null && res.allEmpDetails.length > 0) {
              for (const element of res.allEmpDetails) {
                let name = "";
                if (element.firstName) {
                  name += element.firstName.trim();
                }
                if (element.lastName) {
                  if (element.firstName) {
                    name += " ";
                  }
                  name += element.lastName.trim();
                }
                element.name = name;
                element.id = element.empId;
                if (element.isDeactive == 0) {
                  tmpArray.push(element);
                }
              }
              if (tmpArray != null && tmpArray.length > 0) {
                this.employeeList = tmpArray;
              } else {
                console.log("list1");
                this.employeeList = [];
              }
            } else {
              console.log("list2");

              this.employeeList = [];
            }
          } else {
            console.log("list3");

            this.employeeList = [];
          }
        },
        (error: any) => {
          this.employeeList = [];
        }
      );
  }

  /* 
    Get Stakeholders List
    Author: Mahesh W
    Date : 21 Aug 2023
  */
  getStakeholdersList() {
    this.masterLoader = true;
    this.stakeholderList = [];
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset =
        (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      orgId: this.userDet.organization.orgId,
      offset: this.staticPagination.offset,
      limit: this.staticPagination.itemsPerPage,
    };
    if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0) {
      for (let i = 0; i < this.searchDet.branchId.length; i++) {
        req.branchId = this.searchDet.branchId[0].id;
      }
    }
    else{
      req.branchId = this.userDet.branch.branchId; 
    }
    if (this.searchDet.deptIds != null && this.searchDet.deptIds.length > 0) {
      for (let i = 0; i < this.searchDet.deptIds.length; i++) {
        console.log(this.searchDet.deptIds);
        req.deptId = this.searchDet.deptIds[0].id;
      }
    }
    // if (this.getIDsArray(this.searchDet.deptIds) != null && this.getIDsArray(this.searchDet.deptIds).length > 0) {
    //   for (let i = 0; i < this.getIDsArray(this.searchDet.deptIds).length; i++) {
    //   req.deptIds = this.getIDsArray(this.searchDet.deptIds)
    //   }

    // }
    // if (this.searchDet.userTypeIds != null && this.searchDet.userTypeIds.length > 0) {
    //   req.userTypeIds = this.getIDsArray(this.searchDet.userTypeIds);
    // }
    if (this.searchDet.lineId != null && this.searchDet.lineId.length > 0) {
      req.lineIds = this.getIDsArray(this.searchDet.lineId);
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active;
        req.orderType = this.sorting.direction.toUpperCase();
      }
    }
    if (
      this.searchDet.searchData &&
      this.searchDet.searchInput &&
      this.searchDet.searchInput != ""
    ) {
      req.search = this.searchDet.searchInput;
    }

    this.apiService
      .getStakeholderList("apis/sm/getUserTypeList", req)
      .subscribe(
        (res: any) => {
          this.masterLoader = false;
          if (res.result) {
            if (this.staticPagination.page == 1) {
              this.staticPagination.total = res.totalCount;
              this.staticPagination.totalPages = Math.ceil(
                res.totalCount / this.staticPagination.itemsPerPage
              );
            }
            if (res.dataList != null && res.dataList.length > 0) {
              this.stakeholderList = res.dataList;
              console.log(this.stakeholderList);
              this.staticPagination.listLength = this.stakeholderList.length;
            } else {
              this.stakeholderList = [];
              this.staticPagination.listLength = this.stakeholderList.length;
            }
          } else {
            this.stakeholderList = [];
          }
        },
        (error: any) => {
          this.stakeholderList = [];
          this.masterLoader = false;
        }
      );
  }
  /*
    Add Stakeholder Open Modal
    Author: Mahesh W
    Date : 21 Aug 2023
  */
  addStakeholder(modal) {
    this.isEditing = false;
    this.formSubmitLoader = false;
    this.resetFormField(this.stakeholderForm, "branchId");
    this.resetFormField(this.stakeholderForm, "deptId");
    this.resetFormField(this.stakeholderForm, "lineId");
    this.resetFormField(this.stakeholderForm, "userTypeId");
    this.resetFormField(this.stakeholderForm, "empId");
    this.departmentList = [];
    this.cellList = [];
    this.stakeHolderDet.id = 0;
    this.searchDet.addForm = true;
    // if (this.employeeList != null && this.employeeList.filter(x => x.branch.branchId == this.searchDet.branchId[0].id).length > 0) {
    //   console.log('Exist Employee List');
    // } else {
    //   this.getEmployeeData();
    // }
    this.modalService.open(modal, { windowClass: "top" }).result.then(
      (result) => {
        console.log(`Closed with: ${result}`);
        //this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        console.log(`Closed with:` + reason);
        if (reason == "Cross click") {
          this.searchDet.addForm = false;
        }
        //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }
  submitStakeholderForm(form) {
    console.log(form)
    this.formSubmitLoader = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach((key) => {
        form.controls[key].markAsDirty();
      });
      this.formSubmitLoader = false;
      return;
    }
    let req: any = {
      branchId: form.get("branchId").value[0].id,
      deptId: form.get("deptId").value[0].id,
      userTypeId: form.get("userTypeId").value[0].id,
      empId: form.get("empId").value[0].id,
      lineId: form.get("lineId").value[0].id,
      isActive: 1,
      createdBy: this.userDet.empId,
    };
    // let duplicate = false;
    // if (this.stakeholderList != null && this.stakeholderList.length > 0) {
    //   for (const element of this.stakeholderList) {
    //     if (this.stakeHolderDet.id != element.id) {
    //       if (element.branchId == form.get('branchId').value[0].id && element.deptId == form.get('deptId').value[0].id && element.userTypeId == form.get('userTypeId').value[0].id && element.empId == form.get('empId').value[0].id) {
    //         duplicate = true;
    //         break;
    //       }
    //     }
    //   }
    // }
    // if (duplicate) {
    //   this.alertService.error('Stakeholder already exists');
    //   this.formSubmitLoader = false;
    //   return;
    // }
    let url: any = "";
    let msg: any = "";
    if (this.stakeHolderDet.id != 0) {
      req.id = this.stakeHolderDet.id;
      url = "apis/sm/updateUserType";
      msg = "Stakeholder updated successfully.";
    } else {
      url = "apis/sm/saveUserType";
      msg = "Stakeholder added successfully.";
    }
    console.log(req);
    if (url) {
      this.apiService.saveStakeholderData(url, req).subscribe(
        (res: any) => {
          this.formSubmitLoader = false;
          if (res.result) {
            this.alertService.success(msg);
            this.searchDet.addForm = false;
            this.modalService.dismissAll();
            this.getStakeholdersList();
          } else {
            if (res.statusCode == 100) {
              this.alertService.error(res.reason);
            } else {
              this.alertService.error(
                "Error occurred while submitting data. Please try again."
              );
            }
          }
        },
        (error: any) => {
          this.alertService.error(error);
          this.formSubmitLoader = false;
        }
      );
    } else {
      this.formSubmitLoader = false;
    }
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
        this.getCellList(this.deptId);
        this.resetFormField(this.stakeholderForm, "lineId");
      }
      if (type == "plant") {
        this.branchId = ev.id;
        this.searchDet.deptIds = [];
        this.getDepartmentList(this.branchId);
        if (this.searchDet.addForm) {
          console.log("inside");
          this.resetFormField(this.stakeholderForm, "deptId");
          this.resetFormField(this.stakeholderForm, "empId");
          this.getEmployeeData();
        }
      }
    } else {
      if (type == "plant") {
        if (this.searchDet) {
          this.departmentList = [];
          this.searchDet.departmentList = [];
          this.cellList = [];
          this.searchDet.cellList = [];
          this.resetFormField(this.filterData, "deptIds");
          this.resetFormField(this.stakeholderForm, "deptId");
          this.resetFormField(this.stakeholderForm, "lineId");
          this.searchDet.lineId = [];
        } else {
          this.resetFormField(this.stakeholderForm, "empId");
        }
      } else if (type == "dept") {
        this.resetFormField(this.stakeholderForm, "lineId");
        this.cellList = [];
        this.searchDet.cellList = [];
        this.searchDet.lineId = [];
      }
    }
  }
  /*
    Multi Select Dropdown onChange function
    Author: Mahesh W
    Date : 21 Aug 2023
  */
  onChangeAll(ev: any, type) {
    if (ev) {
      console.log("Select All action");
    } else {
      console.log("Unselect All action");
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

  /*
    Open Filter function
    Author: Mahesh W
    Date : 21 Aug 2023
  */
  filterModalOpen(modal) {
    this.searchDet.filterPopupOpen = true;
    this.clearPagination();
    if (!this.searchDet.filterFlag) {
      this.filterData.patchValue({
        branchId: [this.searchDet.plantList[0]],
        deptIds: this.searchDet.departmentList,
        // userTypeIds: []
      });
    }
    this.modalService.open(modal, {
      windowClass: "filterPopup",
    });
    this.modalService.open(modal, { windowClass: "filterPopup" }).result.then(
      (result) => {
        console.log(`Closed with: ${result}`);
        //this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        console.log(`Closed with:` + reason);
        if (reason == "Cross click") {
          this.searchDet.filterFlag = false;
          this.searchDet.filterPopupOpen = false;
          // this.getStakeholdersList();
        }
        //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }
  /*
    Apply filter function
    Author: Mahesh W
    Date : 21 Aug 2023  
  */
  submitFilterForm(form) {
    this.submitAttempted = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach((key) => {
        form.controls[key].markAsDirty();
      });
      return;
    }
    this.searchDet.filterFlag = true;
    this.searchDet.filterPopupOpen = false;
    this.getStakeholdersList();
    this.modalService.dismissAll();
  }

  /* 
    Remove Filter
    Author : Mahesh W
    Date : 21 Aug 2023
  */
  removeFilter() {
    // this.submitAttempted = false;
    this.filterData.reset();
    this.searchDet.branchId = [];
    this.searchDet.deptIds = [];
    this.searchDet.lineId = [];
    this.searchDet.userTypeIds = [];
    this.searchDet.filterFlag = false;
    this.searchDet.filterPopupOpen = false;
    this.stakeholderList = [];
    this.getDepartmentList(this.searchDet.plantList[0]);
    this.getStakeholdersList();
  }
  /*
    Edit Stakeholder Open Modal  
    Author: Mahesh W
    Date : 21 Aug 2023
  */
  updateStakeholder(modal, rec) {
    console.log(modal, rec);
    this.isEditing = true;

    // if (this.employeeList != null && this.employeeList.filter(x => x.branch.branchId == this.branchId[0].id).length > 0) {
    //   console.log('Exist Employee List');
    // } else {
    //   console.log("else")
    //   this.getEmployeeData();
    // }

    this.stakeHolderDet.id = rec.id;
    this.stakeholderForm.patchValue({
      branchId: [{ id: rec.branchId, name: rec.branchName }],
      deptId: [{ id: rec.deptId, name: rec.deptName }],
      lineId: [{ id: rec.lineId, name: rec.lineName }],
      userTypeId: [{ id: rec.userTypeId, name: rec.userType }],
      empId: [{ id: rec.empId, name: rec.empName }],
    });
    this.modalService.open(modal, {
      windowClass: "top",
    });
    this.getEmployeeData();
  }
  /*
    Delete Stakeholder Cofirmation alert  
    Author: Mahesh W
    Date : 21 Aug 2023
  */
  deleteStakeholder(rec) {
    Swal.fire({
      title: "Are You Sure!",
      text: "Do you want remove this stakeholder ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7044CD",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Remove It",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let reqbody = {
          id: rec.id,
        };
        this.apiService
          .deleteWorkstationDetails("apis/sm/deleteUserType", reqbody)
          .subscribe((res: any) => {
            if (res.result) {
              this.alertService.success("Stakeholder removed successfully");
              this.getStakeholdersList();
            } else {
              if (res.statusCode == 100) {
                this.alertService.error(res.reason);
              } else {
                this.alertService.error(
                  "Error occurred while removing data. Please try again"
                );
              }
            }
          });
      } else {
        console.log("Cancel request");
      }
    });
  }

  /* 
    Reset Form function
    Author: Mahesh W
    Date : 21 Aug 2023
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
  loadMore(ev) {
    this.stakeholderList = [];
    this.masterLoader = true;
    this.staticPagination = ev;
    this.getStakeholdersList();
  }
  /*
    Common function for set an array for dropdown
    Author: Mahesh W
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

  /* To close modal 
  @Author Saurabh salunke
* @Date August 31, 2023*/ closeFilterPopup() {
    this.filterData.reset();
    this.modalService.dismissAll();
  }

  /* Common function For Searching  
  @Author Saurabh salunke
* @Date August 31, 2023*/
  getSearchList(ev) {
    console.log(ev);
    // this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = "";
    }
    if (this.filterFlag) {
      this.getStakeholdersList();
    } else {
      this.getStakeholdersList();
    }
  }
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (
        fieldToSort === "dept" ||
        fieldToSort === "plant" ||
        fieldToSort === "cell"
      ) {
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
