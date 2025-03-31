import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActionsService } from '../actions.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AlertService } from 'src/app/theme/shared/components';
import * as moment from 'moment';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-stage-two-verification',
  templateUrl: './stage-two-verification.component.html',
  styleUrls: ['./stage-two-verification.component.scss']
})
export class StageTwoVerificationComponent implements OnInit {
  @Input() actionDet: any;
  trainingProdDetails: any = [];
  listLoading: boolean = false;
  userDet: any = {};
  stage2Verify: any = {};
  SingleDropdownSettings: IDropdownSettings = {};
  SingleDropdownModelSettings: IDropdownSettings = {};
  gapReasonList: any = [];
  gapReasonResetList: any = [];
  modelList: any = [];
  mainAuditPointList: any = [];
  isGap: boolean = false;
  minDate: any;
  maxDate: any = moment();
  actualDate = new Date();
  showCycle: any = -1;
  submitLoading: boolean = false;
  isOtherReason: boolean = false;
  //completedBtnStatus: boolean = false;
  //notCompletedBtnStatus: boolean = false;

  constructor(
    private modalService: NgbModal,
    private actionsService: ActionsService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));

    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    this.getTrainingList();
    this.getGapReasonList();
    this.getModelList();
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'reason',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.SingleDropdownModelSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'modelName',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onDateChange(index, key, date: any) {
    this.trainingProdDetails.auditPointList[index][key] = moment(new Date(date.value)).format("YYYY-MM-DD");
  }

  /*
   @DESC : Calls api and show training task list in table
   @Author: Jayshri Kolase
   @Date : 06 Sep 2023
 */
  getTrainingList() {
    this.trainingProdDetails = {};
    this.listLoading = true;
    let reqBody = {
      "skillingId": this.actionDet.skillingId,
      "skillingAuditId": this.actionDet.auditId //auditId
      //"skillingId": 70, //this.actionDet.skillingId,
      //"skillingAuditId": 107, //this.actionDet.auditId //auditId
      // "skillingId": 13, //this.actionDet.skillingId,
      // "skillingAuditId": 138, //this.actionDet.auditId //auditId 13 138 for from to model
    }
    this.actionsService.getTrainingList(reqBody).subscribe((response: any) => {
      this.listLoading = false;
      if (response.result) {
        if (response.actionDetails) {
          if (response.actionDetails.auditPointList != null && response.actionDetails.auditPointList) {
            for (let index = 0; index < response.actionDetails.auditPointList.length; index++) {
              response.actionDetails.auditPointList[index].gap = '';
              response.actionDetails.auditPointList[index].gapReason = '';
              response.actionDetails.auditPointList[index].parameterValue = '';
              response.actionDetails.auditPointList[index].planProduction = '';
              response.actionDetails.auditPointList[index].expectedValue = '';
              response.actionDetails.auditPointList[index].actualValue = '';
              // response.actionDetails.auditPointList[index].targetTime = '';
              response.actionDetails.auditPointList[index].text = '';
              response.actionDetails.auditPointList[index].number = '';

            }
          } else {
            this.trainingProdDetails.auditPointList = []
          }

          this.mainAuditPointList = response.actionDetails.auditPointList;
          response.actionDetails.auditPointList = [response.actionDetails.auditPointList[0]];

          this.trainingProdDetails = response.actionDetails;
          console.log(this.trainingProdDetails)
          this.trainingProdDetails.cyclePlanList = [];
          // if (this.actionDet.status == 'COMPLETED') { 
          //   if (this.trainingProdDetails.auditPointList != null && this.trainingProdDetails.auditPointList.length > 0) {
          //     for (let index = 0; index < this.trainingProdDetails.auditPointList.length; index++) {
          //       if()
          //     }
          //   }
          // }
          if (response.actionDetails.parameterList != null) {
            let textParameters = response.actionDetails.parameterList.filter(x => x.parameterType === 'Text');
            this.trainingProdDetails.auditPointList.forEach((element, index) => {
              // Assuming there's a one-to-one correspondence between audit points and text parameters
              if (textParameters[index]) {
                element.text = textParameters[index].parameterValue;
              } else {
                element.text = ''; // Or whatever default value you want to assign
              }
            })
          }
          if (response.actionDetails.parameterList != null) {
            let textParameters = response.actionDetails.parameterList.filter(x => x.parameterType === 'Number');
            this.trainingProdDetails.auditPointList.forEach((element, index) => {
              // Assuming there's a one-to-one correspondence between audit points and text parameters
              if (textParameters[index]) {
                element.number = textParameters[index].parameterValue;
              } else {
                element.number = ''; // Or whatever default value you want to assign
              }
            })
          }

          if (response.actionDetails.parameterList != null && response.actionDetails.parameterList.filter(x => x.parameterType == 'cyclePlan').length > 0) {
            let cyclePlan = response.actionDetails.parameterList.filter(x => x.parameterType == 'cyclePlan')[0];
            let productionActual = cyclePlan.parameterValue;
            let gap = response.actionDetails.parameterList.filter(x => x.parameterType == 'Gap')[0].parameterValue;

            // let actualTime = response.actionDetails.parameterList.filter(x => x.parameterType == 'Datetime')[0].parameterValue;
            // let targetTime = response.actionDetails.parameterList.filter(x => x.parameterType == 'Datetime')[1].parameterValue;
            // let fromModel = response.actionDetails.parameterList.filter(x => x.parameterType == 'model')[0].parameterValue;
            // let toModel = response.actionDetails.parameterList.filter(x => x.parameterType == 'model')[1].parameterValue;

            this.trainingProdDetails.auditPointList.forEach(element => {
              element.productionActual = productionActual;
              element.gapReason = gap;
              // element.actualTime = actualTime;
              // element.targetTime = targetTime;
              // element.fromModel  = fromModel;
              // element.toModel    = toModel;
            });

            for (let n = 0; n < cyclePlan.cycleValue; n++) {
              this.trainingProdDetails.cyclePlanList.push({ expectedValue: 0, actualValue: 0 });
            }

            this.showCycle = response.actionDetails.parameterList.filter(x => x.parameterType == 'cyclePlan')[0].cycleValue;
            if (this.actionDet.status == 'COMPLETED') {
              this.trainingProdDetails.cyclePlanList = cyclePlan.cyclePlanList;
            }
            console.log(this.trainingProdDetails.cyclePlanList);
          } else {
            this.trainingProdDetails.cyclePlanList = [];
          }
        }
      } else {
        this.trainingProdDetails = {}
      }
    }, (error: any) => {
      this.listLoading = false;
    })
  }

  getGapReasonList() {
    let req = {
      "branchId": this.userDet.branch.branchId,
    }
    this.actionsService.getGapReasonList(req).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.gapReasonList = response.dataList;
          this.gapReasonList.push({
            branchId: 0,
            branchName: "",
            createdDate: "",
            id: 0,
            reason: "Other"
          })
        }
        else {
          this.gapReasonList = [];
        }
      }
      else {
        this.gapReasonList = [];
      }


      this.gapReasonResetList =  this.gapReasonList ;
    })
  }
  getModelList() {
    let req = {
      "branchId": this.userDet.branch.branchId,
    }
    this.actionsService.getModelList(req).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.modelList = response.dataList;
          // this.modelList.push({
          //   branchId: 0,
          //   branchName: "",
          //   createdDate: "",
          //   id: 0,
          //   reason: "Other"
          // })
        }
        else {
          this.modelList = [];
        }
      }
      else {
        this.modelList = [];
      }
    })
  }
  onReasonChange(event: any, enableOtherReason: boolean) {
    console.log(event);
    if (event.gapReason[0].reason == "Other") {
      this.trainingProdDetails.parameterList.forEach(element => {
        if (element.id == event.id) {
          element.enableOtherReason = true;
        }
      });
    } else {
      this.trainingProdDetails.parameterList.forEach(element => {
        if (element.id == event.id) {
          element.enableOtherReason = false;
        }
      });
    }
    console.log(this.trainingProdDetails.parameterList);
  }
  onChangeComplete(event: any, data: any) {
    if (data.gap === "No") {
      data.gapReason = null;
      data.gapOtherReason = null;
      this.isOtherReason = false;
      this.gapReasonList =  this.gapReasonResetList ;
    }

    // this.trainingProdDetails.parameterList.forEach(element => {
    //   if (element.id == data.id) {
    //     if (event.target.value == 'Yes') {
    //       element.gap = "Yes";
    //       this.isGap = true;
    //     } else if (event.target.value == 'No') {
    //       element.gap = "No";
    //       this.isGap = false;
    //     }
    //   }
    // });
    // console.log(this.trainingProdDetails.parameterList)
  }
  onNumberChanged(event: any, key: any) {
    this.trainingProdDetails.parameterList.forEach(element => {
      if (element.parameterType == key) {
        // element.number = event;
        this.trainingProdDetails.auditPointList[0].number = event;
      }
    });
  }

  stageTwoVerificationSubmission(data: any, status: any, form: NgForm) {
    //console.log(this.trainingProdDetails.auditPointList);
    if (form || !this.trainingProdDetails.parameterList) {
      this.submitLoading = true;
      data = this.trainingProdDetails.auditPointList[0];

      // if (status == "COMPLETED") {
      //   data.acceptBtnLbl = "Loading...";
      // } else {
      //   data.rejectBtnLbl = "Loading...";
      // }

      let auditList: any = [];
      let skillingParamList: any = [];

      if (this.isVisibleParam('model')) {
        //if (data.gap == 'Yes') {
        if (data.fromModel != null && data.fromModel != undefined) {
          const paramFromModel = {
            id: this.getParamIdByIndex('Model', 0),
            parameterValue: data.fromModel[0].modelName,
            skillingAuditId: data.skillingAuditId
          }
          skillingParamList.push(paramFromModel);
        }

        if (data.toModel != null && data.toModel != undefined) {
          const paramToModel = {
            id: this.getParamIdByIndex('Model', 1),
            parameterValue: data.toModel[0].modelName,
            skillingAuditId: data.skillingAuditId
          }
          skillingParamList.push(paramToModel);
        }
        //}
        //}
      }

      //this.trainingProdDetails.parameterList.forEach(element => {
      if (this.isVisibleParam('Number')) {
        const paramActual = {
          id: this.getParamId('Number'),
          parameterValue: data.number,
          skillingAuditId: data.skillingAuditId,
        };
        skillingParamList.push(paramActual);
      }
      if (this.isVisibleParam('Text')) {
        const paramActual = {
          id: this.getParamId('Text'),
          parameterValue: data.text,
          skillingAuditId: data.skillingAuditId,
        };
        skillingParamList.push(paramActual);
      }

      //   const paramPlan = {
      //     id: this.getParamId('Number'),
      //     parameterValue: data.productionPlan,
      //     skillingAuditId: data.skillingAuditId,
      //   };
      //   skillingParamList.push(paramPlan);
      // }

      if (this.isVisibleParam('Datetime')) {
        const paramActualTime = {
          id: this.getParamIdByIndex('Datetime', 0),
          parameterValue: data.actualTime,
          skillingAuditId: data.skillingAuditId,
          //cyclePlanList: [] // Declare cyclePlanList with an initial empty array
        };
        skillingParamList.push(paramActualTime);
      }

      if (this.isVisibleParam('Datetime')) {
        const paramTargetTime = {
          id: this.getParamIdByIndex('Datetime', 1),
          parameterValue: data.targetTime,
          skillingAuditId: data.skillingAuditId,
          //cyclePlanList: [] // Declare cyclePlanList with an initial empty array
        };
        skillingParamList.push(paramTargetTime);
      }

      if (this.isVisibleParam('Gap')) {
        // if (data.enableOtherReason) {
        //   const paramGap = {
        //     id: data.id,
        //     parameterValue: data.gapOtherReason,
        //     skillingAuditId: data.skillingAuditId
        //   }

        //   skillingParamList.push(paramGap);
        // } else {
        console.log(data.gapReason);
        let paramGap = {}
        if (data.gap == 'Yes') {
          if (data.gapReason[0].reason == "Other") {
            paramGap = {
              id: this.getParamId('Gap'),
              parameterValue: data.gapOtherReason,
              skillingAuditId: data.skillingAuditId
            }
          }
          else {
            paramGap = {
              id: this.getParamId('Gap'),
              parameterValue: data.gapReason[0].reason,
              skillingAuditId: data.skillingAuditId
            }
          }
          skillingParamList.push(paramGap);
          //}
        }
      }

      if (this.isVisibleParam('cyclePlan')) {
        console.log(this.trainingProdDetails);
        // Check if cyclePlanList is available
        if (this.trainingProdDetails.cyclePlanList && this.trainingProdDetails.cyclePlanList.length > 0) {
          // Create cyclePlanList array for the paramElement
          let paramCycles: any = {
            "id": this.getParamId('cyclePlan'),
            "parameterValue": data.productionActual,
            "skillingAuditId": data.skillingAuditId
          };
          paramCycles.cyclePlanList = this.trainingProdDetails.cyclePlanList.map(cycle => ({
            actualValue: cycle.actualValue,
            expectedValue: cycle.expectedValue,
            cyclePlanId: this.getParamId('cyclePlan'),
            checksheetParameterId: this.getChecksheetParameterId('cyclePlan'),
            skillingParameterId: this.getSkillingParameterId('cyclePlan'),
            cycleNo: cycle.cycleNo
          }));
          skillingParamList.push(paramCycles);
        }
      }

      this.mainAuditPointList.forEach(element => {
        auditList.push({
          id: element.pointAuditId, //audioPointList.id
          dayNo: element.dayNo,
          status: status, //element.status
          skillingAuditId: element.skillingAuditId, //main skillingAuditId
          ojtPointId: element.ojtPointId, //
          checksheetPointId: element.checksheetPointId, //element.skillingCheckSheetId,
          comment: ""
        });
      });
      // if (skillingParamList != null && skillingParamList.length > 0 && auditList != null && auditList.length > 0) {
      let req = {
        "empId": this.userDet.empId,
        "dayNo": this.mainAuditPointList[0].dayNo,
        "skillingAuditId": this.trainingProdDetails.skillingAuditId,
        "skillingChecksheetId": this.trainingProdDetails.skillingChecksheetId,
        "deptId": this.trainingProdDetails.deptId,
        "lineId": this.trainingProdDetails.lineId,
        "workstationId": this.trainingProdDetails.workstationId,
        "status": status, // this.trainingProdDetails.status,
        "comment": "",
        "stageId": this.trainingProdDetails.stageId,
        "skillingId": this.trainingProdDetails.skillingId,
        "checkSheetId": this.trainingProdDetails.checksheetId,
        "skillingParamList": skillingParamList,
        "csPointAuditList": auditList,
        "createdBy": this.userDet.empId,
        "skillLevelId": this.trainingProdDetails.levelId,
        "branchId": this.trainingProdDetails.branchId,
        "oeEmpId": this.trainingProdDetails.oeEmpId,
        "tlEmpId": this.trainingProdDetails.tlEmpId,
        "ojtRegiId": this.trainingProdDetails.ojtRegiId,
      }

      console.log(req)
      this.actionsService.stageTwoVerificationSubmission(req).subscribe((response: any) => {
        this.submitLoading = false;
        console.log(response);
        if (response.result) {
          this.alertService.success("Activity Submitted Successfully.");
          this.modalService.dismissAll();
        }
        else {
          if (response.statusCode == 100) {
            this.alertService.error(response.reason);
          } else {
            this.alertService.error("Error occurred while submitting data. Please try again");
          }
        }
      })
    }
    else {
      this.alertService.error("Please fill all parameters");
      this.submitLoading = false;
    }
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

  getParamId(key) {
    let tmpKey = (key) ? key.toLowerCase().trim() : '';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      for (let index = 0; index < this.trainingProdDetails.parameterList.length; index++) {
        let tmpParam = this.trainingProdDetails.parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          return this.trainingProdDetails.parameterList[index].id;
        }
      }
    }
    return 0;
  }
  getParamIdByIndex(key, index) {
    let tmpKey = (key) ? key.toLowerCase().trim() : '';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      let chkCntr = 0;
      for (let i = 0; i < this.trainingProdDetails.parameterList.length; i++) {
        let tmpParam = this.trainingProdDetails.parameterList[i].parameterType.toLowerCase().trim();
        //let prmIndex = this.trainingProdDetails.parameterList[i].index;
        if (tmpKey == tmpParam) {
          if (chkCntr == index) {
            return this.trainingProdDetails.parameterList[i].id;
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

  getParamaterLabel(key) {
    let tmpKey = (key) ? key.toLowerCase().trim() : '';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      for (let index = 0; index < this.trainingProdDetails.parameterList.length; index++) {
        let tmpParam = this.trainingProdDetails.parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          return this.trainingProdDetails.parameterList[index].label;
        }
      }
    }
    return 0;
  }

  getParamaterData(parameterList: any, parameterType: any) {
    let flag = false;
    let tmpKey = (parameterType) ? parameterType.toLowerCase().trim() : '';
    if (parameterList != null && parameterList.length > 0) {
      for (let index = 0; index < parameterList.length; index++) {
        let tmpParam = parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          return parameterList[index].parameterValue;
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

  getChecksheetParameterId(key) {
    let tmpKey = (key) ? key.toLowerCase().trim() : '';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      for (let index = 0; index < this.trainingProdDetails.parameterList.length; index++) {
        let tmpParam = this.trainingProdDetails.parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          return this.trainingProdDetails.parameterList[index].checksheetParameterId;
        }
      }
    }
    return 0;
  }

  getSkillingParameterId(key) {
    let tmpKey = (key) ? key.toLowerCase().trim() : '';
    if (this.trainingProdDetails.parameterList != null && this.trainingProdDetails.parameterList.length > 0) {
      for (let index = 0; index < this.trainingProdDetails.parameterList.length; index++) {
        let tmpParam = this.trainingProdDetails.parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          return this.trainingProdDetails.parameterList[index].id;
        }
      }
    }
    return 0;
  }

  onChange(data) {
    console.log(data)
    if (data) {
      if (data.reason == "Other") {
        this.isOtherReason = true;
      }
      else {
        this.isOtherReason = false;
      
      }
    }
  }

  isStatusCompletedOrRejected(status: string): boolean {
    return status === 'COMPLETED' || status === 'REJECTED';
  }
}

