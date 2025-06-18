import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/shared/auth/http.service';
@Injectable({
  providedIn: 'root'
})
export class SkillMatrixService {
  
 
  


  constructor(private httpService: HttpService) {

  }
  // ---------------  OJT Checksheet API's by @Jayshri Kolase ---------------------
  // get branch access list 
  getBranchAccessList(url: any) {
    return this.httpService.getMethod(url);
  }
  // Save checksheet details
  saveChecksheetDetails(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  // update checksheet details
  updateChecksheet(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  // get checksheet List
  getChecksheetList(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  // get checksheet Details
  getChecksheetDetails(url: any) {
    return this.httpService.getMethod(url);
  }
  // delete Checksheet
  deleteChecksheet(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  // save checksheet points
  saveChecksheetPoint(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  // get Checksheet Point List
  getChecksheetPointList(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  // delete Checksheet Point
  deleteChecksheetPoint(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  // get Parameter Type List
  getParameterTypeList(url: any) {
    return this.httpService.getMethod(url);
  }
  // save Checksheet Parameter
  saveChecksheetParameter(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }
  // update Checksheet Parameter
  updateChecksheetParameter(url: any, reqData: any) {
    return this.httpService.postMethod(url, reqData);
  }

  // ---------------- Workstation API's by @Jayshri Kolase-----------------------
  // get department list by branch id
  getdepartmentlistbybranchid(url: any) {
    return this.httpService.getMethod(url);
  }
  //save or update workstation
  saveWorkstation(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  // deactivate workstation
  deleteWorkstationDetails(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  // get workstation list
  getWorkstationList(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  // get Line list
  getLineList(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }

  // ------------- Certificate by @Jayshri Kolase------------------
  // get certificate list
  getLevelList(url: any) {
    return this.httpService.getMethod(url);
  }
  // save or add new certificate
  addNewCertificate(url: any, formData: FormData) {
    return this.httpService.formDataRequest(url, formData);
  }
  // get master certificate list
  getCertificateList(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }
  //Delete master Certificate 
  deleteCertificate(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }

  // ---------------- Satge & Workflow by @Jayshri Kolase -----------------
  // get satge List
  getStageList(url: string, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }

  // get workflow config list
  getWorkflowConfigList(url: any) {
    return this.httpService.getMethod(url);
  }

  // save workflow
  saveWorkflowSetup(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }

  // delete workflow config
  deleteWorkflowConfig(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }

  // <---- Reference API's by Sanket B. --------> 
  // Get Master Certificate Level list
  getMasterCertificateData(url: any) {
    return this.httpService.getMethod(url);
  }

  // Model list API
  getModelListData(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  saveReferenceModel(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  updateModalDetails(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  deleteModelDetails(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }

  // Gap Reason list API
  getGapReasonListData(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  saveReferenceGapReason(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  updateGapDetails(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  removeRefGapReason(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }

  // Shift No list API
  getShiftNoData(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  saveReferenceShiftNo(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  updateShiftDetails(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  deleteShiftDetails(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }

  /*************  STACKHOLDER SCREEN API By Mahesh W ***************/

  /* Get Master Usertypes */
  getMasterUserType(url: any) {
    return this.httpService.getMethod(url);
  }
  /* Get Department List by BranchId */
  getDepartmentByBranch(url: any) {
    return this.httpService.getMethod(url);
  }
  /* Get Employee List */
  getEmployeeList(url: any) {
    return this.httpService.getMethod(url);
  }
  /* Get Stakeholder List */
  getStakeholderList(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  /* Save Stakeholder */
  saveStakeholderData(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  /* Delete Stakeholder */
  deleteStakeholderData(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }

  // save number of days
  saveAssessmentNoDays(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }

  // remove number of days
  removeNoOfDays(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  // get cell/line list
  getCellList(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }



  //-------------STAGE LABEL----------
  getStageLevelList(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }

  /* Save Stage */
  updateStageData(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  /* Delete Stage */
  deleteStageData(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  // workstation list simran
  getWorkforceDeploymentData(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  //-------------master setup----------
  // document number 
  //  Aniket :- Call All API for document List 
  getDocumentList(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  updateDocumentNumber(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  saveDocument(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  deleteDocument(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
 
  // save copy checksheet
  saveCopyChecksheet(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // Create New Workstation Mapping
  saveWorkstationMapping(url: string, data: any) {  
    return this.httpService.postMethod(url, data);
  }
  // Get Workstation Mapping List
  getWorkstationMappingList(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // Delete Workstation Mapping
  deleteWorkstationMapping(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // Update Workstation Mapping
  updateWorkstationMapping(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
}
