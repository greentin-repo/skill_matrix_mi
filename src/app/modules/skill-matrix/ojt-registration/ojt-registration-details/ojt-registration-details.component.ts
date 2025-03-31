import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SkillingService } from '../../skilling.service';

@Component({
  selector: 'app-ojt-registration-details',
  templateUrl: './ojt-registration-details.component.html',
  styleUrls: ['./ojt-registration-details.component.scss']
})
export class OjtRegistrationDetailsComponent implements OnInit {
  userDet: any = {};
  @Input() selectedDetail;
  dayList: any = {};
  dayWiseAuditList: any = {};
  ojtRegiDetails: any = {};
  TLDayAudit: any = [];
  

  constructor(
    private modalService: NgbModal,
    private appService: SkillingService,
  ) { }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    console.log(this.userDet)
    console.log(this.selectedDetail);
    this.getOJTRegistrationDetails();
  }

  getOJTRegistrationDetails() {
    this.appService.getOJTRegistrationDetails('apis/sm/getOJTRegistrationDetails/' + this.selectedDetail.ojtRegisId).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        if (response.data) {
          this.ojtRegiDetails = response.data;
          console.log(this.ojtRegiDetails)
          if (this.ojtRegiDetails.skillingList != null && this.ojtRegiDetails.skillingList.length > 0) {
            this.dayWiseAuditList = this.ojtRegiDetails.skillingList;
            // this.dayList = this.dayWiseAuditList.dayWiseAuditList;
            console.log(this.dayWiseAuditList);
          }
        } else {
          this.ojtRegiDetails = []
        }
      } else {
        this.ojtRegiDetails = []
      }
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
  getParamaterData(parameterList: any, parameterType: any) {
    let flag = false;
    let tmpKey = (parameterType) ? parameterType.toLowerCase().trim() : '';
    if (parameterList != null && parameterList.length > 0) {
      for (let index = 0; index < parameterList.length; index++) {
        let tmpParam = parameterList[index].parameterType.toLowerCase().trim();
        if (tmpKey == tmpParam) {
          return parameterList[index].parameterValue;
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

  expand(i: any, j: any) {
    this.dayWiseAuditList[i].dayWiseAuditList[j].expand = !this.dayWiseAuditList[i].dayWiseAuditList[j].expand;
  }
  assessmentAuditExpand(i: any, j: any, k: any) {
    this.dayWiseAuditList[i].dayWiseAuditList[j].assessmentAudit[k].expand = !this.dayWiseAuditList[i].dayWiseAuditList[j].assessmentAudit[k].expand;
  }
  tlAuditExpand(i: any, j: any, k: any) {
    this.dayWiseAuditList[i].dayWiseAuditList[j].tlAudit[k].expand = !this.dayWiseAuditList[i].dayWiseAuditList[j].tlAudit[k].expand;
  }
  expandSkilling(i: any) {
    this.dayWiseAuditList[i].expand = !this.dayWiseAuditList[i].expand;
  }

  getParameterDataByValue(key, index, day) {
    let tmpKey = key;
    if (this.dayWiseAuditList[day].dayWiseAuditList != null) {
      let chkCntr = 0;
      for (let i = 0; i < this.dayWiseAuditList[day].dayWiseAuditList.length; i++) {
        if (!(this.dayWiseAuditList?.[day]?.dayWiseAuditList?.[i]?.dayAudit === undefined ||
          this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit.length === 0)) {
          for (let j = 0; j < this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit.length; j++) {
            if (this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList != null && this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList.length > 0) {
              for (let k = 0; k < this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList.length; k++) {
                let tmpParam = this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList[k].parameterType;
                //let prmIndex = this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList[k].index;
                if (tmpKey == tmpParam) {
                  if (chkCntr == index) {
                    return this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList[k].parameterValue;
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
  getParameterDataByLabel(key, index, day) {
    let tmpKey = key;
    if (this.dayWiseAuditList[day].dayWiseAuditList != null && this.dayWiseAuditList[day].dayWiseAuditList.length > 0) {
      let chkCntr = 0;
      for (let i = 0; i < this.dayWiseAuditList[day].dayWiseAuditList.length; i++) {
        if (!(this.dayWiseAuditList?.[day]?.dayWiseAuditList?.[i]?.dayAudit === undefined ||
          this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit.length === 0)) {
          for (let j = 0; j < this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit.length; j++) {
            if (this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList != null && this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList.length > 0) {
              for (let k = 0; k < this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList.length; k++) {
                let tmpParam = this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList[k].parameterType;
                //let prmIndex = this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList[k].index;
                if (tmpKey == tmpParam) {
                  if (chkCntr == index) {
                    return this.dayWiseAuditList[day].dayWiseAuditList[i].dayAudit[j].parameterList[k].label;
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
}
