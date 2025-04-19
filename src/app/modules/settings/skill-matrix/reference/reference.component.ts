import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss']
})
export class ReferenceComponent implements OnInit {
  mainTab: any;
  constructor(
    private router: Router,
    
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.mainTab = 1;
  }

  isSetMainTab = function (tabId) {
    return this.mainTab === tabId;
  };

  setMainTab(tabId) {
    this.mainTab = tabId;
    if (this.mainTab == 1) {

    } else if (this.mainTab == 2) {

    } else if (this.mainTab == 3) {

    } else if (this.mainTab == 4) {

    }
  };
}
