import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { NavigationItem } from '../../theme/layout/admin/navigation/navigation';
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {
  currentUrl: any;
  navigations: any;
  globalLoader: boolean = false;
  menuData: any = [];
  userDet: any = {};
  constructor(private router: Router, public nav: NavigationItem, private titleService: Title, private httpService: HttpService) {
    this.navigations = this.nav.get();
  }
  ngOnInit(): void {

  }
  getAuthorizationToken() {
    if (localStorage.getItem('userDet')) {
      let rec = JSON.parse(localStorage.getItem('userDet'));
      return rec.authToken;
    } else {
      return 'auth-token';
    }
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (localStorage.getItem('userDet')) {
      let obj = this.getCurrentMenu(state.url);
      this.menuData = JSON.parse(window.atob(localStorage.getItem('menuData')));
      if (obj && obj.hasOwnProperty('title')) {
        this.titleService.setTitle(obj.title);
      }
      if (obj && obj.hasOwnProperty('menuName') && obj.hasOwnProperty('subMenuName')) {
        if (!this.checkSubMenuAccess(obj.menuName, obj.subMenuName)) {
          // this.router.navigate(['my']); this.titleService.setTitle('My Action');
          this.router.navigateByUrl('template.html#!/homepageV1');
        }
      }
      // logged in so return true
      return true;
    }
    // not logged in so redirect to login page with the return url and return false
    this.router.navigate(['login']);
    return false;
  }
  getLoggedInUserData() {
    return JSON.parse(localStorage.getItem('userDet'));
  }


  getCurrentMenu(activeLink) {
    var currentMenuObj;
    if (this.navigations[0].children != null && this.navigations[0].children.length > 0) {
      this.navigations[0].children.forEach((a) => {
        if (a.type === 'item' && 'url' in a && a.url === activeLink) {
          currentMenuObj = a;
        } else if (a.type === 'collapse') {
          if (a.hasOwnProperty('children') && a.children != null && a.children.length > 0) {
            a.children.forEach((b) => {
              if (b.type === 'item' && 'url' in b && b.url === activeLink) {
                currentMenuObj = b;
              } else if (b.type === 'collapse') {
                if (b.hasOwnProperty('children') && b.children != null && b.children.length > 0) {
                  b.children.forEach((c) => {
                    if (c.type === 'item' && 'url' in c && c.url === activeLink) {
                      currentMenuObj = c;
                    } else {
                      if (c.type === 'collapse' && 'children' in c) {
                        c.children.forEach((d) => {
                          if (d.type === 'item' && 'url' in d && d.url === activeLink) {
                            currentMenuObj = d;
                          }
                        })
                      }
                    }
                  })
                }
              }
            })
          }
        }
      });
    }
    return currentMenuObj;
  }
  checkMenuAccess(menuName) {
    var flag = false;
    this.menuData = JSON.parse(window.atob(localStorage.getItem('menuData')));
    // console.log(this.menuData);
    if (this.menuData == null || this.menuData == undefined) {
      return flag;
    }
    for (let k = 0; k < this.menuData.length; k++) {
      if (this.menuData[k].menuName == "Skill Matrix") {
        for (var i = 0; i < this.menuData[k].subMenuList.length; i++) {
          if (this.menuData[k].subMenuList[i].subMenuName == menuName) {
            if (this.menuData[k].subMenuList[i].statusId == 1) {
              flag = true;
            }
          }
        }
      }
    }
    return flag;
  }

  checkSubMenuAccess(menuName, subMenuName) {
    var flag = false;
    this.menuData = JSON.parse(window.atob(localStorage.getItem('menuData')));
    // console.log(this.menuData);
    if (this.menuData == null || this.menuData == undefined) {
      return flag;
    }
    for (let k = 0; k < this.menuData.length; k++) {
      if (this.menuData[k].menuName == "Skill Matrix") {
        for (var i = 0; i < this.menuData[k].subMenuList.length; i++) {
          if (this.menuData[k].subMenuList[i].subMenuName == menuName) {
            if (this.menuData[k].subMenuList[i].statusId == 1) {
              flag = true;
            }
          }
        }
      }
    }
    return flag;
  }
  sortArray(array) {
    if (array.length > 0) {
      array.sort(function (a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    }
    return array;
  }
}
