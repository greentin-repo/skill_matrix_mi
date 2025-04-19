import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/shared/auth/http.service';

@Injectable({
  providedIn: 'root'
})
export class CertificatesService {

  constructor(private httpService: HttpService,) { }

  //--------------------@saurabh---------------
  //gets certificate data
  getCertificateListData(url: any, reqbody: any) {
    return this.httpService.postMethod(url, reqbody);
  }

  // get branch access list 
  getBranchAccessListData(url: any) {
    return this.httpService.getMethod(url);
  }

  // get department list by branch id
  getdepartmentlistbybranchid(url: any) {
    return this.httpService.getMethod(url);
  }
}
