import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/shared/auth/http.service';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  

  constructor(private httpService: HttpService,) { }

  setGlobalLoader(flag) {
    return flag;
  }

  getBranchAccessList(url: any) {
    return this.httpService.getMethod(url);
  }
  getDepartmentByBranch(url: any) {
    return this.httpService.getMethod(url);
  }

  getLineNameList(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }

  getMasterLevelList(url: string) {
    return this.httpService.getMethod(url);
  }

  getMasterDepartmentList(url: string) {
    return this.httpService.getMethod(url);
  }

  getWorkstationList(url: any, getReq: any) {
    return this.httpService.postMethod(url, getReq);
  }

  getActionsList(req: any) {
    return this.httpService.postMethod('apis/sm/getMyActionList', req); //getOJTAssessmentsList
  }

  getMasterUserType() {
    return this.httpService.getMethod('apis/sm/getMasterUserType');
  }

  getUserTypeList(req: any) {
    return this.httpService.postMethod('apis/sm/getUserTypeList', req);
  }

  getTrainingList(req: any) {
    return this.httpService.postMethod('apis/sm/getMyActionDetails', req);
  }

  getProductionList(req: any) {
    return this.httpService.getMethod('');
  }

  getAssessmentDetails(req: any) {
    return this.httpService.getMethod('apis/sm/getOJTAssessmentDetails/' + req);
  }
  getAssignedAssessmentDetails(req: any) {
    return this.httpService.getMethod('apis/sm/getAssignedAssessmentDetails/' + req);
  }

  submitStageOneStatus(req: any) {
    return this.httpService.postMethod('apis/sm/stageOneSubmission', req);
  }
  submitStageTwoStatus(reqBody: any) {
    return this.httpService.postMethod('apis/sm/stageTwoSubmission', reqBody);
  }
  submitStageThreeStatus(reqBody: any) {
    return this.httpService.postMethod('apis/sm/stageThreeSubmission', reqBody);
  }
  submitStageFourStatus(reqBody: any) {
    return this.httpService.postMethod('apis/sm/stageFourSubmission', reqBody);
  }
  getGapReasonList(req: any) {
    return this.httpService.postMethod('apis/sm/getGapReasonList', req);
  }
  getModelList(req: any) {
    return this.httpService.postMethod('apis/sm/getModelList', req);
  }
  submitStageFiveStatus(url:any,reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  stageTwoVerificationSubmission(req: any) {
    return this.httpService.postMethod('apis/sm/stageTwoVerificationSubmission', req);
  }
  // Aniket
  setRemainingTime(data: any) {
    return this.httpService.postMethod('apis/sm/updateAssessmentTime', data);
  }
}
