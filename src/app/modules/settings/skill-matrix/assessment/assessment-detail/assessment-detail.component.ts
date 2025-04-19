import { Component, Inject, OnInit } from "@angular/core";
import { NgbModalConfig, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { AssessmentService } from "./../assessment.service";
import { AlertService } from "src/app/theme/shared/components";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-assessment-detail",
  templateUrl: "./assessment-detail.component.html",
  styleUrls: ["./assessment-detail.component.scss"],
})
export class AssessmentDetailComponent implements OnInit {
  assessmentDet: any = {
    tempQues: {
      categoryList: [],
      subCategoryList: [],
    },
  };
  assessmentDetails: any = {
    moduleSkillList: [],
    interventionsList: [],
    categoryList: [],
    subCategoryList: [],
  };
  Constant: any = {};
  categoryList: any = [];
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
  multipleDropdownSettings: IDropdownSettings = {};
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
  isAssessmentAvailable: boolean = false;
  constant: any = {};
  isSubmit: boolean = false;
  assessmentDetail: any = {};
  searchDet: any = {};
  departmentList: any = [];
  assessmentType: any = [];
  branchId: any[];
  cellList: any[];
  deptId: any;
  workforceList: any = [];
  userDet: any = {};
  lineIds: any = [];
  lineId: any;
  workId: any;
  isCheckSheetAvailable: boolean = false;
  minValue: number;
  maxValue: number;
  assessmentTypeList = [
    { id: 1, name: "SAFETY" },
    { id: 2, name: "LEVEL" }
  ];
  isSafetyAssessment: boolean = false;
  isReqAssTime: boolean = false;
  constructor(
    modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public assessmentService: AssessmentService,
    private router: Router,
    private alertService: AlertService,
    private titleService: Title,
    @Inject("Constant") Constant: any
  ) {
    modalConfig.backdrop = "static";
    modalConfig.keyboard = false;
    this.constant = Constant;
  }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem("userDet"));
    this.titleService.setTitle("Assessment Details");
    this.loggedInEmpDet = this.assessmentService.getLoggedInData();
    this.assessmentForm = this.fb.group({
      assessmentType: new FormControl("", Validators.required),
      branchId: new FormControl("", Validators.required),
      deptId: new FormControl("", Validators.required),
      cellLineId: new FormControl("", Validators.required),
      workstationId: new FormControl("", Validators.required),
      skillLvlId: new FormControl("", Validators.required),
      title: new FormControl("", Validators.required),
      time: new FormControl("", [
        Validators.required,
        this.noNegativeValidator
      ]),
      passingMark: new FormControl("", [
        Validators.required,
        this.noNegativeValidator,
      ]),
    });
    // this.formdata = this.fb.group({
    //   category: [this.selectedCategeory],
    //   subCategory: [this.selectedSubCategeory],
    //   questionTypeName: [this.selectedQuestionType],
    // });

    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "name",
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.multipleDropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 2,
      allowSearchFilter: true,
    };
    /* 
      Get Local Storage Data
    */
    if (localStorage.getItem("selectedActionData")) {
      this.selectedDet = JSON.parse(localStorage.getItem("selectedActionData"));
      this.plantList = this.selectedDet.plantList;
      console.log(this.plantList);
      this.masterLevelList = this.selectedDet.masterLevelList;
      console.log(this.masterLevelList)
      if (this.selectedDet.isEditable && this.selectedDet.assessmentId == 0) {
        this.editAssessment = false;
        this.assessmentDet = {};
      } else {
        this.getdetails(this.selectedDet);
        this.getAssessmentDetails();
      }
    } else {
      this.assessmentDet = {};
    }
  }
  getdetails(data) {
    console.log(data);
    this.isAssessmentAvailable = true;
    this.isCheckSheetAvailable = true;
    this.assessmentDet.assessmentId = data.assessmentId;
    this.submitAssessment = true;
    this.addQuestionDisabled = false;
    this.editAssessment = true;
    let assessmentTypeis = {};
    if (data.assessmentType == "SAFETY") {
      assessmentTypeis = { id: 1, name: "SAFETY" }
      this.isSafetyAssessment = true;
    }
    if (data.assessmentType == "LEVEL") {
      assessmentTypeis = { id: 2, name: "LEVEL" }
    }
    this.assessmentForm.patchValue({
      assessmentType: [assessmentTypeis],
      branchId: [{ id: data.branchId, name: data.branchName }],
      skillLvlId: [{ id: data.skillLevelId, name: data.skillLevel }],
      deptId: [{ id: data.deptId, name: data.deptName }],
      cellLineId: [{ id: data.lineId, name: data.lineName }],
      workstationId: [{ id: data.workstationId, name: data.workstation }],
      title: data.title,
      time: data.time,
      passingMark: data.passingMarks,
    });
    this.getcategroryDetails();
  }

  // Assessment Module
  // date: 07/09/2023
  // description: user not able to enter negative values
  // author: simran
  noNegativeValidator = (control: any) => {
    console.log(control);
    const value = control.value;
    console.log(value);
    if (value === 0) {
      return { zeroValue: true };
    }
    if (value < 0) {
      return { negativeValue: true };
    }
    // if (value.toString().length > 3) {
    //   return { minLength: true };
    // }
    return null;
  };
  /* 
    Reset Form Field
    @Author Mahesh W
    @Date : 23 Aug 2023
  */
  resetFormField(form, keyName) {
    Object.keys(form.controls).forEach((key) => {
      if (key == keyName) {
        form.get(keyName).reset();
        form.get(keyName).markAsPristine();
        form.get(keyName).markAsUntouched();
      }
    });
  }
  /* 
    Return Object from given array & obj
    @Author Mahesh W
    @Date : 23 Aug 2023
  */
  getObjFromArray(array, obj) {
    var rec;
    if (array != null && array.length > 0) {
      for (let index = 0; index < array.length; index++) {
        if (array[index].id == obj.id) {
          rec = array[index];
          break;
        }
      }
    }
    return rec;
  }
  /*
    Return Object from given array & id
    @Author Mahesh W
    @Date : 23 Aug 2023
  */
  getValueFromArray(array, value) {
    var rec = [];
    if (array != null && array.length > 0) {
      for (let index = 0; index < array.length; index++) {
        if (array[index].id == value) {
          rec.push(array[index]);
        }
      }
    }
    return rec;
  }
  /*
    Save and Update function
    @Author Mahesh W
    @Date : 23 Aug 2023
  */
  saveAssessmentDetails(data) {
    console.log(data);
    if (!this.editAssessment && this.selectedDet.assessmentId == 0) {
      this.isAssessmentAvailable = true;
      this.saveAssessment(data);
    } else {
      this.isAssessmentAvailable = true;
      this.updateAssesment(data);
    }
  }
  /* 
      Save Assessment
      @Author Mahesh W
      @Date : 23 Aug 2023
    */
  saveAssessment(data) {
    this.submitLoader = true;
    if (
      data.controls['assessmentType'].invalid ||
      data.controls['branchId'].invalid ||
      data.controls['deptId'].invalid ||
      data.controls['cellLineId'].invalid ||
      data.controls['workstationId'].invalid ||
      data.controls['title'].invalid ||
      data.controls['time'].invalid ||
      data.controls['passingMark'].invalid ||
      (!this.isSafetyAssessment && data.controls['skillLvlId'].invalid)
    ) {
      // Mark all invalid controls as dirty
      Object.keys(data.controls).forEach((key) => {
        if (data.controls[key].invalid) {
          data.controls[key].markAsDirty();
        }
      });
      this.submitLoader = false;
      return; // Exit the function to prevent submission
    }
    let reqBody: any = {
      title: data.value.title,
      assessmentType: data.value.assessmentType[0].name,
      branchId: data.value.branchId[0].id,

      deptId: data.value.deptId[0].id,
      lineId: data.value.cellLineId[0].id,
      workstationId: data.value.workstationId[0].id,
      time: data.value.time,
      passingMark: data.value.passingMark,
      createdBy: this.loggedInEmpDet.empId,
    };
    if (data.value.assessmentType[0].name == 'LEVEL' && !this.isSafetyAssessment) {
      reqBody.skillLvlId = data.value.skillLvlId[0].id;
    }
    console.log(reqBody);
    this.assessmentService
      .addAssessmentDetails("apis/sm/addAssessment", reqBody)
      .subscribe(
        (data: any) => {
          this.submitLoader = false;
          if (data.result) {
            this.alertService.success("Assessment details added successfully.");
            this.assessmentDet.assessmentId = data.responseData.assessmentId;
            this.isCheckSheetAvailable = true;
            this.getAssessmentDetails();
          } else {
            if (data.statusCode == 100) {
              this.alertService.error(data.reason);
            } else {
              this.alertService.error(
                "Error occurred while submitting data. Please try again.."
              );
            }
          }
        },
        (error: any) => {
          this.alertService.error(error);
          this.submitLoader = false;
        }
      );
  }
  /*
    Update Assessment
    @Author Mahesh W
    @Date : 23 Aug 2023
  */
  updateAssesment(data) {
    this.submitLoader = true;
    if (
      data.controls['assessmentType'].invalid ||
      data.controls['branchId'].invalid ||
      data.controls['deptId'].invalid ||
      data.controls['cellLineId'].invalid ||
      data.controls['workstationId'].invalid ||
      data.controls['title'].invalid ||
      data.controls['time'].invalid ||
      data.controls['passingMark'].invalid ||
      (!this.isSafetyAssessment && data.controls['skillLvlId'].invalid)
    ) {
      // Mark all invalid controls as dirty
      Object.keys(data.controls).forEach((key) => {
        if (data.controls[key].invalid) {
          data.controls[key].markAsDirty();
        }
      });
      this.submitLoader = false;
      return; // Exit the function to prevent submission
    }
    if (data.controls.time.value == null) {
      data.controls['time'].markAsDirty();
      data.controls['time'].invalid;
      data.controls['time'].touched;
      data.controls['time'].dirty;
      data.controls['time'].errors;
      this.isReqAssTime = true;
      this.submitLoader = false;
      return
    }
    let reqBody: any = {
      assessmentId: this.assessmentDet.assessmentId,
      title: data.value.title,
      branchId: data.value.branchId[0].id,
      // skillLvlId: data.value.skillLvlId[0].id,
      deptId: data.value.deptId[0].id,
      lineId: data.value.cellLineId[0].id,
      workstationId: data.value.workstationId[0].id,
      time: data.value.time,
      passingMark: data.value.passingMark,
      updatedBy: this.loggedInEmpDet.empId,
    };
    if (data.value.assessmentType[0].name == 'Level' && !this.isSafetyAssessment) {
      reqBody.skillLvlId = data.value.skillLvlId[0].id;
    }
    this.assessmentService
      .updateAssessmentDetails("apis/sm/updateAssessment", reqBody)
      .subscribe((data: any) => {
        this.submitLoader = false;
        if (data.result) {
          this.alertService.success("Assessment details updated successfully.");
          this.isCheckSheetAvailable = true;
          this.getAssessmentDetails();
        } else {
          if (data.statusCode == 100) {
            this.alertService.error(data.reason);
          } else {
            this.alertService.error(
              "Error occurred while updating data. Please try again.."
            );
          }
        }
      });
  }
  /*
       Open Question addition modal
       @Author Mahesh W
       @Date : 23 Aug 2023
  */
  openAddQuestionModal(modal) {
    this.addQuestion = false;
    // this.isAssessmentAvailable = true;
    this.questionsList = [];
    var rec;
    if (
      this.assessmentDetails.interventionsList != null &&
      this.assessmentDetails.interventionsList.length > 0
    ) {
      rec = this.assessmentDetails.interventionsList.filter(
        (res) => res.interId == this.selectedDet.interventionId
      );
    }
    this.assessmentDet.tempQues = {
      quetionId: 0,
      assessmentQuestion: "",
      isRightAns: "",
      // questionTypeIds: [],
      optList: [{ optIndex: 0, option: "", isRightAns: false }],
      mark: "",
    };
    var modalRef = this.modalService.open(modal, {
      windowClass: "right",
    });
    modalRef.result.then(
      (result) => {
        if (result === "success") {
          this.getAssessmentDetails();
        }
      },
      (reason) => {
        console.log(reason);
      }
    );
  }
  /*
       Add,remove option function
       @Author Mahesh W
       @Date : 23 Aug 2023 
  */
  addRemoveOptions(oIndex, type) {
    if (
      this.assessmentDet.tempQues.optList != null &&
      this.assessmentDet.tempQues.optList.length > 4
    ) {
      if (type == "add") {
        return;
      }
    }
    if (type == "add") {
      if (
        this.assessmentDet.tempQues.optList[oIndex].option == undefined ||
        this.assessmentDet.tempQues.optList[oIndex].option == "" ||
        this.assessmentDet.tempQues.optList[oIndex].option == null
      ) {
        this.alertService.error("Please enter option");
        return;
      }
      this.assessmentDet.tempQues.optList.push({
        optIndex:
          this.assessmentDet.tempQues.optList != null
            ? this.assessmentDet.tempQues.optList.length
            : 0,
        option: "",
        isRightAns: false,
      });
    } else {
      this.assessmentDet.tempQues.optList.splice(oIndex, 1);
    }
  }

  /*
       Get Assessment details
       @Author Mahesh W
       @Date : 23 Aug 2023
  */
  getAssessmentDetails() {
    this.assessmentService
      .getAssessmentDetailsById(
        "apis/sm/getAssessmentDetail/" + this.assessmentDet.assessmentId
      )
      .subscribe((data: any) => {
        if (data.result) {
          this.selectedDet = Object.assign(
            {},
            this.selectedDet,
            data.assessment
          );
          this.editAssessment = true;
          this.isCheckSheetAvailable = true;
          var tmpLocalData = JSON.parse(
            localStorage.getItem("selectedActionData")
          );
          console.log(tmpLocalData);
          if (tmpLocalData.assessmentId == 0) {
            var newData = Object.assign({}, tmpLocalData, this.selectedDet);
            this.selectedDet = newData;
            localStorage.setItem("selectedActionData", JSON.stringify(newData));
          }
          if (
            data.assessment.quesList != null &&
            data.assessment.quesList.length > 0
          ) {
            for (
              let index = 0;
              index < data.assessment.quesList.length;
              index++
            ) {
              if (
                data.assessment.quesList[index].optList != null &&
                data.assessment.quesList[index].optList.length > 0
              ) {
                for (
                  let opt = 0;
                  opt < data.assessment.quesList[index].optList.length;
                  opt++
                ) {
                  data.assessment.quesList[index].optList[opt].option =
                    data.assessment.quesList[index].optList[opt].option;
                }
                data.assessment.quesList[index].optList.forEach(
                  (currentValue, optIndex) => {
                    if (currentValue.rightAns) {
                      data.assessment.quesList[index].rightAns =
                        optIndex.toString();
                    }
                  }
                );
              }
            }
          }

          this.assessmentDet.quesList = data.assessment.quesList;
          this.assessmentDetail = data.assessment;
          console.log(this.assessmentDetail);
          this.setSubCategoryGroup();
        } else {
          this.assessmentDet.quesListGroupBy = [];
        }
      });
  }
  setSubCategoryGroup() {
    var tmpCatArray: any = [
      {
        catId: 0,
        catName: "",
        subCatList: [
          {
            subCatId: 0,
            subCatName: 0,
            applicableQues: 0,
            quesList: [],
          },
        ],
      },
    ];
    var tmpCatIds = [];
    var quesArray = [];
    this.assessmentDet.quesList.filter((data) => {
      if (tmpCatIds.indexOf(data.categoryId) == -1) {
        if (data.subCategoryId > 0) {
          tmpCatArray.push({
            catId: data.categoryId,
            catName: data.categoryName,
            subCatList: [
              {
                subCatId: data.subCategoryId,
                subCatName: data.subCategoryName,
                applicableQues: data.applicableQues,
                quesList: [data],
              },
            ],
          });
        } else {
          tmpCatArray.push({
            catId: data.categoryId,
            catName: data.categoryName,
            subCatList: [
              {
                subCatId: data.subCategoryId,
                subCatName: data.subCategoryName,
                applicableQues: data?.applicableQues,
                quesList: [data],
              },
            ],
          });
        }
        tmpCatIds.push(data.categoryId);
      } else {
        for (let x = 0; x < tmpCatArray.length; x++) {
          if (tmpCatArray[x].catId == data.categoryId) {
            if (data.subCategoryId > 0) {
              if (
                tmpCatArray[x].subCatList != null &&
                tmpCatArray[x].subCatList.filter(
                  (res) => res.subCatId == data.subCategoryId
                ).length > 0
              ) {
                tmpCatArray[x].subCatList.forEach((subCat, i) => {
                  if (subCat.subCatId == data.subCategoryId) {
                    tmpCatArray[x].subCatList[i].quesList.push(data);
                  }
                });
              } else {
                tmpCatArray[x].subCatList.push({
                  subCatId: data.subCategoryId,
                  subCatName: data.subCategoryName,
                  applicableQues: data.applicableQues,
                  quesList: [data],
                });
              }
            } else {
              tmpCatArray[x].subCatList.forEach((subCat, i) => {
                if (subCat.subCatId == data.subCategoryId) {
                  tmpCatArray[x].subCatList[i].quesList.push(data);
                }
              });
            }
          }
        }
      }
    });
    console.log(tmpCatArray);
    if (tmpCatArray != null && tmpCatArray.length > 0) {
      tmpCatArray.splice(0, 1);
      this.assessmentDet.quesListGroupBy = tmpCatArray;
    }
  }
  ontemplateSelect(val: any) {
    this.assessmentDet.templateSelect = val;
  }
  /*
     Save Question
     @Author Mahesh W
     @Date : 23 Aug 2023
  */
  saveQuestion(data) {
    if (this.addQuestion == false) {
      this.saveQuestionandAns(data);
    } else {
      this.updateQuestionansAns(data);
    }
  }
  saveQuestionandAns(data) {
    this.submitLoader = true;
    if (data.invalid) {
      Object.keys(data.controls).forEach((key) => {
        data.controls[key].markAsDirty();
      });
      this.submitLoader = false;
      return;
    }
    var reqbody: any = {
      assessmentId: this.assessmentDet.assessmentId,
      questionTypeId: 1,
      // "categoryId": this.assessmentDet.tempQues.selectedCat[0].id,
      question: this.assessmentDet.tempQues.assessmentQuestion,
      queMark: this.assessmentDet.tempQues.mark,
    };
    if (this.assessmentDet.tempQues.selectedCat != null) {
      reqbody.categoryId = this.assessmentDet.tempQues.selectedCat[0].id;
    }
    reqbody.optList = [];
    if (
      this.assessmentDet.tempQues.optList == null ||
      this.assessmentDet.tempQues.optList.length == 0
    ) {
      this.alertService.error("Please add options.");
      this.submitLoader = false;
      return;
    }
    if (
      this.assessmentDet.tempQues.optList != null &&
      this.assessmentDet.tempQues.optList.length < 2
    ) {
      this.alertService.error("Please add minimum two options.");
      this.submitLoader = false;
      return;
    }
    if (
      this.assessmentDet.tempQues.optList.filter((rec) => rec.isRightAns)
        .length == 0
    ) {
      this.alertService.error("Please select one correct answers");
      this.submitLoader = false;
      return;
    }
    this.assessmentDet.tempQues.optList.filter((element) => {
      console.log(element);
      reqbody.optList.push({
        option: element.option,
        isRightAns: element.isRightAns ? true : false,
      });
    });
    this.assessmentService
      .addQuestions("apis/sm/addAssessmentQuestion", reqbody)
      .subscribe((data: any) => {
        this.submitLoader = false;
        if (data.result) {
          this.alertService.success("Question added successfully.");
          this.getAssessmentDetails();
          this.modalService.dismissAll();
        } else {
          if (data.statusCode == 100) {
            this.alertService.error(data.reason);
          } else {
            this.alertService.error(
              "Error occurred while submitting data. Please try again."
            );
          }
        }
      });
  }
  updateques(modal, ques) {
    this.addQuestion = true;
    console.log(ques);
    this.assessmentDet.tempQues = {
      quetionId: ques.quetionId,
      selectedCat: [{ id: ques.categoryId, name: ques.categoryName }],
      assessmentQuestion: ques.question,
      mark: ques.questionMark,
      optList: ques.optList,
    };
    ques.optList.forEach((currentValue, optIndex) => {
      console.log(currentValue);
      if (currentValue.rightAns) {
        this.assessmentDet.tempQues.isRightAns = optIndex.toString();
        console.log(this.assessmentDet.tempQues.isRightAns);
      }
    });
    console.log(this.assessmentDet.tempQues.optList);
    var modalRef = this.modalService.open(modal, {
      windowClass: "right",
    });
    modalRef.result.then(
      (result) => {
        if (result === "success") {
          this.getAssessmentDetails();
        }
      },
      (reason) => {
        console.log(reason);
      }
    );
  }

  updateQuestionansAns(data) {
    this.submitLoader = true;
    if (data.invalid) {
      Object.keys(data.controls).forEach((key) => {
        data.controls[key].markAsDirty();
      });
      this.submitLoader = false;
      return;
    }
    console.log(this.assessmentDet.tempQues.optList);
    var reqBody: any = {
      assessmentQueId: this.assessmentDet.tempQues.quetionId,
      assessmentId: this.assessmentDet.assessmentId,
      questionTypeId: 1,
      // "categoryId": this.assessmentDet.tempQues.selectedCat[0].id,
      queMark: this.assessmentDet.tempQues.mark,
      question: this.assessmentDet.tempQues.assessmentQuestion,
      updatedBy: this.loggedInEmpDet.empId,
    };
    if (this.assessmentDet.tempQues.selectedCat != null) {
      reqBody.categoryId = this.assessmentDet.tempQues.selectedCat[0].id;
    }
    reqBody.optList = [];
    if (
      this.assessmentDet.tempQues.optList == null ||
      this.assessmentDet.tempQues.optList.length == 0
    ) {
      this.alertService.error("Please add options.");
      this.submitLoader = false;
      return;
    }
    if (
      this.assessmentDet.tempQues.optList != null &&
      this.assessmentDet.tempQues.optList.length < 2
    ) {
      this.alertService.error("Please add minimum two options.");
      this.submitLoader = false;
      return;
    }
    console.log(this.assessmentDet.tempQues.optList);
    // if (this.assessmentDet.tempQues.optList.filter(rec => rec.isRightAns).length == 0) {
    //   this.alertService.error('Please select one correct answer');
    //   this.submitLoader = false;
    //   return;
    // }
    if (!this.assessmentDet.tempQues.isRightAns) {
      this.alertService.error("Please select one correct answer");
      this.submitLoader = false;
      return;
    } else {
      for (
        let opt = 0;
        opt < this.assessmentDet.tempQues.optList.length;
        opt++
      ) {
        this.assessmentDet.tempQues.optList[opt].isRightAns = false;
        if (opt == parseInt(this.assessmentDet.tempQues.isRightAns)) {
          this.assessmentDet.tempQues.optList[opt].isRightAns = true;
        }
      }
    }
    this.assessmentDet.tempQues.optList.filter((element: any) => {
      console.log(element);
      if (element.hasOwnProperty("assessmentQueOptId")) {
        reqBody.optList.push({
          option: element.option,
          isRightAns: element.isRightAns ? true : false,
          id: element.assessmentQueOptId,
        });
      } else {
        reqBody.optList.push({
          option: element.option,
          isRightAns: element.isRightAns ? true : false,
        });
      }
    });
    this.assessmentService
      .updateQuestionsAndOpt("apis/sm/updateAssessmentQuestion", reqBody)
      .subscribe((data: any) => {
        this.submitLoader = false;
        if (data.result) {
          this.alertService.success("Question updated successfully.");
          this.getAssessmentDetails();
          this.modalService.dismissAll();
        } else {
          if (data.statusCode == 100) {
            this.alertService.error(data.reason);
          } else {
            this.alertService.error(
              "Error occurred while updating data. Please try again."
            );
          }
        }
      });
  }
  removeExistOption(opt, quesId) {
    this.dataSpinner[quesId] = true;
    var req = {
      assessmentQueOptId: opt.assessmentQueOptId,
      updatedBy: this.loggedInEmpDet.empId,
      createdBy: this.loggedInEmpDet.empId,
    };
    this.assessmentService
      .deleteAssessmentOption("apis/sm/deleteAssessmentOptions", req)
      .subscribe((res: any) => {
        this.dataSpinner[quesId] = false;
        if (res.result) {
          this.alertService.success("Option removed successfully.");
          for (
            let index = 0;
            index < this.assessmentDet.tempQues.optList.length;
            index++
          ) {
            if (
              this.assessmentDet.tempQues.optList[index].assessmentQueOptId ==
              opt.assessmentQueOptId
            ) {
              this.assessmentDet.tempQues.optList.splice(index, 1);
              index--;
            }
          }
        } else {
          if (res.statusCode == 100) {
            this.alertService.error(res.reason);
          } else {
            this.alertService.success(
              "Error occurred while removing option. Please try again."
            );
          }
        }
      });
  }
  showDeleteQuestModal(ques) {
    console.log(ques);

    Swal.fire({
      title: "Are you sure",
      text: "You want remove this record",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7044CD",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes remove it",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      this.dataSpinner[ques.quetionId] = true;
      if (result.isConfirmed) {
        let reqbody = {
          assessmentId: this.assessmentDet.assessmentId,
          assessmentQueId: ques.quetionId,
          updatedBy: this.loggedInEmpDet.empId,
          createdBy: this.loggedInEmpDet.empId,
        };
        this.assessmentService
          .deleteAsssessmentQuesAndOption(
            "apis/sm/deleteAssessmentQuestion",
            reqbody
          )
          .subscribe((data: any) => {
            this.dataSpinner[ques.quetionId] = false;
            if (data.result) {
              this.alertService.success("Question removed successfully.");
              this.getAssessmentDetails();
            } else {
              if (data.statusCode == 100) {
                this.alertService.error(data.reason);
              } else {
                this.alertService.error(
                  "Error occurred while removing data. Please try again"
                );
              }
            }
          });
      } else {
        this.dataSpinner[ques.quetionId] = false;
      }
    });
  }

  deletePublishloader: boolean = false;
  publishAssessment() {
    this.deletePublishloader = true;
    Swal.fire({
      title: "Are you sure",
      text: "You want publish this record",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7044CD",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes publish it",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let reqbody = {
          assessmentId: this.assessmentDet.assessmentId,
          updatedBy: this.loggedInEmpDet.empId,
          createdBy: this.loggedInEmpDet.empId,
        };
        this.assessmentService
          .publishAsssessment("apis/sm/publishAssessments", reqbody)
          .subscribe((data: any) => {
            this.deletePublishloader = false;
            if (data.result) {
              this.alertService.success("Assessment published successfully.");
              this.router.navigateByUrl(
                "settings/skillMatrix/assessment"
              );
            } else {
              if (data.statusCode == 100) {
                this.alertService.error(data.reason);
              } else {
                this.alertService.error(
                  "Error occurred while publishing assessment. Please try again"
                );
              }
            }
          });
      } else {
        this.deletePublishloader = false;
      }
    });
  }
  deleteAssessment() {
    this.deletePublishloader = true;
    Swal.fire({
      title: "Are You Sure!",
      text: "You want remove this record ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7044CD",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Remove It",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let reqbody = {
          assessmentId: this.assessmentDet.assessmentId,
          updatedBy: this.loggedInEmpDet.empId,
          createdBy: this.loggedInEmpDet.empId,
        };
        this.assessmentService
          .deleteAsssessment("apis/sm/deActiveAssessment", reqbody)
          .subscribe((data: any) => {
            this.deletePublishloader = false;
            if (data.result) {
              this.alertService.success("Record removed successfully.");
              this.router.navigateByUrl("/settings/skillMatrix/assessment");
            } else {
              if (data.statusCode == 100) {
                this.alertService.error(data.reason);
              } else {
                this.alertService.error(
                  "Error occurred while deleting data. Please try again"
                );
              }
            }
          });
      } else {
        this.deletePublishloader = false;
      }
    });
  }

  isCatgeorycheck() {
    this.assessmentDet.isCatgeorychecked =
      !this.assessmentDet.isCatgeorychecked;
  }
  /*
     Open add category Modal
     Author: Jayshri Kolase
     Date : 13 Oct 2023
   */
  addCategory(modal) {
    this.catUpdateFlag = false;
    this.assessmentDet.category = "";
    this.assessmentDet.subCategoryList = [
      { name: "", applicableNumOfQues: "", show: true },
    ];
    this.modalService.open(modal, {
      windowClass: "assessmentpopup",
    });
  }
  /*
    save and update category
    Author: Jayshri Kolase
    Date : 13 Oct 2023
  */
  submitCatAndSubCat(c) {
    if (this.catUpdateFlag == true) {
      this.updateCatAndSubCategory(c);
    } else {
      this.addCatAndSubCategory(c);
    }
  }
  /*
     save or submit category details
     Author: Jayshri Kolase
     Date : 13 Oct 2023
   */
  addCatAndSubCategory(c) {
    this.submitCatLoader = true;
    if (this.assessmentService.isEmptyOrSpaces(this.assessmentDet.category)) {
      this.alertService.error("Please add category name");
      this.submitCatLoader = false;
      return;
    }
    let reqBody: any = {
      assessmentId: this.assessmentDet.assessmentId,
      categoryName: this.assessmentDet.category,
    };
    // this.assessmentDet.subCategoryList.filter((subcat: any) => {
    //   reqBody.subCategory.push({ name: subcat.name, applicableNumOfQues: subcat.applicableNumOfQues })
    // });
    console.log(reqBody);
    this.assessmentService
      .addCatgeoryand("apis/sm/addCategory", reqBody)
      .subscribe((data: any) => {
        this.submitCatLoader = false;
        if (data.result) {
          this.alertService.success("Category details added successfully.");
          c("Cross Click");
          this.getcategroryDetails();
        } else {
          if (data.statusCode == 100) {
            this.alertService.error(data.reason);
          } else {
            this.alertService.error(
              "Error occurred while deleting data. Please try again"
            );
          }
        }
      });
  }
  /*
   Update category details
   Author: Jayshri Kolase
   Date : 13 Oct 2023
 */
  updateCatAndSubCategory(c) {
    this.submitCatLoader = true;
    if (this.assessmentService.isEmptyOrSpaces(this.assessmentDet.category)) {
      this.alertService.error("Please add category name");
      this.submitCatLoader = false;
      return;
    }
    let reqBody: any = {
      assessmentId: this.assessmentDet.assessmentId,
      categoryName: this.assessmentDet.category,
      id: this.assessmentDet.categoryId,
    };
    // this.assessmentDet.subCategoryList.filter((subcat: any) => {
    //   reqBody.subCategory.push({ id: subcat.id, name: subcat.name, applicableNumOfQues: subcat.applicableNumOfQues });
    // });
    this.assessmentService
      .updateCatgeory("apis/sm/updateCategory", reqBody)
      .subscribe((data: any) => {
        this.submitCatLoader = false;
        if (data.result) {
          this.alertService.success("Category details updated successfully.");
          c("Cross Click");
          this.getcategroryDetails();
        } else {
          if (data.statusCode == 100) {
            this.alertService.error(data.reason);
          } else {
            this.alertService.error(
              "Error occurred while deleting data. Please try again"
            );
          }
        }
      });
  }
  /*
   Get category details
   Author: Jayshri Kolase
   Date : 13 Oct 2023
 */
  getcategroryDetails() {
    let req = {
      assessmentId: this.assessmentDet.assessmentId,
    };
    this.assessmentService
      .getCatgeoryList("apis/sm/getCategoryList", req)
      .subscribe((data: any) => {
        if (data.result) {
          if (data.dataList != null && data.dataList.length > 0) {
            this.assessmentDet.isCatgeorychecked = true;
            this.assessmentDetails.categoryList = data.dataList;
            this.categoryList = this.setArray(
              this.assessmentDetails.categoryList,
              "id",
              "categoryName"
            );
            // this.assessmentDetails.categoryList.forEach(cat => {
            //   this.categoryListIds.push(cat.id)
            // });
            // this.getSubcategroryDetails(this.categoryListIds);
          } else {
            this.assessmentDetails.categoryList = [];
            // this.catAndSubCatList = [];
          }
        } else {
          this.assessmentDetails.categoryList = [];
          // this.catAndSubCatList = [];
        }
      });
  }
  /*
   View category Modal
   Author: Jayshri Kolase
   Date : 13 Oct 2023
 */
  viewCategory(modal) {
    var modalRef = this.modalService.open(modal, {
      windowClass: "right",
    });
    modalRef.result.then(
      (result) => {
        if (result === "success") {
          this.getcategroryDetails();
        }
      },
      (reason) => {
        console.log(reason);
      }
    );
  }
  /*
   edit category modal open
   Author: Jayshri Kolase
   Date : 13 Oct 2023
 */
  editCatAndSubCat(content, list) {
    this.catUpdateFlag = true;
    this.assessmentDet.category = list.categoryName;
    this.assessmentDet.categoryId = list.id;
    this.assessmentDet.assessmentId = list.assessmentId;
    // if (list.subCategoryList != null && list.subCategoryList.length > 0) {
    //   this.assessmentDetails.subCategoryList[list.subCategoryList.length - 1].show = true;
    // } else {

    // }
    // this.assessmentDet.subCategoryList = list.subCategoryList;
    this.modalService.open(content, {
      windowClass: "assessmentpopup",
    });
  }
  /*
   delete category
   Author: Jayshri Kolase
   Date : 13 Oct 2023
 */

  deleteCatAndSubCat(catId) {
    this.modalService.dismissAll();
    Swal.fire({
      title: "Are You Sure!",
      text: "You want remove this category ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7044CD",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Remove It",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let req = {
          id: catId,
        };

        this.assessmentService
          .deleteCatgeory("apis/sm/deleteCategory", req)
          .subscribe((data: any) => {
            if (data.result) {
              // if (data.reason != '' || data.reason != undefined) {
              //   this.alertService.success(data.reason)
              // } else {
              this.alertService.success("Category deleted successfully.");
              // }
              this.getcategroryDetails();
            } else {
              if (data.statusCode == 100) {
                this.alertService.error(data.reason);
              } else {
                this.alertService.error(
                  "Error occurred while deleting data. Please try again"
                );
              }
            }
          });
      } else {
      }
    });
  }
  /*
   Common function for set an array for dropdown
   Author: Jayshri Kolase
   Date : 13 Oct 2023
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
    console.log(tmpArray);
    return tmpArray;
  }

  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "dept" || fieldToSort === "level") {
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

  onChange(ev: any, type) {
    console.log("Hello");
    if (ev) {
      console.log(ev);
      if (type == "type") {
        this.assessmentType = ev;
        if (ev.name == 'SAFETY') {
          this.isSafetyAssessment = true;
        }
        else if (ev.name == 'LEVEL') {
          this.isSafetyAssessment = false;
        }
        console.log(this.branchId);
        this.branchId = [];
        this.searchDet.deptIds = [];
        this.resetFormField(this.assessmentForm, "branchId");
        this.resetFormField(this.assessmentForm, "deptId");
        this.resetFormField(this.assessmentForm, "cellLineId");
        this.resetFormField(this.assessmentForm, "workstationId");
      }
      if (type == "plant") {
        this.branchId = ev.id;
        console.log(this.branchId);
        this.searchDet.deptIds = [];
        this.resetFormField(this.assessmentForm, "deptId");
        this.resetFormField(this.assessmentForm, "cellLineId");
        this.resetFormField(this.assessmentForm, "workstationId");
        this.getDepartmentList(this.branchId);
      }
      if (type == "dept") {
        console.log(ev)
        this.cellList = [];
        this.deptId = ev.id;
        this.searchDet.cell = [];
        this.resetFormField(this.assessmentForm, "cellLineId");
        this.resetFormField(this.assessmentForm, "workstationId");
        this.getCellList(this.deptId);
      }

      if (type == "cell") {
        console.log(ev);
        this.lineId = ev.id;
        this.searchDet.work = [];
        this.resetFormField(this.assessmentForm, "workstationId");
        this.getWorkforceList(this.lineId);
      }
      if (type == "work") {
        this.workId = ev.id

      }
    } else {
      if (type == "plant") {
        // if (this.searchDet) {
        //   this.departmentList = [];
        //   this.searchDet.departmentList = [];
        // this.cellList = [];
        // this.searchDet.cellList = [];
        // this.resetFormField(this.filterData, "deptIds");
        // this.resetFormField(this.stakeholderForm, "deptId");
        // this.resetFormField(this.stakeholderForm, 'lineId');
        // this.searchDet.lineId = [];
        // }
      } else if (type == "dept") {
        // this.resetFormField(this.stakeholderForm, 'lineId');
        // this.cellList = [];
        // this.searchDet.cellList = [];
        // this.searchDet.lineId = [];
      }
    }
  }


  onChangeAll(ev: any, type) {
    if (ev) {
      console.log("Select All action");
    } else {
      console.log("Unselect All action");
    }
  }

  sortFunction(array, key) {
    if (array != null && array.length > 0) {
      array.sort(function (a, b) {
        var nameA = !Number(a[key]) ? a[key].toUpperCase() : a[key];
        var nameB = !Number(b[key]) ? b[key].toUpperCase() : b[key];
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


  getDepartmentList(branch) {
    this.assessmentService
      .getDepartmentByBranch("getdepartmentlistbybranchid/" + branch)
      .subscribe((res: any) => {
        if (res.result) {
          console.log(res);
          if (res.deptList != null && res.deptList.length > 0) {
            /* Use For Add Screen */
            this.departmentList = this.setArray(res.deptList, "deptId", "deptName");
            this.departmentList = this.sortFunction(this.departmentList, "deptName");
            this.searchDet.dept = [this.departmentList[0]];
            console.log(this.departmentList);

          } else {
            this.searchDet.departmentList = [];
          }
        } else {
          this.searchDet.departmentList = [];
        }
      });
  }


  getCellList(deptId) {
    var req: any = {
      branchId: this.branchId,
      deptId: deptId
    };
    // if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
    //   req.deptId = this.searchDet.dept[0].id;
    // }
    this.assessmentService.getCellList("apis/sm/getCellList", req).subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.cellList = this.setArray(response.dataList, "lineId", "lineName");
          this.cellList = this.sortFunction(this.cellList, "lineName");
          this.searchDet.cell = [this.cellList[0]];
        } else {
          this.cellList = [];
        }
      } else {
        this.cellList = [];
      }
    });
  }
  getWorkforceList(data) {
    // this.workforceList = [];
    // this.listLoader = true;
    console.log(data);
    let req: any = {
      branchId: this.branchId,
      orgId: this.userDet.organization.orgId,
      deptId: this.deptId,
      lineIds: [data]
    };
    console.log(req);
    // if (this.searchDet.dept != null && this.searchDet.dept.length > 0) {
    //   req.deptId = this.searchDet.dept[0].id;
    // }
    // if (this.searchDet.cell != null && this.searchDet.cell.length > 0) {
    //   req.lineId = this.searchDet.cell[0].id;
    // }
    this.assessmentService
      .getWorkforceDeploymentData("apis/sm/getWorkstationList", req)
      .subscribe((res: any) => {
        if (res.result) {
          console.log(res);
          if (res.dataList != null && res.dataList.length > 0) {
            this.workforceList = this.setArray(res.dataList, "id", "workstation");
            this.workforceList = this.sortFunction(this.workforceList, "workstation");
            this.searchDet.workforceList = [this.workforceList[0]];
            console.log(this.workforceList);
          } else {
            this.workforceList = [];
          }
        } else {
          this.workforceList = [];
        }
      });
  }
  // validateTimeInput(control: AbstractControl) {
  //   const value = control.value;
  //   if (value % 1 === 0 && value >= 0 && value <= 999) {
  //     control.setErrors(null); // Clear any previous errors
  //   } else {
  //     if (value % 1 === 0) {
  //       control.setErrors({ threeDigits: true });
  //     } else {
  //       control.setErrors({ decimalValue: true });
  //     }
  //   }
  // }
  validateTimeInput(control: AbstractControl) {
    const value = control.value;
    this.isReqAssTime = false;
    if((control.value == '' || control.value == null) && control.value !== 0 ){
      this.isReqAssTime = true;
    }

    if (value % 1 === 0 && value >= 0 && value <= 99) {
      if (value === 0) {
        control.setErrors({ zeroValue: true });
      } else {
        control.setErrors(null); // Clear any previous errors
      }
    } else {
      if (value < 0) {
        control.setErrors({ negativeValue: true });
      } else if (value % 1 === 0) {
        control.setErrors({ threeDigits: true });
      } else {
        control.setErrors({ decimalValue: true });
      }
    }
  }

}
