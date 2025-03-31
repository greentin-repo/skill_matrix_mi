import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AssessmentService } from 'src/app/modules/settings/skill-matrix/assessment/assessment.service';
import { AlertService } from '../alert/alert.service';
import { Title } from '@angular/platform-browser';
import { EmployeeAssessmentService } from './employee-assessment.service'

@Component({
  selector: 'app-assessessment-detail-modal',
  templateUrl: './assessessment-detail-modal.component.html',
  styleUrls: ['./assessessment-detail-modal.component.scss']
})
export class AssessessmentDetailModalComponent implements OnInit {
  // @Input() close;
  @Input() selectedDetail;
  // @Input() masterActivity;
  assessmentDet: any = {
    tempQues: {
      categoryList: [],
      subCategoryList: []
    }
  };
  assessmentDetails: any = {
    moduleSkillList: [],
    interventionsList: [],
    categoryList: [],
    subCategoryList: [],
  }
  selectedOption: ''
  selectedCategeory: any = [];
  selectedSubCategeory: any = [];
  addQuestion: boolean = false;
  editAssessment: boolean = false;
  readonly: boolean = false;
  selectedQuestionType: any = [];
  questionsList: any = [];
  mainQueList: any = [];
  catUpdateFlag: boolean = false;
  showQuestions: boolean = false;
  loggedInEmpDet: any;
  SingleDropdownSettings: IDropdownSettings = {};
  SingleBranchDropdownSettings: IDropdownSettings = {};
  selectedItem: any = [];
  categoryListIds: any = [];
  formdata: FormGroup;
  assessmentForm: FormGroup;
  editQuestionPopup: boolean = false;
  submitLoader: boolean = false;
  subCatList: any = [];
  catAndSubCatList: any = [];
  subCatDataList: any = [];
  subCatSpinner: any = [];
  submitAssessment: boolean = false;
  categoryDisableEnabled: boolean = true;
  addQuestionDisabled: boolean = true;
  submitCatLoader: boolean = false;
  isFeedBackSelect: boolean = false;
  selectedDet: any;
  applicableNumOfQues: any;
  // assessmentFormData:any = { template: any[]; intervention: any[]; SkillandModule: any[]; assessmentTitle: string; time: number; marksApplicable: any[]; };
  dataSpinner: any = [];
  plantList: any = [];
  masterLevelList: any = [];
  empAssessmentDet: any = {};
  Constant: any = {};
  // constant: any = {};
  assessmentDetailData: any = {};
  selectedOptions: any;

  constant = {
    SELF_ASSESSMENT: 'SELF_ASSESSMENT',
    MCQ_ASSESSMENT: 'MCQ',
    TEXT: 'TEXT',
    RATING: 'RATING',
    RADIO: 'RADIO',
    CHECKBOX: 'CHECKBOX',
    TEXTAREA: 'TEXTAREA',
    AlphabetLetter: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    TRAINING_FEEDBACK: 'TRAINING_FEEDBACK',
    CHARTER_TYPE: 'CHARTER_TYPE',
    OE: 'OE',
    APQP: 'APQP',
    ALDP: 'ALDP'
};
  constructor(modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public assessmentService: AssessmentService,
    private assessmentServiceEmp: EmployeeAssessmentService,
    private router: Router,
    private alertService: AlertService,
    private titleService: Title,
    @Inject('Constant') Constant: any) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
    this.Constant = Constant;
    // this.constant = Constant;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Assessment Details');
    this.loggedInEmpDet = this.assessmentService.getLoggedInData();
    this.assessmentForm = this.fb.group({
      branchId: new FormControl('', Validators.required),
      skillLvlId: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      time: new FormControl('', Validators.required),
      passingMark: new FormControl('', Validators.required),
    });
    // this.formdata = this.fb.group({
    //   category: [this.selectedCategeory],
    //   subCategory: [this.selectedSubCategeory],
    //   questionTypeName: [this.selectedQuestionType],
    // });
    console.log(this.selectedDetail)
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    // this.assessmentDetailData = localStorage.setItem(this.selectedDetail)
    this.assessmentDetailData = this.selectedDetail
    console.log(this.assessmentDetailData)
    if (this.assessmentDetailData.ojtAssessmentId != '' || this.assessmentDetailData.ojtAssessmentId != null) {
      this.getEmpAssessmentDetails(this.assessmentDetailData)
    }
  }

  // Assessment Detail
  // author simran
  // Desc You will get assessment detail here
  // created date 04/09/2023
  getEmpAssessmentDetails(content) {
    this.assessmentServiceEmp.getSinglEmpAssessment('apis/sm/getAssignedAssessmentDetails/' + this.assessmentDetailData.ojtAssessmentId).subscribe((data: any) => {
      console.log(data)
      if (data.result) {
        this.getAssessmentDet(data, content);

      } else {
        if (data.statusCode == 100) {
          this.alertService.error(data.reason);
          this.empAssessmentDet = {};
        } else {
          this.empAssessmentDet = {};
          this.alertService.error("Error Occured Please Try again");
        }
      }
    })
  }

  // Assessment Detail
  // author simran
  // Desc for showing which ans is user selected
  // created date 04/09/2023
  getAssessmentDet(data, content) {
    // if (data.assessment != null) {
    if (data.assessment != null) {
      // data.assessment.quesList.forEach((ques: any) => {
      //   if (ques.optList) {
      //     console.log(ques.optList)
      //     // Find the option with rightAns set to true
      //     const correctOption = ques.optList.find((opt: any) => opt.rightAns === true);
      //     // If a correct option is found, set selectedOption to its value
      //     if (correctOption) {
      //       ques.selectedOption = correctOption.option;
      //     }
      //     else {
      //       // If no correct option is found, set selectedOption to null or a default value
      //       ques.selectedOption = null; // or any default value you prefer
      //     }
      //   }
      // });

      // if (data.assessment.quesList != null && data.assessment.quesList.length > 0) {

        // for (let index = 0; index < data.assessment.quesList.length; index++) {
        //   data.assessment.quesList[index].rightAns = '';
        //   if (data.assessment.quesList[index].optList != null && data.assessment.quesList[index].optList.length > 0) {
        //     for (let opt = 0; opt < data.assessment.quesList[index].optList.length; opt++) {
        //       if (data.assessment.quesList[index].optList[opt].rightAns) {
        //         data.assessment.quesList[index].rightAns = opt.toString();
        //         break;
        //       }
        //     }
        //   }

        // }

      // }
      this.empAssessmentDet = data.assessment;
      console.log(this.empAssessmentDet)
      this.setSubCategoryGroup();
      // this.modalService.open(content, {
      //   windowClass: 'right'
      // });
    } else {
      this.empAssessmentDet = {};
    }

  }
  setSubCategoryGroup() {
    var tmpCatArray: any = [];
    var tmpCatIds = [];
    var quesArray = [];

    this.empAssessmentDet.quesList.forEach(data => {
      if (tmpCatIds.indexOf(data.categoryId) === -1) {
        tmpCatArray.push({
          catId: data.categoryId,
          catName: data.categoryName,
          quesList: [data]
        });
        tmpCatIds.push(data.categoryId);
      } else {
        tmpCatArray.forEach(cat => {
          if (cat.catId === data.categoryId) {
            cat.quesList.push(data);
          }
        });
      }
    });

    console.log(tmpCatArray);

    if (tmpCatArray != null && tmpCatArray.length > 0) {
      this.empAssessmentDet.quesListGroupBy = tmpCatArray;
    }
    console.log(this.empAssessmentDet.quesListGroupBy)
  }

  dismissModal() {
    this.modalService.dismissAll();
  }
  onOptionSelect(questionIndex: number, optionIndex: number) {
    this.selectedOptions[questionIndex] = optionIndex;
    console.log(this.selectedOptions[questionIndex])
  }
}
