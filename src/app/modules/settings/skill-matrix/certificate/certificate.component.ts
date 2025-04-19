import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SkillMatrixService } from '../skill-matrix.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AlertService } from 'src/app/theme/shared/components';
import Swal from 'sweetalert2';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit {
  filterFlag: boolean = false;
  selectedDet: any = {};
  searchDet: any = {};
  formdata: FormGroup;
  isUploadSpinner: boolean = false;
  fileSelected: boolean = false;
  clickedLoadMore: boolean = false;
  uploadDataList: any;
  LevelList: any = [];
  certificateList: any = [];
  isUpload: boolean = false;
  newCertificateData: any = {};
  selectedCert: any = {};
  dataSpinner: any = [];
  userDet: any = {};
  listLoading: boolean = false;
  paginationLoading: boolean = false;
  selectedRecForModal: any;
  plantSelected: boolean = false;
  sorting: any;
  staticPagination: any = {
    total: 0,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 0
  }
  skillLevelSelected: boolean = false;
  isFileSelected: boolean = false;
  branchAccessList: any;
  singleDropdownSettings: { singleSelection: boolean; idField: string; textField: string; allowSearchFilter: boolean; closeDropDownOnSelection: boolean; };


  constructor(
    private modalService: NgbModal,
    private skillMatrixService: SkillMatrixService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    this.getLevelList();
    this.getMasterCertificateList();
    this.singleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.formdata = this.fb.group({
      skillLevel: ['', Validators.required],
      branch: ['', Validators.required],
      certificate: ['', Validators.required],

    });

    this.getBranchAccessList();
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
          this.LevelList = this.setArray(response.dataList, 'id', 'levelName');

        } else {
          this.LevelList = []
        }
      }
    })
  }
  /* Get Master Certificate List
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  getMasterCertificateList() {
    this.listLoading = true;

    if (this.staticPagination.page == 1) {
      this.staticPagination.offset = 0;
    } else {
      this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    }
    let req: any = {
      "orgId": this.userDet.organization.orgId,
      'offset': this.staticPagination.offset,
      'limit': this.staticPagination.itemsPerPage
    }
    if (this.sorting) {
      if (this.sorting.direction != "") {
        req.colName = this.sorting.active,
          req.orderType = this.sorting.direction.toUpperCase();

      }
    }
    if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
      req.search = this.searchDet.searchInput;
    }
    console.log(req)
    this.skillMatrixService.getCertificateList('apis/sm/getMasterCertificateList', req).subscribe((response: any) => {
      this.listLoading = false;
      console.log(response);
      if (response.result) {
        if (this.staticPagination.page == 1) {
          this.staticPagination.total = response.totalCount;
          this.staticPagination.totalPages = Math.ceil(response.totalCount / this.staticPagination.itemsPerPage);
        }
        if (response.dataList != null && response.dataList.length > 0) {
          this.certificateList = response.dataList;
          this.staticPagination.listLength = this.certificateList.length;
        } else {
          this.certificateList = []
          this.staticPagination.listLength = this.certificateList.length;
        }
      }
    }, (error: any) => {
      this.certificateList = []
      this.listLoading = false;

    })
  }
  /* Preview Selected Certificate
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  previewCertificate(data, certificateModalForSettings) {
    this.selectedRecForModal = data;
    this.modalService.open(certificateModalForSettings, {
      windowClass: 'bottom'
    });
  }
  /* open filter modal popup
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  filterModalOpen(FilterModal) {
    console.log("In filter");

    if (!this.filterFlag) {
      // this.filterData.reset();
    }
    // this.getInterventions();
    this.modalService.open(FilterModal, {
      windowClass: 'filterPopup',
    });
  }
  /* reset selected file or remove selected file
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  resetFile(ev: any) {
    ev.value = "";
    this.newCertificateData.imgURL = undefined;
    this.isUpload = false;
    this.fileSelected = false
  }
  /* read or store selected file from localstorage
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  handleFileInput(files: FileList) {
    if (files.length === 0) {
      // File is not selected, show error
      this.isFileSelected = true;
      return;
    }
    if (files.length === 0)
      return;

      const file = files[0];

    if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
        // Display an error message for unsupported file types
        this.isFileSelected = true;
        this.alertService.error('Only JPG or PNG files is allowed.');
        return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.newCertificateData.imgURL = reader.result;
    }
    this.uploadDataList = files.item(0);
    this.fileSelected = true;
  }
  /* show add new certificate modal popup
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  addCertificate(modal) {
    this.uploadDataList = undefined;
    this.fileSelected = false;
    this.isUploadSpinner = false;
    this.formdata.reset();
    this.modalService.open(modal, {
      windowClass: 'right',
    });
  }
  /* save certificate 
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  submitCertificate(form) {
    console.log(form)

    this.isUploadSpinner = true;
    const formData: FormData = new FormData();

    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
        this.isUploadSpinner = false;
      });
      return;
    }
    formData.append('branchId', form.value.branch[0].id)
    formData.append('skillLevelId', form.value.skillLevel[0].id);
    formData.append('certificatePath', this.uploadDataList);
    this.skillMatrixService.addNewCertificate('apis/sm/saveMasterCertificate', formData).subscribe((res: any) => {
      this.isUploadSpinner = false;
      if (res.result) {
        this.alertService.success("Certificate uploaded successfully");
        this.modalService.dismissAll();
        this.newCertificateData.skillLvl = []
        this.getMasterCertificateList();
      } else {
        if (res.statusCode == 100) {
          this.alertService.error(res.reason);
        } else {
          this.alertService.error('Error occurred while uploading file. Please try again');
        }
      }
    })
  }
  /* save certificate 
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  deleteCertificate(data) {
    console.log(data)
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this certificate ?',
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
          "certificateId": data.certificateId,
          "updatedBy": this.userDet.empId
        }
        this.skillMatrixService.deleteCertificate('apis/sm/deleteMasterCertificate', reqbody).subscribe((data: any) => {
          this.dataSpinner[data.certificateId] = false;
          if (data.result) {
            this.alertService.success("Certificate removed successfully");
            this.getMasterCertificateList();
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
        this.dataSpinner[data.certificateId] = false;
      }
    });
  }
  /* Common function For Searching  
@Author Saurabh salunke
* @Date August 31, 2023*/
  getSearchList(ev) {
    // this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.filterFlag) {
      this.getMasterCertificateList();
    } else {
      this.getMasterCertificateList();
    }
  }
  modalOpen(modal, data) {

  }

  /* Sorts certificate list 
    @Author Saurabh salunke
   * @Date August 29, 2023
 */
  sortData(sort: Sort) {
    this.sorting = sort;
    this.getMasterCertificateList()
  }

  /* 
  pagination for certificate list
   @Author Saurabh salunke
  *@Date August 29, 2023
 */
  loadMore(ev: any) {
    this.staticPagination = ev;
    this.certificateList = []
    this.listLoading = true;
    this.getMasterCertificateList();
  }

  /* 
  to clear data from filter
   @Author Saurabh salunke
  *@Date August 29, 2023
 */
  closeCertificateModal() {

    this.formdata.reset();
    this.newCertificateData.skillLvl = [];
    this.formdata.get('skillLevel').markAsUntouched();
    this.formdata.get('branch').markAsUntouched();
    this.formdata.get('certificate').markAsUntouched();
    this.modalService.dismissAll();
  }

  /* 
 to get branchList
  @Author Saurabh salunke
 *@Date oct 1, 2023
*/
  getBranchAccessList() {
    this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId)
      .subscribe((res: any) => {
        console.log(res);
        if (res.result) {
          if (res.branchAccessList != null && res.branchAccessList.length > 0) {
            this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');


          } else {
            this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
          }
        } else {
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }

      });
  }

  /*
    Common function for set an array for dropdown
    @Author Saurabh salunke
*@Date oct 1, 2023
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
  getSortFunction(array, fieldToSort) {  
    if (array && Array.isArray(array) && array.length > 0) {
      if ( fieldToSort === "dept" || fieldToSort === "level" ) {
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
