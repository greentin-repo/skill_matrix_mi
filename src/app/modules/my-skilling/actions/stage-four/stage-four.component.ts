import { Component, Inject, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AlertService } from 'src/app/theme/shared/components';
import { ActionsService } from '../actions.service';
import { CONSTANT } from '../actions.constant';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-stage-four',
  templateUrl: './stage-four.component.html',
  styleUrls: ['./stage-four.component.scss'],
  providers: [
    { provide: 'Constant', useValue: CONSTANT }
  ]
})
export class StageFourComponent implements OnInit {

  @Input() actionDet: any;
  submitLoading: boolean = false;
  trainingDet: any = {};
  listLoading: boolean = false;
  userDet: any = {};
  constant: any = {};

  dayList: any = [];

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
    @DESC : Calls api and show training task list in table
    @Author: Jayshri Kolase
    @Date : 06 Sep 2023
  */
  getTrainingList() {
    this.submitLoading = true;
    this.trainingDet.auditPointList = [];
    let reqBody: any = {};
    this.listLoading = true;
    reqBody = {
      // "skillingId": 114,
      // "stageId": 5,
      // "skillingAuditId": 284
      "skillingId": this.actionDet.skillingId,
      "stageId": 5,
      "skillingAuditId": this.actionDet.auditId
    }
    this.actionsService.getTrainingList(reqBody).subscribe((response: any) => {
      this.submitLoading = false;
      if (response.result) {
        if (response.dayWiseAuditList) {
          this.dayList = response.dayWiseAuditList;
          console.log(this.dayList)
          if (this.dayList != null && this.dayList.length > 0) {
            for (let i = 0; i < this.dayList.length; i++) {
              for (let j = 0; j < this.dayList[i].dayAudit.length; j++) {
                if (this.dayList[i].dayAudit[j].stage == "TL Verification" && this.dayList[i].dayAudit[j].status == "COMPLETED") {
                  this.trainingDet.comment = this.dayList[i].dayAudit[j].comment;
                }
              }

            }
          }
        } else {
          this.dayList = []
        }
      } else {
        this.dayList = []
      }
    }, (error: any) => {
      this.submitLoading = false;
    })
  }

  submitStageFourStatus(status: boolean) {
    if (this.trainingDet.comment == null || this.trainingDet.comment == undefined || this.trainingDet.comment == '') {
      this.submitLoading = false;
      this.alertService.error('Please enter comment.');
      return;
    }
    this.submitLoading = true;

    let reqBody: any;
    reqBody = {
      status: status ? "COMPLETED" : "NOT COMPLETED",
      skillingId: this.dayList[0].dayAudit[0].skillingId,
      desiredSkillLevelId: this.dayList[0].dayAudit[0].levelId,
      skillingAuditId: this.actionDet.auditId,
      comment: this.trainingDet.comment,
      checkSheetId: this.dayList[0].dayAudit[0].checksheetId,
      ojtRegiId: this.dayList[0].dayAudit[0].ojtRegiId,
      empId: this.userDet.empId,
      oeEmpId: this.dayList[0].dayAudit[0].oeEmpId,
      branchId: this.dayList[0].dayAudit[0].branchId,
      deptId: this.dayList[0].dayAudit[0].deptId,
      lineId: this.dayList[0].dayAudit[0].lineId,
      workstationId: this.dayList[0].dayAudit[0].workstationId,
      updatedBy: this.userDet.empId,
      createdBy: this.userDet.empId
    }
    console.log(reqBody);

    this.actionsService.submitStageFourStatus(reqBody).subscribe((data: any) => {
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

  checkParameter(parameterList: any, parameterType: any) {
    let flag = false;
    let tmpKey = (parameterType) ? parameterType.toLowerCase().trim() : '';
    if (parameterList != null && parameterList.length > 0) {
      for (let index = 0; index < parameterList.length; index++) {
        let tmpParam = parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }

  getParameterDataByKey(data: any, key: any) {
    if (data.parameterValue === key) {
      return data.parameter;
    }
    return 0;
  }
  getParameterDataByValue(key, index) {
    let tmpKey = key;
    if (this.dayList != null) {
      let chkCntr = 0;
      for (let i = 0; i < this.dayList.length; i++) {
        if (this.dayList?.[i]?.dayAudit !== undefined && this.dayList[i].dayAudit.length > 0) {
          for (let j = 0; j < this.dayList[i].dayAudit.length; j++) {
            if (this.dayList[i].dayAudit[j].parameterList != null && this.dayList[i].dayAudit[j].parameterList.length > 0) {
              for (let k = 0; k < this.dayList[i].dayAudit[j].parameterList.length; k++) {
                let tmpParam = this.dayList[i].dayAudit[j].parameterList[k].parameterType;
                //let prmIndex = this.dayList[i].dayAudit[j].parameterList[k].index;
                if (tmpKey == tmpParam) {
                  if (chkCntr == index) {
                    return this.dayList[i].dayAudit[j].parameterList[k].parameterValue;
                  }
                  chkCntr++;
                }
              }
            }
          }
        }
      }
    }
    return 0;
  }
  getParameterDataByLabel(key, index) {
    let tmpKey = key;
    if (this.dayList != null) {
      let chkCntr = 0;
      for (let i = 0; i < this.dayList.length; i++) {
        if (this.dayList?.[i]?.dayAudit !== undefined && this.dayList[i].dayAudit.length > 0) {
          for (let j = 0; j < this.dayList[i].dayAudit.length; j++) {
            if (this.dayList[i].dayAudit[j].parameterList != null && this.dayList[i].dayAudit[j].parameterList.length > 0) {
              for (let k = 0; k < this.dayList[i].dayAudit[j].parameterList.length; k++) {
                let tmpParam = this.dayList[i].dayAudit[j].parameterList[k].parameterType;
                //let prmIndex = this.dayList[i].dayAudit[j].parameterList[k].index;
                if (tmpKey == tmpParam) {
                  if (chkCntr == index) {
                    return this.dayList[i].dayAudit[j].parameterList[k].label;
                  }
                  chkCntr++;
                }
              }
            }
          }
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
          if (tmpParam == "gap" && tmpKey == "gap") {
            if (parameterList[index].parameterValue == null || parameterList[index].parameterValue == '') {
              return "No"
              break;
            }
            else {
              return parameterList[index].parameterValue;
              break;
            }
          }
          else {
            return parameterList[index].parameterValue;
            break;
          }
        }
      }
    }
    return flag;
  }

  isCyclePlan(parameterList: any) {
    let flag = 0;
    let tmpKey = ('cyclePlan').toLowerCase().trim();

    if (parameterList != null && parameterList.length > 0) {
      for (let index = 0; index < parameterList.length; index++) {
        let tmpParam = parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          if (parameterList[index].hasOwnProperty("cycleValue")) {
            return parameterList[index].cycleValue;
          }
          break;
        }
      }
    }
    return flag;
  }

  getCyclePlanList(parameterList: any) {
    let flag = false;
    let tmpKey = ('cyclePlan').toLowerCase().trim();
    if (parameterList != null && parameterList.length > 0) {
      for (let index = 0; index < parameterList.length; index++) {
        let tmpParam = parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          return parameterList[index].cyclePlanList;
          break;
        }
      }
    }
    return flag;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  expand(i: any) {
    this.dayList[i].expand = !this.dayList[i].expand;
  }
}
