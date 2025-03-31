import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActionsService } from '../actions.service';
import { Sort } from '@angular/material/sort';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/theme/shared/components';
import { CONSTANT } from '../actions.constant';
import { error } from 'console';
import * as moment from 'moment';

@Component({
  selector: 'app-stage-one',
  templateUrl: './stage-one.component.html',
  styleUrls: ['./stage-one.component.scss'],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class ActionDetComponent implements OnInit {

  @Input() actionDet: any;
  mainTab = 1;
  filterFlag: boolean = false;
  submitLoading: boolean = false;
  empIdFromUserTypeList: any;
  enableCompletedBtn: boolean = false;
  searchDet: any = {
    searchFlag: false,
    searchInput: '',
    masterSelected: ''
  }

  sorting: any;
  listLoading: boolean = false;
  trainingProdDetails: any = [];
  completedBtnStatus: boolean = false;
  notCompletedBtnStatus: boolean = false;
  userDet: any = {};
  isDisableStatus: boolean = false;
  constant: any = {};
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
    this.getTrainingList();
  }

  /*
    @DESC : Compares Training Date with current date, if less then enables select status dropdown.
    @Author: Shashi
    @Date : 21 Sept 2023
  */
  enableSelectStatusOption(assignedDate: any) {
    let currentDate = (moment(new Date())).format('DD-MMM-YYYY')
    if (assignedDate <= currentDate) {
      return true;
    } else {
      return false;
    }
  }

  /*
    @DESC : Selects tab
    @Author: Shashi
    @Date : 25 Aug 2023
  */
  setMainTab(tabId) {
    this.mainTab = tabId;
    if (this.mainTab == 1) {
      this.getTrainingList();
    }
  };

  /*
    @DESC : Returns selected tab id
    @Author: Shashi
    @Date : 25 Aug 2023
  */
  isSetMainTab = function (tabId) {
    return this.mainTab === tabId;
  };

  /*
    @DESC : Calls api and show training task list in table
    @Author: Shashi
    @Date : 25 Aug 2023
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
      console.log(response);
      
      this.listLoading = false;
      if (response.result) {
        if (response.actionDetails) {
          if (response.actionDetails.auditPointList != null && response.actionDetails.auditPointList) {
            for (let index = 0; index < response.actionDetails.auditPointList.length; index++) {
              response.actionDetails.auditPointList[index].selectedStatus = (this.actionDet.status == 'PENDING') ? '' : this.actionDet.status;
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
    @Author: Shashi
    @Date : 25 Aug 2023
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

      this.isCompletedAllSelected();
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

      this.isCompletedAllSelected();
    }
  }

  isCompletedAllSelected() {
    this.enableCompletedBtn = true;

    this.trainingProdDetails.auditPointList.forEach(element => {
      if (element.selectedStatus !== "COMPLETED") {
        this.enableCompletedBtn = false;
        return;
      }
    });
  }

  submitStatus() {
    this.submitLoading = true;
    let auditList: any = [];
    this.trainingProdDetails.auditPointList.forEach(element => {
      auditList.push({
        id: element.pointAuditId, //audioPointList.id
        status: element.selectedStatus, //element.status
        skillingAuditId: element.skillingAuditId, //main skillingAuditId
        ojtPointId: element.ojtPointId, //
        checksheetPointId: element.checksheetPointId,
        // comment: "Nice" //OPTIONAL
      });
    });
    if (auditList != null && auditList.filter(x => x.status == this.constant.COMPLETED).length != this.trainingProdDetails.auditPointList.length) {
      this.submitLoading = false;
      this.alertService.error('Please select status of each row or complete the task and update.');
      return;
    }
    if (this.trainingProdDetails.comment == null || this.trainingProdDetails.comment == undefined || this.trainingProdDetails.comment == '') {
      this.submitLoading = false;
      this.alertService.error('Please enter comment.');
      return;
    }
    
    let reqBody = {
      oeEmpId: this.trainingProdDetails.oeEmpId,
      trainerEmpId: this.trainingProdDetails.trainerEmpId,
      branchId: this.trainingProdDetails.branchId,
      skillLevelId: this.trainingProdDetails.levelId,
      deptId: this.trainingProdDetails.deptId,
      lineId: this.trainingProdDetails.lineId,
      stageId: this.trainingProdDetails.stageId,
      workstationId:this.trainingProdDetails.workstationId,
      // empId: this.empIdFromUserTypeList, //stackholder ID => Add Trainer Employee Id 
      skillingAuditId: this.trainingProdDetails.skillingAuditId,
      status: "COMPLETED",
      comment: (this.trainingProdDetails.comment) ? this.trainingProdDetails.comment : '',
      skillingId: this.trainingProdDetails.skillingId,
      checkSheetId: this.trainingProdDetails.checksheetId,
      skillingChecksheetId: this.trainingProdDetails.skillingChecksheetId,
      csPointAuditList: auditList,
      tlEmpId: this.trainingProdDetails.tlEmpId,
      ojtRegiId: this.trainingProdDetails.ojtRegiId,
    }
    console.log(reqBody);
    
    if (reqBody.csPointAuditList == null || reqBody.csPointAuditList.length == 0) {
      this.submitLoading = false;
      this.alertService.error('Please select status');
      return;
    }

    this.actionsService.submitStageOneStatus(reqBody).subscribe((data: any) => {
      console.log(data)
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
  isStagePending() {
    let flag = false;
    if (this.trainingProdDetails.auditPointList != null && this.trainingProdDetails.auditPointList.length == this.trainingProdDetails.auditPointList.filter(x => x.status == this.constant.PENDING).length) {
      flag = true;
    }
    return flag;
  }
}
