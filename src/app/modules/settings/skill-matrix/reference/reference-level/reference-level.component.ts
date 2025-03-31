import { Component, OnInit } from '@angular/core';
import { SkillMatrixService } from '../../skill-matrix.service';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-reference-level',
  templateUrl: './reference-level.component.html',
  styleUrls: ['./reference-level.component.scss']
})
export class ReferenceLevelComponent implements OnInit {
  listLoading: boolean = false;
  refMasterCertificateLevel: any;
  isLevelListLoading: boolean = false;

  constructor(
    modalConfig: NgbModalConfig,
    private skillMatrixService: SkillMatrixService) { }

  ngOnInit(): void {
    this.getRefMasterCertificateLevel();
  }

  getRefMasterCertificateLevel() {
    this.isLevelListLoading = true
    this.skillMatrixService.getMasterCertificateData('apis/sm/getLevelList').subscribe((response: any) => {
      if (response.result) {
        this.isLevelListLoading = false
        if(response.dataList != null && response.dataList.length > 0){
          this.refMasterCertificateLevel = response.dataList;
        }
        else{
          this.refMasterCertificateLevel = [];
        }
        
      } else {
        this.refMasterCertificateLevel = [];
      }
    })
  }
}
