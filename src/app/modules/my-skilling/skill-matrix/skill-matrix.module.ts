import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkillMatrixRoutingModule } from './skill-matrix-routing.module';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { HttpClient } from '@angular/common/http';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LoginInfoModule, TopBarModule } from 'src/app/theme/shared/components';
import { SharedModule } from '../../../theme/shared/shared.module';
import { SkillMatrixDetailsComponent } from './skill-matrix-details/skill-matrix-details.component';
import { SkillMatrixComponent } from './skill-matrix.component';

// export function attendanceHttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/training/attendance/', '.json');
// }

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SkillMatrixRoutingModule,
    NgMultiSelectDropDownModule,
    TopBarModule,
    LoginInfoModule,
    SharedModule,
    // TranslateModule.forChild({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: attendanceHttpLoaderFactory,
    //     deps: [HttpClient]
    //   },
    //   isolate: true
    // }),
    // TranslateLoader,
    // TranslateHttpLoader
  ],
})
export class SkillMatrixModule { }
