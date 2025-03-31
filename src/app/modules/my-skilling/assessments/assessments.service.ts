import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { HttpService } from 'src/app/shared/auth/http.service';

@Injectable({
  providedIn: 'root'
})
export class AssessmentsService {

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) { }

  /*
   Get Assessment list
 */
  getAssessmentList(url: string, data: any) {
    return this.httpService.postMethod(url, data);
  }

  // you will get branch list here simran
  getBranchAccessList(url: any) {
    return this.httpService.getMethod(url);
  }
  // you will get level list here simran
  getMasterLevelList(url: string) {
    return this.httpService.getMethod(url);
  }
  // you will get department list here simran
  getMasterDepartmentList(url: string) {
    return this.httpService.getMethod(url);
  }
  // get workstation list
  getWorkstationList(url: any, getReq: any) {
    return this.httpService.postMethod(url, getReq);
  }
  getCellList(url: any, getReq: any) {
    return this.httpService.postMethod(url, getReq);
  }
}
