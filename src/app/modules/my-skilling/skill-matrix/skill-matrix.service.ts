import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/shared/auth/http.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
@Injectable({
  providedIn: 'root'
})
export class SkillMatrixService {

  constructor(private httpService: HttpService,
    private authService: AuthService) { }

  /* 
    Get Master Skill Level List simran
  */
  getMasterLevelList(url: string) {
    return this.httpService.getMethod(url);
  }

  // get branch access list simran
  getBranchAccessList(url: any) {
    return this.httpService.getMethod(url);
  }
  /* User Login details */
  getLoggedInData() {
    return this.authService.getLoggedInUserData();
  }
  getSkillMatrixList(req: any) {
    return this.httpService.postMethod('apis/sm/getSkillMatrixList', req);
  }

  //-------------API's saurabh salunke------
  //get skillmatrixmlis
  getActionList(url: any, req: any) {
    return this.httpService.postMethod(url, req);
  }
  // get department list by branch id
  getdepartmentlistbybranchid(url: any) {
    return this.httpService.getMethod(url);
  }
  getSkillMatrixetails(url: any) {
    return this.httpService.getMethod(url);
  }
}
