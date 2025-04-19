import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { HttpService } from 'src/app/shared/auth/http.service';
@Injectable({
  providedIn: 'root'
})
export class EmployeeAssessmentService {
 

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) { }
  getSinglEmpAssessment(url: any) {
    return this.httpService.getMethod(url);
  }

}
