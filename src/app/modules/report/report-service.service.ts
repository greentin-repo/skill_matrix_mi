import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { HttpService } from 'src/app/shared/auth/http.service';

@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {

  constructor(private httpService: HttpService,
    private authService: AuthService) { }
  /* Get Report List */
  getReportList(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }
  /* Get Department List by BranchId */
  getDepartmentByBranch(url: any) {
    return this.httpService.getMethod(url);
  }
  // get branch access list 
  getBranchAccessList(url: any) {
    return this.httpService.getMethod(url);
  }
  // get level  list 
  getMasterLevelList(url: any) {
    return this.httpService.getMethod(url);
  }
  // get line list 
  getLineNameList(url: any, reqBody: any) {
    return this.httpService.postMethod(url, reqBody);
  }

}
