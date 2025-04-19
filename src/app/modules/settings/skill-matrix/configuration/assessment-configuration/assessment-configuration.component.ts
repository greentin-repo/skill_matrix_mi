import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { SkillMatrixService } from '../../skill-matrix.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AlertService } from 'src/app/theme/shared/components';
import Swal from 'sweetalert2';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-assessment-configuration',
  templateUrl: './assessment-configuration.component.html',
  styleUrls: ['./assessment-configuration.component.scss']
})
export class AssessmentConfigurationComponent implements OnInit {
  masterLevelList: any[];
  isLevelListLoading: boolean = false;
  isGapListLoading: boolean = false;
  isEdit: boolean = false;
  plantList: any = [];
  noOfDays: any;
  modalTitle: string;
  userDet: any;
  searchDet: any = {};
  @Input() branchId: any;
  formdata: FormGroup;
  filterData: FormGroup;
  SingleDropdownSettings: IDropdownSettings = {};
  assessmentData: any = {};
  sorting: any;
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 0,
    listLength: 0
  }
  assessmentAssign: any;
  listLoading: boolean = false;
  isFormSubmitted: boolean = false;
  submitSpinner: boolean = false;
  isEditing: boolean = false;


  constructor(private skillMatrixService: SkillMatrixService,
    modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public alertService: AlertService
  ) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
   }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.branchId && !changes.branchId.firstChange) {
      this.getAssessmentNumberOfDays();
    }
  }
  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    this.formdata = this.fb.group({
      branchId: new FormControl('', Validators.required),
      noOfDays: new FormControl('', [Validators.required, this.noNegativeValidator,this.integerValidator]),
      skillLvlId: new FormControl('', Validators.required),
    });
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.getAccessiblePlantList();
    this.getMasterLevelList();
    this.getAssessmentNumberOfDays();
  }
 

  // You will get level list
  // simran
  // created date 27/09/2023
  getMasterLevelList() {
    this.isLevelListLoading = true
    this.skillMatrixService.getMasterCertificateData('apis/sm/getLevelList').subscribe((res: any) => {
      if (res.result) {
        //   if (res.dataList != null && res.dataList.length > 0) {
        //     this.masterLevelList = this.setArray(res.dataList, 'id', 'levelName');
        //     // this.searchDet.skillLvlId = [this.masterLevelList[0]];
        //   } else {
        //     this.masterLevelList = [];
        //   }
        // } else {
        //   this.masterLevelList = [];
        // }
        if (res.dataList != null && res.dataList.length > 0) {
          /* Use For Add Screen */
          this.masterLevelList = this.setArray(res.dataList, 'id', 'levelName');
          /* Use For Filter */
          this.searchDet.masterLevelList = this.setArray(res.dataList, 'id', 'levelName');
        } else {
          /* Use For Add Screen */
          this.masterLevelList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
          /* Use For Filter */
          this.searchDet.masterLevelList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      }
    })

  }

  // You will able to save assessment Number of days
  // simran
  // created date 27/09/2023
  saveOrUpdateAssessmentDays(form) {
    console.log(form)
    this.isFormSubmitted = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      // this.formSubmitLoader = false;
      return;
    }
    if (form.status == "VALID" && this.assessmentData.id == 0) {
      let reqBody =
      {
        "skillLevelId": form.get('skillLvlId').value[0].id,
        "branchId": form.get('branchId').value[0].id,
        "noOfDays": this.searchDet.noOfDaysEnter
      }
      console.log(reqBody);
      this.skillMatrixService.saveAssessmentNoDays('apis/sm/addAssessmentConfig', reqBody).subscribe((response: any) => {
        if (response.result) {
          this.alertService.success("Activity assessment gap(days) added successfully");
          this.getAssessmentNumberOfDays();
          this.searchDet.addForm = false;
          this.modalService.dismissAll();

        } else {
          if (response.statusCode == 100) {
            this.alertService.error(response.reason);
          } else {
            this.alertService.error('Error occurred while submitting data. Please try again.');
          }
        }
      })
    }
    else {
      let reqBody =
      {
        "skillLevelId": form.get('skillLvlId').value[0].id,
        "branchId": form.get('branchId').value[0].id,
        "noOfDays": this.searchDet.noOfDaysEnter,
        "id": this.assessmentData.id,
        "updatedBy":this.userDet.empId,
      }
      console.log(reqBody);
      this.skillMatrixService.saveAssessmentNoDays('apis/sm/updateAssessmentConfig', reqBody).subscribe((response: any) => {
        if (response.result) {
          this.alertService.success("Activity assessment gap(days) updated successfully");
          this.modalService.dismissAll();
          this.getAssessmentNumberOfDays()

        } else {
          if (response.statusCode == 100) {
            this.alertService.error(response.reason);
          } else {
            this.alertService.error('Error occurred while submitting data. Please try again.');
          }
        }
      })
    }
  }

  // You will able to open assessment Number of days modal
  // simran
  // created date 27/09/2023
  openNoOfDaysModal(modal, popupClass) {
    this.isEditing=false;
    this.modalTitle = "Add Gap Days"
    this.searchDet.branchId = '';
    this.searchDet.masterLevelData = '';
    this.searchDet.noOfDaysEnter='';
    this.resetForm();

    this.assessmentData.id = 0;
    // this.formdata.reset();
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }
  resetForm(){
    this.formdata.reset();
    this.isFormSubmitted = false
  }
  /*
      Get Accessible Plant List
      Author: simran
      Date : 27/09/2023
  */
  getAccessiblePlantList() {
    this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          /* Use For Add Screen */
          this.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
          /* Use For Filter */
          this.searchDet.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        } else {
          /* Use For Add Screen */
          this.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
          /* Use For Filter */
          this.searchDet.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      } else {
        /* Use For Add Screen */
        this.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        /* Use For Filter */
        this.searchDet.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
      // this.getDepartmentList(this.branchId[0]);
    })
  }
  /*
  Common function for set an array for dropdown
  Author: simran
  Date : 27/09/2023
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


  // You will able to update assessment Number of days modal
  // simran
  // created date 27/09/2023
  updateNoOfDays(modal, popupClass, assessmentData) {
    this.isEditing=true;
    this.modalTitle = "Update Gap Days"
    // this.assessmentData.noOfDaysEnter = assessmentData.noOfDays;
    this.assessmentData.id = assessmentData.id;
    // this.assessmentData.id = 3;
    console.log(assessmentData);
    this.searchDet.branchId= [{ id: assessmentData.branchId, name: assessmentData.branchName }];
    this.searchDet.noOfDaysEnter=assessmentData.noOfDays;
    this.searchDet.masterLevelData=[{ id: assessmentData.skillLevelId, name: assessmentData.levelName }]


    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }

  // You will able to delete no of days
  // simran
  // created date 27/09/2023
  removeNoOfDays(assessmentData) {
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want remove this assessment No. of days?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7044cd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Remove it',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let reqBody = {
          "id": assessmentData.id,
          "updatedBy": this.userDet.empId
        }
        this.skillMatrixService.removeNoOfDays('apis/sm/deleteAssessmentConfig', reqBody).subscribe((response: any) => {
          console.log(response)
          if (response.result) {
            this.alertService.success("Activity assessment gap(days) deleted successfully");
            this.getAssessmentNumberOfDays()
          } else {
            if (response.statusCode == 100) {
              this.alertService.error(response.reason);
            } else {
              this.alertService.error('Error occurred while removing data. Please try again');
            }
          }
        })
      } else { }
    })
  }

  // You will get list of number of assessment days
  // simran
  // created date 27/09/2023
  getAssessmentNumberOfDays() {

    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage,
      'orgId': this.userDet.organization.orgId,
    }

    if (this.searchDet.branchId != '') {
      req.branchId = this.searchDet.branchId;
    }
    if (this.branchId) {
      console.log(this.branchId[0].id);
      req.branchId = this.branchId[0].id;
    }

    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active;
        req.orderType = this.sorting.direction.toUpperCase();
      }
    }
    console.log(req);
    this.skillMatrixService.getGapReasonListData('apis/sm/getAssessmentConfigList', req).subscribe((response: any) => {
      if (response.result) {

        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.assessmentAssign = response.dataList;
          this.staticPagination.listLength = this.assessmentAssign.length;
        } else {
          this.assessmentAssign = [];
          this.staticPagination.listLength = this.assessmentAssign.length;
          this.staticPagination.total = this.assessmentAssign.length;
        }
        // this.assessmentAssign = response.dataList
      } else {
        this.assessmentAssign = [];
        this.listLoading = false;
        this.staticPagination.listLength = this.assessmentAssign.length;
        this.staticPagination.total = this.assessmentAssign.length;

      }
    })
  }

  // You will able to load more pagination pages
  // simran
  // created date 27/09/2023

  loadMore(ev: any) {
    console.log(ev)
    this.staticPagination = ev;

    // this.getAssessmentList();
    // setTimeout(() => {
    this.assessmentAssign = [];
    this.listLoading = true;
    //  }, 3000);
    this.getAssessmentNumberOfDays();
  }

  // You will able to sort
  // simran
  // created date 27/09/2023

  sortData(sort: Sort) {
    this.sorting = sort;
    this.getAssessmentNumberOfDays()
  }

  onChangeBranch(event: any) {
    console.log(event)
    this.searchDet.branchId = event.id;
    this.getAssessmentNumberOfDays();
  }

  /* To add validator for no of days
     @Author Saurabh salunke
    * @Date Oct 11, 2023
  */
  noNegativeValidator = (control: any) => {
    console.log(control)
    const value = control.value;
    if (value === 0) {
      return { zeroValue: true };
    }
    if (value < 0) {
      return { negativeValue: true };
    }
    return null;
  };
  integerValidator(control: FormControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (value !== '' && !Number.isInteger(value)) {
      return { 'notAnInteger': true };
    }
    return null;
  }


  /* Close filter modal popup
   @Author Saurabh salunke
  * @Date Oct 11, 2023
*/
  closeFilterPopup() {
    this.searchDet.branchId = [];
    this.searchDet.masterLevelData = [];
    this.assessmentData.noOfDaysEnter = [];
    this.formdata.reset();
    // this.formdata.get('branchId').markAsUntouched();
    // this.formdata.get('skillLvlId').markAsUntouched();
    // this.formdata.get('noOfDays').markAsUntouched();
    // this.formdata.get('noOfDays').markAsPristine();
    
    this.modalService.dismissAll();
  }
  getSortFunction(array, fieldToSort) {  
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "plant") {
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
