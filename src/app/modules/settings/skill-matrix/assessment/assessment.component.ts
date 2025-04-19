import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { AssessmentService } from "./assessment.service";
import { Router } from "@angular/router";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import Swal from "sweetalert2";
import { AlertService } from "src/app/theme/shared/components";
import { Sort } from "@angular/material/sort";
@Component({
  selector: "app-assessment",
  templateUrl: "./assessment.component.html",
  styleUrls: ["./assessment.component.scss"],
})
export class AssessmentComponent implements OnInit {
  loggedInEmpDet: any = {};
  listLoading: boolean = false;
  searchDet: any = {};
  filterData: FormGroup;
  assessementList: any = [];
  plantList: any = [];
  masterLevelList: any = [];
  dataSpinner: any = [];
  sorting: any;
  filterFlag: boolean = false;
  isUploadSpinner: boolean = false;
  fileSelected: boolean = false;
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0,
  };
  assessmentList: any = {};
  showAssessmentList: any;
  isUpload: boolean = false;
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  searchInput: any;
  submitAttempted: boolean = false;
  excelErrorList: any;
  Constant: any = {};
  constant: any = {};
  departmentList: any[];
  branchId: any = [];
  cellList: any[];
  deptId: any = [];
  lineId: any = [];
  workforceList: any[];
  userDet: any = [];
  constructor(
    private router: Router,
    public apiService: AssessmentService,
    public modalConfig: NgbModalConfig,
    public modalService: NgbModal,
    public fb: FormBuilder,
    public alertService: AlertService,
    @Inject("Constant") Constant: any
  ) {
    modalConfig.backdrop = "static";
    modalConfig.keyboard = false;
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.loggedInEmpDet = JSON.parse(localStorage.getItem("userDet"));
    console.log(this.loggedInEmpDet);
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
      closeDropDownOnSelection: false,
    };
    this.filterData = this.fb.group({
      branchId: new FormControl("", Validators.required),
      skillLvlId: new FormControl(""),
      deptIds: new FormControl(""),
      cell: new FormControl(""),
      workstation: new FormControl(""),
    });
    this.getMasterSkillLevelList();
    this.getAccessiblePlantList();
  }

  /*
      Get Accessible Plant List
      Author: Mahesh W
      Date : 22 Aug 2023
  */
  getAccessiblePlantList() {
    this.apiService
      .getBranchAccessList(
        "getBranchAccessSetupByEmpId/" +
        this.loggedInEmpDet.organization.orgId +
        "/" +
        this.loggedInEmpDet.empId
      )
      .subscribe((res: any) => {
        if (res.result) {
          if (res.branchAccessList != null && res.branchAccessList.length > 0) {
            this.plantList = this.setArray(
              res.branchAccessList,
              "branchId",
              "branchName"
            );
          } else {
            this.plantList = [
              {
                id: this.loggedInEmpDet.branch.branchId,
                name: this.loggedInEmpDet.branch.name,
              },
            ];
          }
        } else {
          this.plantList = [
            {
              id: this.loggedInEmpDet.branch.branchId,
              name: this.loggedInEmpDet.branch.name,
            },
          ];
        }
        // this.searchDet.branchId = [this.plantList[0]];
        this.getAssessmentList();
      });
  }
  /*
      Get Master Level List
      Author: Mahesh W
      Date : 22 Aug 2023
  */
  getMasterSkillLevelList() {
    this.apiService
      .getMasterLevelList("apis/sm/getLevelList")
      .subscribe((res: any) => {
        if (res.result) {
          if (res.dataList != null && res.dataList.length > 0) {
            this.masterLevelList = this.setArray(
              res.dataList,
              "id",
              "levelName"
            );
            // this.searchDet.skillLvlId = [this.masterLevelList[0]];
          } else {
            this.masterLevelList = [];
          }
        } else {
          this.masterLevelList = [];
        }
      });
  }
  /* 
      Create New Assessment
      @Author : Mahesh W
      @Date : 22 Aug 2023
  */
  goAssessmentDetailPage(url: string, data, flag) {
    if (data == "") {
      data = {
        isEditable: true,
        assessmentId: 0,
        isUpdate: false,
      };
    } else {
      // data.assessmentId = data.assessmentId
      data.isUpdate = true;
      data.isEditable = true;
    }
    data.isEditable = flag;
    let tmpData = Object.assign({}, data, {
      tmpPagination: this.staticPagination,
      plantList: this.plantList,
      masterLevelList: this.masterLevelList,
    });
    if (url) {
      if (tmpData != undefined) {
        localStorage.setItem("selectedActionData", JSON.stringify(tmpData));
      } else {
        localStorage.removeItem("selectedActionData");
      }
      this.router.navigateByUrl(url);
    }
  }
  getAssessmentList() {
    this.assessementList = [];
    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset =
        (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      orgId: this.loggedInEmpDet.organization.orgId,
      offset: this.staticPagination.offset,
      limit: this.staticPagination.itemsPerPage,
    };
    if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0) {
      req.branchId = this.searchDet.branchId[0].id;
    }
    else {
      req.branchId = this.loggedInEmpDet.branch.branchId;
    }
    if (
      this.searchDet.skillLvlId != null &&
      this.searchDet.skillLvlId.length > 0
    ) {
      req.skillLvlId = this.searchDet.skillLvlId[0].id;
    }
    if (
      this.searchDet.workstationIds != null &&
      this.searchDet.workstationIds.length > 0
    ) {
      // req.searchDet.workstationIds = this.searchDet.workstationIds[0].id;
      req.workstationIds = this.getIDsArray(this.searchDet.workstationIds);
    }
    if (this.searchDet.deptIds != null && this.searchDet.deptIds.length > 0) {
      // for (let i = 0; i < this.searchDet.deptIds.length; i++) {
      console.log(this.searchDet.deptIds);
      req.deptId = this.searchDet.deptIds[0].id;
      // }
    }
    if (this.searchDet.lineId != null && this.searchDet.lineId.length > 0) {
      req.lineIds = this.getIDsArray(this.searchDet.lineId);
    }
    if (this.searchDet.searchInput && this.searchDet.searchInput != "") {
      req.search = this.searchDet.searchInput;
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active;
        req.orderType = this.sorting.direction.toUpperCase();
      }
    }
    this.apiService
      .getAssessmentList("apis/sm/getAssessmentList", req)
      .subscribe((response: any) => {
        if (response.result) {
          // this.listLoading = false;
          if (this.staticPagination.page == 1) {
            this.staticPagination.total = response.totalCount;
            this.staticPagination.totalPages = Math.ceil(
              response.totalCount / this.staticPagination.itemsPerPage
            );
          }
          if (response.dataList != null && response.dataList.length > 0) {
            this.assessementList = response.dataList;
            console.log(this.assessementList);
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
      });
  }
  // resetFormField(form, keyName) {
  //   Object.keys(form.controls).forEach((key) => {
  //     if (key == keyName) {
  //       form.get(keyName).reset();
  //       form.get(keyName).markAsPristine();
  //       form.get(keyName).markAsUntouched();
  //     }
  //   });
  // }

  /* 
    Load More Pagination next page Data
    @Author : Mahesh W
    @Date : 23 Aug 2023
  */
  loadMore(ev: any) {
    console.log(ev);
    this.staticPagination = ev;

    // this.getAssessmentList();
    // setTimeout(() => {
    this.assessementList = [];
    this.listLoading = true;
    //  }, 3000);
    this.getAssessmentList();
  }

  /* 
    Delete Assessment 
    @Author: Mahesh W
    @Date : 23 Aug 2023
  */
  deleteAssessment(x) {
    this.dataSpinner[x.assessmentId] = true;
    Swal.fire({
      title: "Are You Sure!",
      text: "Do you want to remove this assessment ?",
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
          assessmentId: x.assessmentId,
        };
        this.apiService
          .deleteAsssessment("apis/sm/deActiveAssessment", reqbody)
          .subscribe((data: any) => {
            this.dataSpinner[x.assessmentId] = false;
            if (data.result) {
              this.alertService.success("Assessment removed successfully.");
              this.getAssessmentList();
            } else {
              if (data.statusCode == 100) {
                this.alertService.error(data.reason);
              } else {
                this.alertService.error(
                  "Error occurred while removing data. Please try again"
                );
              }
            }
          });
      } else {
        this.dataSpinner[x.assessmentId] = false;
      }
    });
  }


  /*
      Open Filter function
      Author: Mahesh W
      Date : 21 Aug 2023
  */
  filterModalOpen(modal) {
    this.clearPagination();
    this.modalService.open(modal, {
      windowClass: "filterPopup",
    });
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
    if (this.searchDet.branchId == null && this.searchDet.skillLvlId == null) {
      this.filterFlag = false;
    } else {
      this.filterFlag = true;
    }

    this.getAssessmentList();
    this.modalService.dismissAll();
  }
  /* 
    Remove Filter
    Author : Mahesh W
    Date : 21 Aug 2023
  */
  removeFilter() {
    this.submitAttempted = false;
    this.filterData.patchValue({
      branchId: [],
      skillLvlId: [],
      // branchId: [this.plantList[0]],
      // skillLvlId: [this.masterLevelList[0]]
    });
    this.searchDet.branchId = [];
    this.searchDet.skillLvlId = [];
    this.searchDet.deptIds = [];
    this.searchDet.workstationIds = [];
    this.searchDet.lineId = [];
    // this.searchDet.branchId = [this.plantList[0]];
    // this.searchDet.skillLvlId = [this.masterLevelList[0]];
    this.filterFlag = false;
    this.getAssessmentList();
  }
  /*
     Single Select Dropdown onChange function
     Author: Mahesh W
     Date : 21 Aug 2023
  */
  // onChange(ev: any, type) {
  //   if (ev) {
  //     console.log('Select plant');
  //   } else {
  //     console.log('Unselect plant');
  //   }
  // }
  onChange(ev: any, type) {
    console.log("Hello");
    // if (ev) {
    //   console.log(ev);
    //   if (type == "plant") {
    //     this.branchId = ev.id;
    //     console.log(this.branchId);
    //     this.searchDet.deptIds = [];
    //     // this.resetFormField(this.filterData, "deptId");
    //     // this.resetFormField(this.filterData, "cellLineId");
    //     // this.resetFormField(this.filterData, "workstationId");
    //     this.getDepartmentList(this.branchId);
    //   }
    //   if (type == "dept") {
    //     console.log(ev)
    //     this.cellList = [];
    //     this.deptId = ev.id;
    //     this.searchDet.cell = [];
    //     // this.resetFormField(this.filterData, "cellLineId");
    //     // this.resetFormField(this.filterData, "workstationId");
    //     this.getCellList();
    //   }

    //   if(type == "cell"){
    //     console.log(ev);
    //   //   ev.forEach((item) => {
    //   //     this.lineId = item.id;
    //   // });
    //   console.log(ev);
    //   this.lineId = ev.id;
    //     this.searchDet.work = [];
    //     // this.resetFormField(this.filterData, "workstationId");
    //     this.getWorkforceList(this.lineId);
    //   }
    // } else {
    //   if (type == "plant") {
    //     // if (this.searchDet) {
    //     //   this.departmentList = [];
    //     //   this.searchDet.departmentList = [];
    //     // this.cellList = [];
    //     // this.searchDet.cellList = [];
    //     // this.resetFormField(this.filterData, "deptIds");
    //     // this.resetFormField(this.stakeholderForm, "deptId");
    //     // this.resetFormField(this.stakeholderForm, 'lineId');
    //     // this.searchDet.lineId = [];
    //     // }
    //   } else if (type == "dept") {
    //     // this.resetFormField(this.stakeholderForm, 'lineId');
    //     // this.cellList = [];
    //     // this.searchDet.cellList = [];
    //     // this.searchDet.lineId = [];
    //   }
    // }

    if (ev) {
      console.log(ev);
      if (type == "dept") {
        this.cellList = [];

        this.deptId = ev.id;
        this.searchDet.lineId = [];
        // this.resetFormField(this.filterData, "cell");
        // this.resetFormField(this.filterData, "workstation");
        this.getCellList(this.deptId);

        // this.resetFormField(this.filterData, 'lineId')
      }
      if (type == "plant") {
        console.log(ev);
        this.branchId = ev.id;
        this.searchDet.deptIds = [];
        // this.resetFormField(this.filterData, "deptIds");
        // this.resetFormField(this.filterData, "cell");
        // this.resetFormField(this.filterData, "workstation");
        this.getDepartmentList(this.branchId);
        if (this.searchDet.addForm) {
          console.log("inside");
          // this.resetFormField(this.filterData, "deptId");
        }
      }
      if (type == "cell") {
        console.log(ev);
        this.lineId = ev.id;
        this.searchDet.workstationIds = [];
        // this.searchDet.work = [];
        // this.resetFormField(this.filterData, "workstation");
        this.getWorkforceList(this.lineId);
      }
    } else {
      if (type == "plant") {
        if (this.searchDet) {
          this.departmentList = [];
          this.searchDet.departmentList = [];
          this.cellList = [];
          this.searchDet.cellList = [];
          this.searchDet.deptIds = [];
          // this.resetFormField(this.filterData, "deptIds");
          // this.resetFormField(this.stakeholderForm, "deptId");
          // this.resetFormField(this.stakeholderForm, 'lineId');
          this.searchDet.lineId = [];
        } else {
          // this.resetFormField(this.stakeholderForm, "empId");
        }
      } else if (type == "dept") {
        // this.resetFormField(this.stakeholderForm, 'lineId');
        // this.cellList = [];
        this.searchDet.cellList = [];
        this.searchDet.lineId = [];
      } else if (type == "cell") {
        this.lineId = [];
        this.workforceList = [];
        // this.getWorkforceList(this.lineId);
      }
    }
  }
  onChangeAll(ev: any, type) {
    if (ev) {
      if (type == "cell") {
        this.lineId = ev.map(item => item.id);
        this.searchDet.workstationIds = [];
        this.getWorkforceList(this.lineId);
      }
    } else {
      if (type == "cell") {
        this.lineId = [];
        this.workforceList = [];
      }
    }
  }
  /* 
      Reset Form function
      Author: Mahesh W
      Date : 21 Aug 2023
  */
  resetFormField(form, keyName) {
    Object.keys(form.controls).forEach((key) => {
      if (keyName != "" && key == keyName) {
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
  sortData(sort: Sort) {
    this.sorting = sort;
    this.getAssessmentList();
  }
  /*
      Common function for searching
      Author: Simran
      Date : 07/09/2023
  */
  getSearchList(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = "";
      this.getAssessmentList();
    } else {
      this.getAssessmentList();
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

  fileToUpload: File = null;
  handleFileInput(files: FileList) {
    if (files.length === 0) return;
    this.fileToUpload = files.item(0);
    this.fileSelected = true;
  }

  uploadAssessmentDetails(content) {
    this.isUploadSpinner = true;
    const formData: FormData = new FormData();
    if (this.fileToUpload == undefined || this.fileToUpload == null) {
      this.alertService.error("Please select file");
      this.isUploadSpinner = false;
      return;
    }

    formData.append("branchId", this.loggedInEmpDet.branch.branchId);
    formData.append("title", "ASSESSMENT");
    formData.append("orgId", this.loggedInEmpDet.organization.orgId);
    formData.append("createdBy", this.loggedInEmpDet.empId);
    formData.append("fileName", "ASSESSMENT");
    formData.append("excel", this.fileToUpload);

    this.apiService
      .uploadAssessmentData("apis/sm/uploadAssessments", formData)
      .subscribe((data: any) => {
        this.isUploadSpinner = false;
        console.log(data);
        if (data.result) {
          console.log(data);
          this.alertService.success("Assessment uploaded successfully.");
          if (this.filterFlag) {
            this.getAssessmentList();
          } else {
            this.getAssessmentList();
          }
          this.isUpload = false;
          this.fileSelected = false;
        } else {
          if (data.statusCode == 500) {
            console.log("500")
            this.alertService.error("Oops! Something went wrong");
          }
          else if (data.statusCode == 100) {
            if (data.responseData) {
              if (data.responseData.errorInSheet) {
                if (data.responseData.errorList != null && data.responseData.errorList.length > 0) {
                  this.excelErrorList = data.responseData.errorList;
                  this.modalService.open(content, {
                    windowClass: "errorListClass",
                  });
                  if (data.statusCode == 500) {
                    console.log("500")
                    this.alertService.error("Oops! Something went wrong");
                  }
                }
              }
              if (data.responseData.reason) {
                this.alertService.error(data.responseData.reason);
                if (data.statusCode == 500) {
                  this.alertService.error("Oops! Something went wrong");
                }
              }
            }
            else {
              this.alertService.error(data.reason);
            }
          } else {
            this.alertService.error(
              "Error occurred while upload file. Please try again"
            );

          }
        }
      });
  }
  getSortFunction(array, fieldToSort) {
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

  getDepartmentList(branch) {
    this.apiService
      .getDepartmentByBranch("getdepartmentlistbybranchid/" + branch)
      .subscribe((res: any) => {
        if (res.result) {
          console.log(res);
          if (res.deptList != null && res.deptList.length > 0) {
            /* Use For Add Screen */
            this.departmentList = this.setArray(
              res.deptList,
              "deptId",
              "deptName"
            );
            // this.departmentList = this.sortFunction(this.departmentList, "deptName");
            this.searchDet.dept = [this.departmentList[0]];
            console.log(this.departmentList);
          } else {
            this.searchDet.departmentList = [];
          }
        } else {
          this.searchDet.departmentList = [];
        }
      });
  }
  getCellList(data) {
    var req: any = {
      branchId: this.branchId,
      // deptId:this.searchDet.deptId
      deptId: data,
    };
    this.apiService
      .getCellList("apis/sm/getCellList", req)
      .subscribe((response: any) => {
        if (response.result) {
          if (response.dataList != null && response.dataList.length > 0) {
            this.cellList = this.setArray(
              response.dataList,
              "lineId",
              "lineName"
            );
            // this.cellList = this.sortFunction( this.cellList,"lineName");
            console.log(this.cellList);
            // this.searchDet.cell = [this.cellList[0]];
            console.log(this.searchDet.cell);
          } else {
            this.cellList = [];
          }
        } else {
          this.cellList = [];
        }
      });
  }
  getWorkforceList(data) {
    console.log(this.searchDet.workstationIds);
    console.log(this.searchDet.lineId);

    let req: any = {
      // branchId: this.searchDet.branchId,
      // orgId:this.loggedInEmpDet.organization.orgId,
      // deptId: this.searchDet.deptId,
      // lineIds: [this.searchDet.lineIds]
      branchId: this.branchId,
      orgId: this.loggedInEmpDet.organization.orgId,
      deptId: this.deptId,
      lineIds: Array.isArray(data) ? data : [data],
    };
    console.log(req);
    this.apiService
      .getWorkforceDeploymentData("apis/sm/getWorkstationList", req)
      .subscribe((res: any) => {
        if (res.result) {
          console.log(res);
          if (res.dataList != null && res.dataList.length > 0) {
            this.workforceList = this.setArray(
              res.dataList,
              "id",
              "workstation"
            );
            // this.workforceList = this.sortFunction( this.workforceList,"workstation");
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
    Common function For get Ids from array
    Author: Simran
    Date : 28/10/2023
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
  closeFilterPopup() {
    this.submitAttempted = false;
    this.searchDet.branchId = [];
    this.searchDet.deptIds = [];
    this.searchDet.lineId = [];
    this.searchDet.workstationIds = [];
    this.searchDet.skillLvlId = [];
    this.departmentList = [];
    this.modalService.dismissAll();
  }
}
