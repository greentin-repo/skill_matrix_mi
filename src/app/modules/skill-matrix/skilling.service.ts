import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/auth/http.service'
@Injectable({
  providedIn: 'root'
})
export class SkillingService {
 
  deleteOJTPlan(url: any) {
    return this.httpService.getMethod(url);
  }

  constructor(
    private httpService: HttpService,
  ) { }

  getBranchAccessList(url: any) {
    return this.httpService.getMethod(url);
  }

  getdepartmentlistbybranchid(url: any) {
    return this.httpService.getMethod(url);
  }
  getOJTPlan(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  getOJTRegistration(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  getSkillMatrixList(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  getWorkforceResourceList(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  getSkillMatrixEmpList(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  getWorkstationList(url: any, getReq: any) {
    return this.httpService.postMethod(url, getReq);
  }
  submitOJTPlan(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  submitOJTRegi(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  getOJTPlanDetails(url: any) {
    return this.httpService.getMethod(url);
  }
  getUserTypeList(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  getCellList(url: any, req: any) {
    return this.httpService.postMethod(url, req);
  }
  getWorkForceDeploymentDetails(url: any, req: any) {
    return this.httpService.postMethod(url, req);
  }
  // ---------------mySkilling Certificate API's by @Saurabh salunke ---------------------
  /* Get Department List by BranchId */
  getDepartmentByBranch(url: any) {
    return this.httpService.getMethod(url);
  }
  // get master certificate list
  getCertificateList(url: any, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // you will get assessment list here simran
  getAssessmentDisplay(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // you will get level list here simran
  getMasterLevelList(url: string) {
    return this.httpService.getMethod(url);
  }
  // you will get department list here simran
  getMasterDepartmentList(url: string) {
    return this.httpService.getMethod(url);
  }
  // you will get skilling action list here simran
  getSkillMatrixActionList(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  getSkillMatrixData(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  getShiftData(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  getWorkforceDeploymentData(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  getWFDetailsList(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  saveWorkforceData(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  getOJTRegistrationDetails(url: any) {
    return this.httpService.getMethod(url);
  }
  // getWorkforceList(req: any) {
  //   return this.httpService.postMethod('apis/sm/getWorkForceDeploymentList', req); 
  // }
}
