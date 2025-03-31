import { Component, OnInit } from '@angular/core';
import { SkillMatrixService } from '../skill-matrix.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AlertService } from 'src/app/theme/shared/components';

@Component({
  selector: 'app-stage-and-workflow',
  templateUrl: './stage-and-workflow.component.html',
  styleUrls: ['./stage-and-workflow.component.scss']
})

export class StageAndWorkflowComponent implements OnInit {
  submitLoader: boolean = false;
  selectedLevelData: any = {};
  selectedBranch: any = {};
  levelList: any = [];
  isDisabled: boolean;
  listLoading: boolean = false;
  branchAccessList: any = [];
  stageList: any = [];
  userDet: any = {};
  stageDet: any = {};
  workflowStageList: any = [];
  workflowConfigList: any = [];
  SingleDropdownSettings: { singleSelection: boolean; idField: string; textField: string; allowSearchFilter: boolean; closeDropDownOnSelection: boolean; };


  constructor(
    private skillMatrixService: SkillMatrixService,
    private alertService: AlertService
  ) { }


  ngOnInit() {
    // this.selectedBranch.branch = [];
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    console.log(this.userDet);
    this.getBranchAccessList();

    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.getLevelList();
    // this.getWorkflowConfigList();
  }
  /* get skill level list
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  getLevelList() {
    this.skillMatrixService.getLevelList('apis/sm/getLevelList').subscribe((response: any) => {
      console.log(response)
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.levelList = response.dataList;
          this.selectedLevelData.id = this.levelList[0].id;
          console.log();

          this.selectedLevelData.levelName = this.levelList[0].levelName;
        } else {
          this.levelList = []
        }
        this.getWorkflowConfigList();
      } else {
        this.levelList = []
      }
    })
  }
  /* get stage list
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  // getStageList() {
  //   const data = {
  //     branchId: this.selectedBranch.branch[0].id
  //   }
  //   console.log(data);

  //   this.skillMatrixService.getStageList('apis/sm/getStageLabelList', data).subscribe((response: any) => {
  //     console.log(response);
  //     if (response.result) {
  //       if (response.dataList != null && response.dataList.length > 0) {
  //         this.stageList = response.dataList;
  //         if (this.stageList != null && this.stageList.length > 0) {
  //           for (let i = 0; i < this.stageList.length; i++) {

  //             if (this.stageList[i].stageCaption === 'Stage1DayWise' || this.stageList[i].stageCaption === 'Stage2DayWise' || this.stageList[i].stageCaption === 'Stage5') {
  //               this.stageList[i].isDisabled = true;
  //             } else {
  //               this.stageList[i].isDisabled = false;

  //             }
  //           }
  //         }
  //         this.getWorkflowConfigList();
  //       } else {
  //         this.stageList = []
  //       }
  //     } else {
  //       this.stageList = []
  //     }
  //   })
  // }
  /* get branch access list on organization and logged in employee
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  getBranchAccessList() {
    this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        console.log(response);

        if (response.branchAccessList != null && response.branchAccessList.length > 0) {

          this.branchAccessList = this.setArray(response.branchAccessList, 'branchId', 'branchName');
          this.branchAccessList = this.sortFunction(this.branchAccessList, 'name');
          console.log(this.branchAccessList);
          this.selectedBranch.branchId = [this.branchAccessList[0]];
          /* Use For Filter */
          // this.selectedBranch.branchId = this.setArray(response.branchAccessList, 'branchId', 'branchName');
        } else {
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
          /* Use For Filter */
          this.selectedBranch.branchId = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      }

      else {
        this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        /* Use For Filter */
        this.selectedBranch.branchId = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
      this.selectedBranch.branch = [this.branchAccessList[0]];
      this.selectedBranch.branched = this.selectedBranch.branchId[0];
      console.log(this.selectedBranch.branch);
      this.onChangeBranch(this.selectedBranch.branched);


    })
  }



  /* change branch on branch selection and call stage list and Workflow Config List
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  onChangeBranch(event: any) {
    console.log(event);
    if (event) {
      this.submitLoader = false
      this.selectedBranch.branched = event;
      console.log(this.selectedBranch.branch);
      // this.getStageList();
      this.getWorkflowConfigList();
    }
    else {
      this.submitLoader = true;
      this.workflowStageList = []
    }
  }
  /* get workflow config list on branch selection
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  getWorkflowConfigList() {
    this.listLoading = true;
    if (this.selectedBranch.branched.id && this.selectedLevelData.id) {
      this.workflowConfigList = [];
      this.skillMatrixService.getWorkflowConfigList('apis/sm/getWorkflowConfigList/' + this.selectedBranch.branched.id + '/' + this.selectedLevelData.id).subscribe((response: any) => {
        console.log(response);
        this.listLoading = false;
        if (response.result) {
          console.log(response);
          this.workflowStageList = response.dataList;

          if (this.workflowStageList != null && this.workflowStageList.length > 0) {
            for (let i = 0; i < this.workflowStageList.length; i++) {
              if (this.workflowStageList[i].stageCaption === 'Stage1DayWise' || this.workflowStageList[i].stageCaption === 'Stage2DayWise' || this.workflowStageList[i].stageCaption === 'Stage5' || this.workflowStageList[i].stageCaption === 'Stage4') {
                this.workflowStageList[i].isDisabled = true;
                this.workflowStageList[i].isActive = true;
              } else {
                this.workflowStageList[i].isDisabled = false;
              }
            }
          }

          // Create a mapping of workflow stages by stageId
          const workflowMapping = {};
          this.workflowStageList.forEach(workflowStage => {
            workflowMapping[workflowStage.stageId] = workflowStage;
          });

          // Update the stageList with data from workflowStageList
          this.workflowStageList.forEach(stage => {
            const workflowStage = workflowMapping[stage.stageId];
            if (workflowStage) {
              stage.isActive = workflowStage.isActive;
              stage.skillLevelId = this.selectedLevelData.id;
              stage.branchName = this.selectedBranch.branch[0].branchName;
              stage.levelName = this.selectedLevelData.levelName;
              stage.workflowId = workflowStage.id;
            }
          });

          if (this.workflowStageList != null && this.workflowStageList.length > 0) {
            for (let i = 0; i < this.workflowStageList.length; i++) {
              this.handleCheckboxClick(this.workflowStageList[0])
            }
          }
          // Print the updated stageList
          // this.stageList.forEach(stage => {
          //   console.log(stage);
          // });
          console.log(this.workflowStageList)
        }
        else {
          this.workflowStageList = [];
        }

      }, (error: any) => {
        this.listLoading = false;
        this.workflowStageList = [];
      })
    }
  }
  /* change selected skill level on level selection
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  selectLevel(rec) {
    console.log(rec)
    this.selectedLevelData = rec;
    // this.getStageList();
    this.selectedLevelData.reviewType = true;
    this.getWorkflowConfigList();

  }
  /* save and delete the workflow setup on selection 
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  handleCheckboxClick(stage: any) {
    console.log(stage);
    // Toggle the isActive value
    if (stage.stageCaption !== "Stage1DayWise") {
      stage.isActive = !stage.isActive;
    }
    const existingIndex = this.workflowConfigList.findIndex(item =>
      item.stageId === stage.stageId && item.skillLevelId === stage.skillLevelId);
    const updatedObject = {
      stageId: stage.stageId,
      skillLevelId: stage.skillLevelId || this.selectedLevelData.id,
      isActive: stage.isActive
    };
    if (stage.workflowId) {
      updatedObject['workflowId'] = stage.workflowId;
    }
    if (existingIndex !== -1) {
      if (this.workflowConfigList[existingIndex].isActive !== stage.isActive ||
        this.workflowConfigList[existingIndex].workflowId !== stage.workflowId) {
        this.workflowConfigList[existingIndex] = updatedObject;
      }
    } else {
      // Check for duplicate stageId
      const duplicateIndex = this.workflowConfigList.findIndex(item =>
        item.stageId === updatedObject.stageId && item.skillLevelId === updatedObject.skillLevelId);

      if (duplicateIndex !== -1) {
        this.workflowConfigList[duplicateIndex] = updatedObject;
      } else {
        this.workflowConfigList.push(updatedObject);
      }
    }
    console.log(this.workflowConfigList);
  }

  /* delete the Workflow Config setup
     @Author Jayshri Kolase
    * @Date August 18, 2023
  */
  deleteWorkflowConfig() {
    let delConfigReq = {
      "workflowId": this.stageDet.workflowId,
      "updatedBy": this.userDet.empId
    }
    this.skillMatrixService.deleteWorkflowConfig('apis/sm/deleteWorkflowConfig', delConfigReq).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        this.alertService.success('Workflow setup removed successfully.');
        // this.getStageList();
        this.workflowConfigList();

      }
      else {
        this.alertService.error('Error occurred while removing data. Please try again.')
      }
    })
  }
  /* save or add the Workflow Config setup
    @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  saveWorkFlow() {
    this.workflowConfigList = this.workflowConfigList.map(configStage => {
      const matchingStage = this.workflowStageList.find(stage =>
        stage.stageId === configStage.stageId && stage.skillLevelId === configStage.skillLevelId);

      if (matchingStage) {
        configStage.isActive = matchingStage.isActive;
      }

      return configStage;
    });

    this.workflowStageList.forEach(stage => {
      const existingIndex = this.workflowConfigList.findIndex(configStage =>
        configStage.stageId === stage.stageId && configStage.skillLevelId === stage.skillLevelId);

      if (existingIndex === -1) {
        this.workflowConfigList.push({
          stageId: stage.stageId,
          skillLevelId: stage.skillLevelId || this.selectedLevelData.id,
          isActive: stage.isActive,
          workflowId: stage.workflowId
        });
      }
    });

    console.log(this.workflowConfigList);
    let workflowReq = {
      "branchId": this.selectedBranch.branched.id,
      "createdBy": this.userDet.empId,
      "workflowConfigList": this.workflowConfigList
    }
    console.log(workflowReq)


    // return;
    this.listLoading = true;
    this.skillMatrixService.saveWorkflowSetup('apis/sm/saveWorkflowConfig', workflowReq).subscribe((response: any) => {
      this.listLoading = false;
      if (response.result) {
        this.alertService.success('Workflow setup submitted successfully.');
        // this.getStageList();
        this.getWorkflowConfigList()
        // this.getInterWorkflowDetails(true);
      } else {
        if (response.statusCode == 100) {
          this.alertService.error(response.reason);
        } else {
          this.alertService.error('Error occurred while submitting data. Please try again.')

        }
      }
    })
  }
  /*
      Common function for set an array for dropdown
       @Author Saurabh S
    * @Date  Sept 29 2023
  */
  setArray(array, key1, key2) {
    let tmpArray = [];
    if (array != null && array.length > 0) {
      for (const element of array) {
        element.id = element[key1];
        element.name = element[key2];
        tmpArray.push(element);
      }
    }
    return tmpArray;
  }
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "plant") {
        array.sort(function (a, b) {
          var nameA = a.name ? a.name.toUpperCase() : "";
          var nameB = b.name ? b.name.toUpperCase() : "";
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
      }
    }
    return array;
  }
  sortFunction(array, key) {
    if (array != null && array.length > 0) {
      array.sort(function (a, b) {
        var nameA = (!Number(a[key])) ? a[key].toUpperCase() : a[key];
        var nameB = (!Number(b[key])) ? b[key].toUpperCase() : b[key];
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
