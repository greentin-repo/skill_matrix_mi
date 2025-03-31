import { Component, Inject, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AlertService } from 'src/app/theme/shared/components';
import { ActionsService } from '../actions.service';
import { CONSTANT } from '../actions.constant';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-stage-three',
  templateUrl: './stage-three.component.html',
  styleUrls: ['./stage-three.component.scss'],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class StageThreeComponent implements OnInit {

  @Input() actionDet: any;
  mainTab = 1;
  filterFlag: boolean = false;
  submitLoading: boolean = false;
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
  constant: any = {};
  isDisableStatus: boolean = false;
  enableCompletedBtn: boolean = false;
  showCycle: any;

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
    this.getTrainingList();
    // if (this.mainTab == 1) {
    //   this.getTrainingList();
    // } 
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
          this.showCycle = response.actionDetails.parameterList.filter(x => x.parameterType == 'cyclePlan')[0].cycleValue;
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
        this.isCompletedAllSelected();
      }
    }
  }

  // isCompletedAll() {
  //   this.enableCompletedBtn = true;

  //   this.trainingProdDetails.auditPointList.forEach(element => {
  //     if (element.status !== "COMPLETED") {
  //       this.enableCompletedBtn = false;
  //     }
  //     else {
  //       element.completed = "COMPLETED";
  //     }
  //   });
  // }


  isCompletedAllSelected() {
    this.enableCompletedBtn = false; // Set to false by default

    this.trainingProdDetails.auditPointList.forEach(element => {
      if (element.selectedStatus === "COMPLETED") {
        this.enableCompletedBtn = true;
      }
    });
  }

  submitStageThreeStatus(status: boolean) {

    if (status) {
      if (!this.enableCompletedBtn) {
        this.alertService.error("Please select status of each row as YES.");
        return;
      }
      if (this.trainingProdDetails.comment == null || this.trainingProdDetails.comment == undefined || this.trainingProdDetails.comment == '') {
        this.submitLoading = false;
        this.alertService.error('Please enter comment.');
        return;
      }
    }
    if (this.trainingProdDetails.comment == null || this.trainingProdDetails.comment == undefined || this.trainingProdDetails.comment == '') {
      this.submitLoading = false;
      this.alertService.error('Please enter comment.');
      return;
    }
    this.submitLoading = true;
    let auditList: any = [];
    this.trainingProdDetails.auditPointList.forEach(element => {
      auditList.push({
        id: element.pointAuditId, //audioPointList.id
        status: element.selectedStatus, //element.status
        skillingAuditId: element.skillingAuditId, //main skillingAuditId
        ojtPointId: element.ojtPointId, //
        checksheetPointId: element.checksheetPointId,
        // comment: "Nice 1"
      });
    });

    // if (auditList != null && auditList.filter(x => x.status == this.constant.COMPLETED).length != this.trainingProdDetails.auditPointList.length) {
    //   this.submitLoading = false;
    //   this.alertService.error('Please select status of each row as YES.');
    //   return;
    // }

    let reqBody: any;
    reqBody = {
      // empId: 36,
      dayNo: this.trainingProdDetails.auditPointList[0].dayNo,
      oeEmpId: this.trainingProdDetails.oeEmpId,
      branchId: this.trainingProdDetails.branchId,
      skillLevelId: this.trainingProdDetails.levelId,
      deptId: this.trainingProdDetails.deptId,
      lineId: this.trainingProdDetails.lineId,
      stageId: this.trainingProdDetails.stageId,
      workstationId: this.trainingProdDetails.workstationId,
      skillingAuditId: this.trainingProdDetails.skillingAuditId,
      status: status ? "COMPLETED" : "NOT COMPLETED",
      comment: this.trainingProdDetails.comment,
      skillingId: this.trainingProdDetails.skillingId,
      checkSheetId: this.trainingProdDetails.checksheetId,
      skillingChecksheetId: this.trainingProdDetails.skillingChecksheetId,
      csPointAuditList: auditList,
      tlEmpId: this.trainingProdDetails.tlEmpId,
      ojtRegiId: this.trainingProdDetails.ojtRegiId
    }

    console.log(reqBody);
    this.actionsService.submitStageThreeStatus(reqBody).subscribe((data: any) => {
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

  getCycleValue() {
    let tmpKey = 'cyclePlan';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      for (let index = 0; index < this.trainingProdDetails.parameterList.length; index++) {
        let tmpParam = this.trainingProdDetails.parameterList[index].parameterType;
        if (tmpKey.toLowerCase().trim() == tmpParam.toLowerCase().trim()) {
          return this.trainingProdDetails.parameterList[index].cycleValue;
        }
      }
    }
    return 0;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  isVisibleParam(key) {
    let flag = false;
    let tmpKey = (key) ? key.toLowerCase().trim() : '';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      for (let index = 0; index < this.trainingProdDetails.parameterList.length; index++) {
        let tmpParam = this.trainingProdDetails.parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }

  getParamaterDataByIndex(key: any, index: any) {
    let tmpKey = (key) ? key.toLowerCase().trim() : '';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      let chkCntr = 0;
      for (let i = 0; i < this.trainingProdDetails.parameterList.length; i++) {
        let tmpParam = this.trainingProdDetails.parameterList[i].parameterType.toLowerCase().trim();
        //let prmIndex = this.trainingProdDetails.parameterList[i].index;
        if (tmpKey == tmpParam) {
          if (chkCntr == index) {
            return this.trainingProdDetails.parameterList[i].parameterValue;
          }
          chkCntr++;
        }
      }
    }
    return 0;
  }

  getParamaterLabelByIndex(key, index) {
    let tmpKey = (key) ? key.toLowerCase().trim() : '';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      let chkCntr = 0;
      for (let i = 0; i < this.trainingProdDetails.parameterList.length; i++) {
        let tmpParam = this.trainingProdDetails.parameterList[i].parameterType.toLowerCase().trim();
        //let prmIndex = this.trainingProdDetails.parameterList[i].index;
        if (tmpKey == tmpParam) {
          if (chkCntr == index) {
            return this.trainingProdDetails.parameterList[i].label;
          }
          chkCntr++;
        }
      }
    }
    return 0;
  }
}
