import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SkillMatrixService } from '../../skill-matrix.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';
import { AlertService } from 'src/app/theme/shared/components';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-stagelabel',
  templateUrl: './stagelabel.component.html',
  styleUrls: ['./stagelabel.component.scss']
})
export class StagelabelComponent implements OnInit {
  @Input() branchId: any;
  public isInputEnabled: boolean = false;
  @ViewChild('stageInputField') stageInputField: ElementRef;
  plantList: any = {};
  stage: any = {};
  isEditIconVisible: boolean = true;
  currentlyEditedStage: any = null;
  currentlyEditedStageId: number | null = null;
  isSubmitClicked = false;
  emphasize = false;
  isStageNameEmpty: boolean = false;
  singleDropdownSettings: IDropdownSettings = {};
  searchDet: any = {};
  userDet: any;
  stageList: any = [];
  listLoading: boolean = false;
  stageForm: FormGroup;
  borderColor: string = 'initial';
  isShowStageError: boolean = false;

  constructor(
    private skillMatrixService: SkillMatrixService,
    public alertService: AlertService,
    private formBuilder: FormBuilder
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.branchId && !changes.branchId.firstChange) {
      this.getStageList();
    }
  }
  ngOnInit() {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    this.getStageList();

    this.stageForm = this.formBuilder.group({
      stageLabelUpdate: ['', Validators.required]
    });

    this.singleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      noDataAvailablePlaceholderText: 'Data not found',
      closeDropDownOnSelection: true,
    };
  }


  /* get stage list
        @Author Saurabh S
       * @Date  Sept 29 
     */
  getStageList() {
    this.listLoading = true;
    console.log(this.branchId[0].id);
    const data = {
      "branchId": this.branchId[0].id,

    }

    this.skillMatrixService.getStageLevelList('apis/sm/getStageLabelList', data).subscribe((response: any) => {
      console.log(response);
      this.listLoading = false;
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.stageList = response.dataList;
          this.isStageNameEmpty = this.stageList.some(stage => stage.stageLabel !== null);

          if (this.stageList != null && this.stageList.length > 0) {
            for (let i = 0; i < this.stageList.length; i++) {
              this.stageList[i].isStageNameEmpty = false;
            }
          }
          this.stageList = this.stageList.map(stage => ({
            ...stage,
            originalStageLabel: stage.stageLabel
          }));
          if (this.stageList != null && this.stageList.length > 0) {
            for (let i = 0; i < this.stageList.length; i++) {
              this.stageList[i].isActive = false;
              this.stageList[i].isStageNameEmpty = false;
            }
          }
        } else {
          this.stageList = []
        }
      } else {
        this.stageList = []
      }
    }, (error: any) => {
      this.stageList = [];
      this.listLoading = false;
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

  /*
Single Select Dropdown onChange function
@Author Saurabh S
* @Date  Sept 29 2023
*/
  onChange(ev: any, type) {

    if (ev) {
    } else {
    }
  }
  /*
      Multi Select Dropdown onChange function
      @Author Saurabh S
    * @Date  Sept 29 2023
  */
  onChangeAll(ev: any, type) {
    if (ev) {
      console.log('Select All action');
    } else {
      console.log('Unselect All action');
    }
  }

  /*
        function updates stageLabel
        @Author Saurabh S
      * @Date  Sept 29 2023
    */
  updateStageLabel(x) {
    if (!x.stageLabel) {
      this.isShowStageError = true;
      return;
    }
    this.isShowStageError = false;
    this.isSubmitClicked = true;
    this.emphasize = !this.emphasize;
    console.log(x);

    this.listLoading = true;
    let data: any = {
      "branchId": this.branchId[0].id,
      "stageId": x.stageId,
      "stageLabel": x.stageLabel,
      "updatedBy": this.userDet.empId
    }
    if (x.stageLabelId != undefined && x.stageLabelId != "") {
      data.id = x.stageLabelId
    }
    console.log(data);

    this.skillMatrixService.updateStageData('apis/sm/updateStageLabel', data).subscribe((res: any) => {
      x.isEdited = false;
      this.listLoading = false;
      if (res.result) {
        this.isStageNameEmpty = true;
        this.alertService.success("Stage Label Updated Successfully");
        this.getStageList();
      } else {
        if (res.statusCode == 100) {
          this.alertService.error(res.reason);
        } else {
          this.alertService.error('Error occurred while updating data. Please try again');
        }
      }
    })
    this.isSubmitClicked = false;

  }



  /*
To reset input field
@Author Saurabh S
* @Date  Sept 29 2023
*/
  resetInput(x) {
    console.log(x);
    if (x.stageLabel !== x.originalStageLabel) {
      x.stageLabel = x.originalStageLabel; // Reset the input value to its original value
    }
    x.isEditable = false;
  }

  /*
To show reset button
@Author Saurabh S
* @Date  Sept 29 2023
*/
  onInputChange(stage) {
    stage.isInputEdited = true;
    // stage.isInputEdited = stage.stageLabel ? true : false;

  }

 /*
To show save button
@Author Saurabh S
* @Date  Sept 29 2023
*/
  toggleEdit(stage) {
    this.cancelEdit(this.currentlyEditedStage);
    this.currentlyEditedStageId = stage.stageId;
    this.currentlyEditedStage = stage;
    this.currentlyEditedStage.isEditable = true;
    this.currentlyEditedStage.originalStageLabel = this.currentlyEditedStage.stageLabel;

    setTimeout(() => {
      this.stageInputField.nativeElement.focus();
    }, 0);
  }

   /*
To show cancel button
@Author Saurabh S
* @Date  Sept 29 2023
*/
  cancelEdit(stage) {
    if (stage) {
      stage.stageLabel = stage.originalStageLabel;
      stage.isEditable = false;
    }
    this.currentlyEditedStageId = null;
    this.currentlyEditedStage = null;
  }

}
