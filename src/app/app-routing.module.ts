import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AuthService } from './shared/auth/auth.service';
import { AdminComponent } from './theme/layout/admin/admin.component';
// import { AuthComponent } from './theme/layout/auth/auth.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    // canActivate: [AuthService],
    children: [
      {
        path: '',
        redirectTo: 'mySkilling/actions',
        pathMatch: 'full',
      },
      {
        path: 'mySkilling',
        loadChildren: () => import('./modules/my-skilling/my-skilling.module').then(m => m.MySkillingModule)
      },
      {
        path: 'skillMatrix',
        loadChildren: () => import('./modules/skill-matrix/skill-matrix.module').then(m => m.SkillMatrixModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'report',
        loadChildren: () => import('./modules/report/report.module').then(m => m.ReportModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'uiKit',
        loadChildren: () => import('./modules/ui-kit/ui-kit.module').then(m => m.UiKitModule)
      }
    ]
  },
  // {
  //   path: '',
  //   component: AuthComponent,
  //   children: [
  //     { path: 'login', loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule) },
  //   ]
  // },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }