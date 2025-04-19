import { Injectable } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  function?: any;
  menuName: string;
  isSubMenu: boolean;
  subMenuName: string;
  isAccess: boolean;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}

const NavigationItems = [
  {
    id: 'eNovationMenu',
    title: 'eNovation Menu',
    type: 'group',
    icon: 'feather icon-monitor',
    children: [
      {
        id: 'myeNovation-home',
        title: 'Home',
        type: 'item',
        url: '../template.html',
        icon: '',
        img: 'assets/images/sidebarIcon/Home/Home@2x.png',
        isAccess: true,
        external: true
      },
      {
        id: 'mySkilling',
        title: 'My Skilling',
        type: 'collapse',
        icon: '',
        classes: 'masterMenu',
        img: 'assets/images/sidebarIcon/MySkillings/myskills@2x.png',
        menuName: 'My Skilling',
        isAccess: false,
        children: [
          {
            id: 'mySkilling-Actions',
            title: 'Actions',
            type: 'item',
            url: '/mySkilling/actions',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'My Skilling',
            subMenuName: "Actions",
            isAccess: false
          }, {
            id: 'mySkilling-Skill_Matrix',
            title: 'Skill Matrix',
            type: 'item',
            url: '/mySkilling/skillMatrix',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'My Skilling',
            subMenuName: "Skill Matrix",
            isAccess: false
          }, {
            id: 'mySkilling-Assessments',
            title: 'Assessments',
            type: 'item',
            url: '/mySkilling/assessments',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'My Skilling',
            subMenuName: "Assessments",
            isAccess: false
          }, {
            id: 'mySkilling-Certificates',
            title: 'Certificates',
            type: 'item',
            url: '/mySkilling/certificates',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'My Skilling',
            subMenuName: "Certificates",
            isAccess: false
          }
        ]
      },
      {
        id: 'skillMatrix',
        title: 'Skill Matrix',
        type: 'collapse',
        icon: '',
        classes: 'masterMenu',
        img: 'assets/images/sidebarIcon/MySkillings/myskills@2x.png',
        menuName: 'Skill Matrix',
        isAccess: false,
        children: [
          {
            id: 'skillMatrix-Home',
            title: 'Home',
            type: 'item',
            url: '/skillMatrix/home',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Skill Matrix',
            subMenuName: "Actions",
            isAccess: false
          },
          {
            id: 'skillMatrix-Actions',
            title: 'Actions',
            type: 'item',
            url: '/skillMatrix/actions',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Skill Matrix',
            subMenuName: "Actions",
            isAccess: false
          }, {
            id: 'skillMatrix-OJT_Plan',
            title: 'OJT Plan',
            type: 'item',
            url: '/skillMatrix/ojt_plan',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Skill Matrix',
            subMenuName: "OJT Plan",
            isAccess: false
          }, {
            id: 'skillMatrix-OJT_Registration',
            title: 'OJT Tracking',
            type: 'item',
            url: '/skillMatrix/ojt_registration',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Skill Matrix',
            subMenuName: "OJT Tracking",
            isAccess: false
          }, {
            id: 'skillMatrix-Workforce_Deployment',
            title: 'Workforce Deployment',
            type: 'item',
            url: '/skillMatrix/workforce_Deployment',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Skill Matrix',
            subMenuName: "Workforce Deployment",
            isAccess: false
          }, {
            id: 'skillMatrix-Assessment',
            title: 'Assessment',
            type: 'item',
            url: '/skillMatrix/assessments',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Skill Matrix',
            subMenuName: "Assessment",
            isAccess: false
          }, {
            id: 'skillMatrix-Certificate',
            title: 'Certificate',
            type: 'item',
            url: '/skillMatrix/certificates',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Skill Matrix',
            subMenuName: "Certificate",
            isAccess: false
          },
        ]
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: '',
        img: 'assets/images/sidebarIcon/Dashboard/dashboard@2x.png',
        isAccess: false,
        menuName: "Dashboard",
        subMenuName: "Dashboard"
      },
      {
        id: 'report',
        title: 'Reports',
        type: 'item',
        url: '/report',
        icon: '',
        img: 'assets/images/sidebarIcon/Report/Report@2x.png',
        isAccess: false,
        menuName: "Reports",
        subMenuName: "Reports"
      },
      {
        id: 'settings',
        title: 'Settings',
        type: 'collapse',
        icon: '',
        classes: 'masterMenu',
        img: 'assets/images/sidebarIcon/Setting/Setting@2x.png',
        menuName: 'Settings',
        isAccess: false,
        children: [
          {
            id: 'setting-configuration',
            title: 'Master Setup',
            type: 'item',
            url: '/settings/skillMatrix/configuration',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Settings',
            subMenuName: "Certificate",
            isAccess: false
          },
          {
            id: 'setting-workflow',
            title: 'Workflow',
            type: 'item',
            url: '/settings/skillMatrix/workflow',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Settings',
            subMenuName: "Workflow",
            isAccess: false
          },
          {
            id: 'setting-workStation',
            title: 'Workstation',
            type: 'item',
            url: '/settings/skillMatrix/workstation',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Settings',
            subMenuName: "Workstation",
            isAccess: false
          },
          {
            id: 'setting-stakeholder',
            title: 'User Role',
            type: 'item',
            url: '/settings/skillMatrix/stakeholder',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Settings',
            subMenuName: "User Role",
            isAccess: false
          },
          // {
          //   id: 'setting-referance',
          //   title: 'Reference',
          //   type: 'item',
          //   url: '/settings/skillMatrix/reference',
          //   classes: 'menuName',
          //   target: false,
          //   breadcrumbs: false,
          //   menuName: 'Settings',
          //   subMenuName: "Reference",
          //   isAccess: false
          // }, 
          {
            id: 'setting-assessment',
            title: 'Assessment',
            type: 'item',
            url: '/settings/skillMatrix/assessment',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Settings',
            subMenuName: "Assessment",
            isAccess: false
          }, {
            id: 'setting-ojtchecksheet',
            title: 'OJT Checksheet',
            type: 'item',
            url: '/settings/skillMatrix/ojtchecksheet',
            classes: 'menuName',
            target: false,
            breadcrumbs: false,
            menuName: 'Settings',
            subMenuName: "OJT Checksheet",
            isAccess: false
          },
          //  {
          //   id: 'setting-certificate',
          //   title: 'Certificate',
          //   type: 'item',
          //   url: '/settings/skillMatrix/certificates',
          //   classes: 'menuName',
          //   target: false,
          //   breadcrumbs: false,
          //   menuName: 'Settings',
          //   subMenuName: "Certificate",
          //   isAccess: false
          // }

        ]
      },
      // {
      //   id: 'uiKit',
      //   title: 'UI-Kit',
      //   type: 'item',
      //   url: '/uiKit',
      //   icon: '',
      //   img: 'assets/images/sidebarIcon/Report/Report@2x.png',
      //   isAccess: false,
      //   menuName: "UI-Kit",
      //   subMenuName: "Report"
      // },
      {
        id: 'logout',
        title: 'Logout',
        type: 'item',
        url: '../login.html',
        icon: '',
        img: 'assets/images/sidebarIcon/Logout/log-out@2x.png',
        isAccess: true,
        external: true
      }]
  }
];

@Injectable()
export class NavigationItem {

  public get() {
    return NavigationItems;
  }
}
