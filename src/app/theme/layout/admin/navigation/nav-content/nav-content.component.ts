import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationItem } from '../navigation';
import { NextConfig } from '../../../../../app-config';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { environment } from 'src/environments/environment.prod';
@Component({
  selector: 'app-nav-content',
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit, AfterViewInit {
  public nextConfig: any;
  public navigation: any;
  public prevDisabled: string;
  public nextDisabled: string;
  public contentWidth: number;
  public wrapperWidth: any;
  public scrollWidth: any;
  public windowWidth: number;
  version: any = environment.version;
  @Output() onNavMobCollapse = new EventEmitter();


  @ViewChild('navbarContent', { static: false }) navbarContent: ElementRef;
  @ViewChild('navbarWrapper', { static: false }) navbarWrapper: ElementRef;

  constructor(
    public nav: NavigationItem, private zone: NgZone, private location: Location, public authService: AuthService) {
    this.nextConfig = NextConfig.config;
    this.windowWidth = window.innerWidth;

    // this.navigation = this.nav.get();
    // this.setAccessForMenu();
    this.resetAccess();
    this.prevDisabled = 'disabled';
    this.nextDisabled = '';
    this.scrollWidth = 0;
    this.contentWidth = 0;
  }

  ngOnInit() {
    if (this.windowWidth < 992) {
      this.nextConfig['layout'] = 'vertical';
      setTimeout(() => {
        document.querySelector('.pcoded-navbar').classList.add('menupos-static');
        (document.querySelector('#nav-ps-next') as HTMLElement).style.maxHeight = '100%';
      }, 500);
    }
    this.setAccessForMenu();
  }
  setAccessForMenu() {
    var menuList = this.nav.get();
    console.log("menulist is", menuList)
    if (localStorage.getItem('userDet')) {
      if (menuList != null && menuList.length > 0) {
        if (menuList[0].children != null && menuList[0].children.length > 0) {
          menuList[0].children.forEach((a: any) => {
            if (a.type === 'item') {
              if ('menuName' in a && !a.hasOwnProperty('subMenuName') && 'isAccess' in a) {
                if (a.menuName == 'Help') {
                  a.isAccess = true;
                } else {
                  a.isAccess = this.authService.checkMenuAccess(a.menuName);
                }
                // a.url = (this.authService.checkMenuAccess(a.menuName)) ? a.url : 'javascript:';
              } else if ('menuName' in a && 'subMenuName' in a && 'isAccess' in a) {
                a.isAccess = this.authService.checkSubMenuAccess(a.menuName, a.subMenuName);
                // a.url = (this.authService.checkSubMenuAccess(a.menuName, a.subMenuName)) ? a.url : 'javascript:';
              }
              if ('hidden' in a) {
                a.hidden = !this.authService.checkMenuAccess(a.menuName);
              }
            } else if (a.type === 'collapse') {
              if ('menuName' in a && !a.hasOwnProperty('subMenuName') && 'isAccess' in a) {
                // a.url = (this.authService.checkMenuAccess(a.menuName)) ? a.url : 'javascript:';
                if (a.menuName == 'Setting') {
                  var flag = false;
                  if (a.children != null && a.children.length > 0) {
                    for (let index = 0; index < a.children.length; index++) {
                      if (this.authService.checkMenuAccess(a.children[index].menuName)) {
                        flag = true;
                      }
                    }
                  }
                  a.isAccess = flag;
                } else {
                  a.isAccess = this.authService.checkMenuAccess(a.menuName);
                }
                if ('hidden' in a) {
                  a.hidden = !this.authService.checkMenuAccess(a.menuName);
                }
              }
              if (a.hasOwnProperty('children') && a.children != null && a.children.length > 0) {
                a.children.forEach((b: any) => {
                  if (b.type === 'item') {
                    if ('menuName' in b && !b.hasOwnProperty('subMenuName') && 'isAccess' in b) {
                      b.isAccess = this.authService.checkMenuAccess(b.menuName);
                      //b.url = (this.authService.checkMenuAccess(b.menuName)) ? b.url : 'javascript:';
                    } else if ('menuName' in b && 'subMenuName' in b && 'isAccess' in b) {
                      b.isAccess = this.authService.checkSubMenuAccess(b.menuName, b.subMenuName);
                      //b.url = (this.authService.checkSubMenuAccess(b.menuName, b.subMenuName)) ? b.url : 'javascript:';
                    }
                  } else if (b.type === 'collapse') {
                    if ('menuName' in b && !b.hasOwnProperty('subMenuName') && 'isAccess' in b) {
                      b.isAccess = this.authService.checkMenuAccess(b.menuName);
                      //b.url = (this.authService.checkMenuAccess(b.menuName)) ? b.url : 'javascript:';
                    }
                    if (b.hasOwnProperty('children') && b.children != null && b.children.length > 0) {
                      b.children.forEach((c: any) => {
                        if (c.type === 'item') {
                          if ('menuName' in c && !c.hasOwnProperty('subMenuName') && 'isAccess' in c) {
                            c.isAccess = this.authService.checkMenuAccess(c.menuName);
                            //c.url = (this.authService.checkMenuAccess(c.menuName)) ? c.url : 'javascript:';
                          } else if ('menuName' in c && 'subMenuName' in c && 'isAccess' in c) {
                            c.isAccess = this.authService.checkSubMenuAccess(c.menuName, c.subMenuName);
                            //c.url = (this.authService.checkSubMenuAccess(c.menuName, c.subMenuName)) ? c.url : 'javascript:';
                          }
                        } else {
                          if (c.type === 'collapse') {
                            if ('menuName' in c && !b.hasOwnProperty('subMenuName') && 'isAccess' in c) {
                              c.isAccess = this.authService.checkMenuAccess(c.menuName);
                              //c.url = (this.authService.checkMenuAccess(c.menuName)) ? c.url : 'javascript:';
                            }
                            if (c.hasOwnProperty('children') && c.children != null && c.children.length > 0) {
                              c.children.forEach((d: any) => {
                                if (d.type === 'item') {
                                  if ('menuName' in d && !d.hasOwnProperty('subMenuName') && 'isAccess' in d) {
                                    d.isAccess = this.authService.checkMenuAccess(d.menuName);
                                    //d.url = (this.authService.checkMenuAccess(d.menuName)) ? d.url : 'javascript:';
                                  } else if ('menuName' in d && 'subMenuName' in d && 'isAccess' in d) {
                                    d.isAccess = this.authService.checkSubMenuAccess(d.menuName, d.subMenuName);
                                    //d.url = (this.authService.checkSubMenuAccess(d.menuName, d.subMenuName)) ? d.url : 'javascript:';
                                  }
                                }
                              })
                            }
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
      }
      this.navigation = menuList;
    } else {
      this.navigation = menuList;
    }
    console.log(this.navigation);
  }
  resetAccess() {
    var menuList = this.nav.get();
    if (menuList != null && menuList.length > 0) {
      if (menuList[0].children != null && menuList[0].children.length > 0) {
        menuList[0].children.forEach((a) => {
          if (a.type === 'item') {
            a.isAccess = true;
          } else if (a.type === 'collapse') {
            a.isAccess = true;
            if (a.hasOwnProperty('children') && a.children != null && a.children.length > 0) {
              a.children.forEach((b) => {
                if (b.type === 'item') {
                  b.isAccess = true;
                } else if (b.type === 'collapse') {
                  b.isAccess = true;
                  // if (b.hasOwnProperty('children') && b.children != null && b.children.length > 0) {
                  //   b.children.forEach((c) => {
                  //     if (c.type === 'item') {
                  //       c.isAccess = true;
                  //     } else {
                  //       if (c.type === 'collapse') {
                  //         c.isAccess = true;
                  //         if (c.hasOwnProperty('children') && c.children != null && c.children.length > 0) {
                  //           c.children.forEach((d) => {
                  //             if (d.type === 'item') {
                  //               d.isAccess = true;
                  //             }
                  //           })
                  //         }
                  //       }
                  //     }
                  //   })
                  // }
                }
              })
            }
          }
        });
      }
    }
    this.navigation = menuList;
    console.log(this.navigation);
  }
  ngAfterViewInit() {
    if (this.nextConfig['layout'] === 'horizontal') {
      this.contentWidth = this.navbarContent.nativeElement.clientWidth;
      this.wrapperWidth = this.navbarWrapper.nativeElement.clientWidth;
    }
  }

  scrollPlus() {
    this.scrollWidth = this.scrollWidth + (this.wrapperWidth - 80);
    if (this.scrollWidth > (this.contentWidth - this.wrapperWidth)) {
      this.scrollWidth = this.contentWidth - this.wrapperWidth + 80;
      this.nextDisabled = 'disabled';
    }
    this.prevDisabled = '';
    if (this.nextConfig.rtlLayout) {
      (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginRight = '-' + this.scrollWidth + 'px';
    } else {
      (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginLeft = '-' + this.scrollWidth + 'px';
    }
  }

  scrollMinus() {
    this.scrollWidth = this.scrollWidth - this.wrapperWidth;
    if (this.scrollWidth < 0) {
      this.scrollWidth = 0;
      this.prevDisabled = 'disabled';
    }
    this.nextDisabled = '';
    if (this.nextConfig.rtlLayout) {
      (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginRight = '-' + this.scrollWidth + 'px';
    } else {
      (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginLeft = '-' + this.scrollWidth + 'px';
    }

  }

  fireLeave() {
    const sections = document.querySelectorAll('.pcoded-hasmenu');
    for (let i = 0; i < sections.length; i++) {
      sections[i].classList.remove('active');
      sections[i].classList.remove('pcoded-trigger');
    }

    let current_url = this.location.path();
    if (this.location['_baseHref']) {
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent.parentElement.parentElement;
      const last_parent = up_parent.parentElement;
      if (parent.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('active');
      } else if (up_parent.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('active');
      }
    }
  }

  navMob() {
    if (this.windowWidth < 992 && document.querySelector('app-navigation.pcoded-navbar').classList.contains('mob-open')) {
      this.onNavMobCollapse.emit();
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    if (this.location['_baseHref']) {
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent.parentElement.parentElement;
      const last_parent = up_parent.parentElement;
      if (parent.classList.contains('pcoded-hasmenu')) {
        if (this.nextConfig['layout'] === 'vertical') {
          parent.classList.add('pcoded-trigger');
        }
        parent.classList.add('active');
      } else if (up_parent.classList.contains('pcoded-hasmenu')) {
        if (this.nextConfig['layout'] === 'vertical') {
          up_parent.classList.add('pcoded-trigger');
        }
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('pcoded-hasmenu')) {
        if (this.nextConfig['layout'] === 'vertical') {
          last_parent.classList.add('pcoded-trigger');
        }
        last_parent.classList.add('active');
      }
    }
  }

}
