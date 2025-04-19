import { Component, OnInit, Input } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
// import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topBar',
  templateUrl: './topBar.component.html',
  styleUrls: ['./topBar.component.scss'],
  providers: [NgbDropdownConfig]
})

export class TopBarComponent implements OnInit {
  @Input() title: string;
  loggedInEmpDet: any = {};
  constructor(config: NgbDropdownConfig,
    private titleService: Title,
    private router: Router) {
  }

  ngOnInit() {
    this.loggedInEmpDet = JSON.parse(localStorage.getItem('userDet'));
    // this.title = this.titleService.getTitle();;
    // this.title = document.title;
  }
  logout() {
    localStorage.clear();
    this.router.navigateByUrl('../login.html');

  }
}
