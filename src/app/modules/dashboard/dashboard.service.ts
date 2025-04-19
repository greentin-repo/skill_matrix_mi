import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/shared/auth/http.service';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    constructor(private httpService: HttpService) { }
    // get branch access list 
    getBranchAccessList(url: any) {
        return this.httpService.getMethod(url);
    }
    // get department list by branch id
    getdepartmentlistbybranchid(url: any) {
        return this.httpService.getMethod(url);
    }
    getLevelAnalytics(url: any, data: any) {
        return this.httpService.postMethod(url, data);
    }
    getLineNameList(url: any, data: any) {
        return this.httpService.postMethod(url, data);
      }
}