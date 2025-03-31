import { Component, OnInit, Input } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
// import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/shared/auth/http.service';

@Component({
  selector: 'app-loginInfo',
  templateUrl: './loginInfo.component.html',
  styleUrls: ['./loginInfo.component.scss'],
  providers: [NgbDropdownConfig]
})

export class LoginInfoComponent implements OnInit {
  @Input() title: string;
  loggedInEmpDet: any;
  menuData: any = [];
  constructor(config: NgbDropdownConfig,
    private titleService: Title,
    private router: Router,
    private httpService: HttpService) {
  }

  ngOnInit() {
    this.loggedInEmpDet = JSON.parse(localStorage.getItem('userDet'));
    if (this.loggedInEmpDet && this.loggedInEmpDet.profilePic) {

    } else {
      this.loggedInEmpDet.profilePic = 'assets/images/Profile.png';
    }
    var name = '';
    name += (this.loggedInEmpDet.firstName) ? this.loggedInEmpDet.firstName : '';
    name += (this.loggedInEmpDet.firstName && this.loggedInEmpDet.lastName) ? ' ' : '';
    name += (this.loggedInEmpDet.lastName) ? this.loggedInEmpDet.lastName : '';
    this.loggedInEmpDet.fullName = name;
    // this.title = this.titleService.getTitle();;
    // this.title = document.title;
    console.log(this.loggedInEmpDet)
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('../login.html');
  }

  ViewProfile() {
    this.router.navigateByUrl('../template.html#!/');
  }
}
