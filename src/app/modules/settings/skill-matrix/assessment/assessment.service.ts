import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { HttpService } from 'src/app/shared/auth/http.service';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
 
  constructor(private httpService: HttpService,
    private authService: AuthService) { }

  /* User Login details */
  getLoggedInData() {
    return this.authService.getLoggedInUserData();
  }
  /* 
      Get Obj empty or not
  */
  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }
  /* Empty String */
  isEmptyOrSpaces(str) {
    return str === undefined || str === null || str.match(/^ *$/) !== null;
  }

  // get branch access list 
  getBranchAccessList(url: any) {
    return this.httpService.getMethod(url);
  }
  /*
    Get Assessment list
  */
  getAssessmentList(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  /* 
    Get Master Skill Level List
  */
  getMasterLevelList(url: string) {
    return this.httpService.getMethod(url);
  }

  addAssessmentDetails(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  updateAssessmentDetails(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  getAssessmentDetailsById(url: string) {
    return this.httpService.getMethod(url);
  }

  deleteAsssessment(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  publishAsssessment(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  addQuestions(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  deleteAsssessmentQuesAndOption(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  updateQuestionsAndOpt(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  deleteAssessmentOption(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  /* Upload Assessment file */
  uploadAssessmentData(url: string, data: any) {
    return this.httpService.formDataRequest(url, data);
  }

  //  Add Category
  addCatgeoryand(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // Update Category

  updateCatgeory(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // Get Category List
  getCatgeoryList(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // Delete Category
  deleteCatgeory(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  // get department list by branch id simran
  getDepartmentByBranch(url: any) {
    return this.httpService.getMethod(url);
  }
  getCellList(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
  getWorkforceDeploymentData(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }
}
