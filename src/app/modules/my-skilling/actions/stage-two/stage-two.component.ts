import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActionsService } from '../actions.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Sort } from '@angular/material/sort';
import { AlertService } from 'src/app/theme/shared/components';
import { CONSTANT } from '../actions.constant';

@Component({
  selector: 'app-stage-two',
  templateUrl: './stage-two.component.html',
  styleUrls: ['./stage-two.component.scss'],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class StageTwoComponent implements OnInit {

  @Input() actionDet: any;
  mainTab = 1;
  filterFlag: boolean = false;
  submitFormLoader: boolean = false;
  submitSpinner: boolean = false;
  searchDet: any = {
    searchFlag: false,
    searchInput: '',
    masterSelected: ''
  }
  submitLoading: boolean = false;
  //enableCompletedBtn: boolean = false;
  enableSubmitBtn: boolean = false;

  sorting: any;
  listLoading: boolean = false;
  trainingProdDetails: any = {};
  completedBtnStatus: boolean = false;
  notCompletedBtnStatus: boolean = false;
  userDet: any = {};
  constant: any = {};
  isDisableStatus: boolean = false;

  constructor(
    private actionsService: ActionsService,
    private modalService: NgbModal,
    private alertService: AlertService,
    @Inject('Constant') Constant: any
  ) {
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    console.log(this.actionDet)
    this.getTrainingList();
  }

  /*
    @DESC : Selects tab
    @Author: Jayshri Kolase
    @Date : 06 Sep 2023
  */
  setMainTab(tabId) {
    this.mainTab = tabId;
    if (this.mainTab == 1) {
      this.getTrainingList();
    }
  };

  /*
    @DESC : Returns selected tab id
    @Author: Jayshri Kolase
    @Date : 06 Sep 2023
  */
  isSetMainTab = function (tabId) {
    return this.mainTab === tabId;
  };

  /*
    @DESC : Calls api and show training task list in table
    @Author: Jayshri Kolase
    @Date : 06 Sep 2023
  */
  getTrainingList() {
    this.trainingProdDetails.auditPointList = [];
    let reqBody: any = {};
    this.listLoading = true;
    reqBody = {
      "skillingId": this.actionDet.skillingId,
      "skillingAuditId": this.actionDet.auditId //auditId
    }
    this.actionsService.getTrainingList(reqBody).subscribe((response: any) => {
      this.listLoading = false;
      if (response.result) {
        if (response.actionDetails) {
          if (response.actionDetails.auditPointList != null && response.actionDetails.auditPointList) {
            for (let index = 0; index < response.actionDetails.auditPointList.length; index++) {
              response.actionDetails.auditPointList[index].selectedStatus = '';
            }

          } else {
            this.trainingProdDetails.auditPointList = []
          }
          this.trainingProdDetails = response.actionDetails;
        } else {
          this.trainingProdDetails.auditPointList = []
        }
      } else {
        this.trainingProdDetails.auditPointList = []
      }
    }, (error: any) => {

    })
  }

  /*
    @DESC : Sort table
    @Author: Jayshri Kolase
    @Date : 06 Sep 2023
  */
  sortData(sort: Sort) {
    this.sorting = sort;
    if (this.mainTab == 1) {
      this.getTrainingList();
    }
  }

  onChangeComplete(event: any, data: any) {
    if (event) {
      if (this.trainingProdDetails.auditPointList != null && this.trainingProdDetails.auditPointList.length > 0) {
        // this.trainingProdDetails.auditPointList.forEach(element => {
        //   if (element.id == data.id) {
        //     element.selectedStatus = event.target.value;
        //   }
        // });
        let selectStatusLength = this.trainingProdDetails.auditPointList.filter(x => x.selectedStatus == event.target.value).length;
        this.searchDet.masterSelected = (selectStatusLength == this.trainingProdDetails.auditPointList.length) ? event.target.value : '';
      }

      //this.isCompletedAllSelected();
      this.isAllSelected();
    }
  }
  onChangeCompleteAll(event: any) {
    if (event) {
      if (this.trainingProdDetails.auditPointList != null && this.trainingProdDetails.auditPointList.length > 0) {
        this.trainingProdDetails.auditPointList.forEach(element => {
          element.selectedStatus = event.target.value;
        });
        this.searchDet.masterSelected = event.target.value;
      }

      //this.isCompletedAllSelected();
      this.isAllSelected();
    }
  }

  // isCompletedAll() {
  //   this.completedBtnStatus = true;

  //   this.trainingProdDetails.auditPointList.forEach(element => {
  //     if (element.status !== "COMPLETED") {
  //       this.completedBtnStatus = false;
  //     }
  //     else {
  //       element.completed = "COMPLETED";
  //     }
  //   });
  // }

  // isCompletedAllSelected() {
  //   this.enableCompletedBtn = true;

  //   this.trainingProdDetails.auditPointList.forEach(element => {
  //     if (element.selectedStatus !== "COMPLETED") {
  //       this.enableCompletedBtn = false;
  //       return;
  //     }
  //   });
  // }

  isCompletedAllSelected() {
    let flag = true;
    this.trainingProdDetails.auditPointList.forEach(element => {
      if (element.selectedStatus != "COMPLETED") {
        flag = false;
      }
    });

    return flag;
  }

  isAllSelected() {
    this.enableSubmitBtn = true;

    this.trainingProdDetails.auditPointList.forEach(element => {
      if (element.selectedStatus !== "COMPLETED" && element.selectedStatus !== "NOT COMPLETED") {
        this.enableSubmitBtn = false;
        return;
      }
    });
  }

  submitStageTwoStatus() {
    if (!this.enableSubmitBtn) {
      this.alertService.error("Please select status of each row.");
      return;
    }

    this.submitLoading = true;
    let auditList: any = [];
    this.trainingProdDetails.auditPointList.forEach(element => {
      auditList.push({
        id: element.pointAuditId,
        status: element.selectedStatus, //element.status
        skillingAuditId: element.skillingAuditId, //main skillingAuditId
        ojtPointId: element.ojtPointId, //
        checksheetPointId: element.checksheetPointId,
        // comment: "Nice 1"
      });
    });
    if (auditList != null && auditList.filter(x => x.status == '').length == this.trainingProdDetails.auditPointList.length) {
      this.submitFormLoader = false;
      this.alertService.error('Please select status of each row.');
      return;
    }
    if (this.trainingProdDetails.comment == null || this.trainingProdDetails.comment == undefined || this.trainingProdDetails.comment == '') {
      this.submitLoading = false;
      this.alertService.error('Please enter comment.');
      return;
    }
    let reqBody: any;
    reqBody = {
      // empId: 36,
      trainerEmpId: this.trainingProdDetails.trainerEmpId,
      oeEmpId: this.trainingProdDetails.oeEmpId,
      branchId: this.trainingProdDetails.branchId,
      skillLevelId: this.trainingProdDetails.levelId,
      deptId: this.trainingProdDetails.deptId,
      lineId: this.trainingProdDetails.lineId,
      workstationId: this.trainingProdDetails.workstationId,
      stageId: this.trainingProdDetails.stageId,
      skillingAuditId: this.trainingProdDetails.skillingAuditId,
      status: this.isCompletedAllSelected() ? "COMPLETED" : "NOT COMPLETED",
      comment: this.trainingProdDetails.comment,
      skillingId: this.trainingProdDetails.skillingId,
      dayNo: this.trainingProdDetails.dayNo,
      checkSheetId: this.trainingProdDetails.checksheetId,
      skillingChecksheetId: this.trainingProdDetails.skillingChecksheetId,
      csPointAuditList: auditList,
      tlEmpId: this.trainingProdDetails.tlEmpId,
      ojtRegiId: this.trainingProdDetails.ojtRegiId,

    }

    console.log(reqBody);

    this.actionsService.submitStageTwoStatus(reqBody).subscribe((data: any) => {
      this.submitLoading = false;
      if (data.result) {
        this.alertService.success("Activity Submitted Successfully.");
        this.modalService.dismissAll();
      } else {
        if (data.statusCode == 100) {
          this.alertService.error(data.reason);
        } else {
          this.alertService.error("Error occurred while submitting data. Please try again");
        }
      }
    }, (error: any) => {
      this.submitLoading = false;
    })
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
