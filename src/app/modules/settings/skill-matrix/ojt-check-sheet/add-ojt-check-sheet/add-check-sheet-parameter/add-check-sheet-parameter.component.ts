import { Component, Input, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SkillMatrixService } from '../../../skill-matrix.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/theme/shared/components';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-check-sheet-parameter',
  templateUrl: './add-check-sheet-parameter.component.html',
  styleUrls: ['./add-check-sheet-parameter.component.scss']
})
export class AddCheckSheetParameterComponent implements OnInit {
  @Input() close;
  selectedParameterType: any;
  SingleDropdownSettings: IDropdownSettings = {};
  checksheetParameterForm: FormGroup;
  checksheetParameterFormDate: FormGroup;
  public isNumberParameter: boolean = false;
  selectedDet: any = {};
  paraTypeList: any = [];
  isAddButtonClicked: boolean = false;
  parameterDet: any = {
    rec: []
  };
  userDet: any = {};
  setChecksheetId: any = {};
  selectedParameterDet: any = {};
  isValidateNonNegativeOrZero: boolean = false;
  submitLoader: boolean = false;
  addLoader: boolean = false;
  zeroValue: boolean = false;
  negativeValue: boolean = false;
  isTextParameter: boolean = true;
  isDateTimeParameter: boolean;
  isGapParameter: boolean;
  isModelParameter: boolean;
  isCyclePlan: boolean;
  defaultSelectedValue: any;
  disableReferModel: boolean = true;
  isSelectedParaType: any;
  // isNoteShowParameter : boolean = false;
  constructor(
    private apiService: SkillMatrixService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    this.getParameterTypeList();
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'typeName',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
    };
    this.checksheetParameterForm = this.fb.group({
      parameterTypeId: new FormControl(''),
      parameter: new FormControl('', Validators.required),
      cycleValue: new FormControl(''),
      checkSheetId: new FormControl('')
    });
    this.checksheetParameterFormDate = this.fb.group({
      parameterTypeId: new FormControl(''),
      parameter: new FormControl('', Validators.required),
      cycleValue: new FormControl(''),
      checkSheetId: new FormControl('')
    });

    this.getChecksheetDetails();

  }



  /* Get Parameter Type List
   @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  getParameterTypeList() {
    this.apiService.getParameterTypeList('apis/sm/getParameterTypeList').subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          this.paraTypeList = response.dataList;
          this.selectedDet.parameterType = [this.paraTypeList[0]]
          console.log(this.selectedDet.parameterType);
          if (this.selectedDet.parameterType[0].typeName == 'Text') {
            this.checksheetParameterForm.get('parameter').setValidators([Validators.required]);
            this.checksheetParameterForm.get('cycleValue').clearValidators();
            this.isAddButtonClicked = false;
            this.isNumberParameter = false;
            this.isTextParameter = true;
            this.isDateTimeParameter = false;
            this.isModelParameter = false;
            this.isGapParameter = false;
          }

        } else {
          this.paraTypeList = [];
        }
      } else {
        this.paraTypeList = [];
      }
    })
  }
  /* Get Checksheet Details from Local Storage
   @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  getChecksheetDetails() {

    if (localStorage.getItem('setChecksheetId')) {
      this.selectedDet = JSON.parse(localStorage.getItem('setChecksheetId'));
    }
    if (localStorage.getItem('selectedParameterDet')) {
      this.selectedDet = JSON.parse(localStorage.getItem('selectedParameterDet'));
    }
    if (this.selectedDet) {
      this.checksheetParameterForm.get('checkSheetId').setValue(this.selectedDet.checkSheetId)
      if (this.selectedDet.hasOwnProperty('isEditParameter')) {

      }
    }
  }

  /* Save or Update Checksheet Parameter
  @Author Jayshri Kolase
  * @Date August 18, 2023
*/
  addChecksheetParameter(form) {

    console.log(form);
    this.isAddButtonClicked = true;
    this.addLoader = true;

    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      this.addLoader = false;
      return;
    }
    let obj = Object.assign({}, form.value, { parameterData: form.value.parameterTypeId[0], parameterTypeId: form.value.parameterTypeId[0].id });
    const hasCyclePlanParameter = this.selectedDet.parameterType.some(
      param => param.parameterType === "cyclePlan"
    );

    if (hasCyclePlanParameter && obj.parameterData.typeName === "cyclePlan") {
      this.alertService.error('Only one cycle plan can be added for this checksheet.');
      this.addLoader = false;
    } else {
      this.parameterDet.rec.push(obj);
      this.addLoader = false;
    }

    this.checksheetParameterForm.get('checkSheetId').setValue(this.selectedDet.checkSheetId);
    this.checksheetParameterForm.get('parameter').setValue('');
  }
  addChecksheetParameterCopy(form) {

    console.log(form);
    this.isAddButtonClicked = true;
    this.addLoader = true;

    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsDirty();
      });
      this.addLoader = false;
      return;
    }
    let obj = Object.assign({}, form.value, { parameterData: form.value.parameterTypeId[0], parameterTypeId: form.value.parameterTypeId[0].id });
    const hasCyclePlanParameter = this.selectedDet.parameterType.some(
      param => param.parameterType === "cyclePlan"
    );

    if (hasCyclePlanParameter && obj.parameterData.typeName === "cyclePlan") {
      this.alertService.error('Only one cycle plan can be added for this checksheet.');
      this.addLoader = false;
    } else {
      this.parameterDet.rec.push(obj);
      this.addLoader = false;
    }

    this.checksheetParameterForm.get('checkSheetId').setValue(this.selectedDet.checkSheetId);
    this.checksheetParameterFormDate.get('parameter').setValue('');
  }
  saveChecksheetParameter() {
    this.submitLoader = true;
    let req: any = {
      "updatedBy": this.userDet.empId,
      "createdBy": this.userDet.empId,
      "checkSheetId": this.selectedDet.checkSheetId,
      "parameterList": this.parameterDet.rec
    }
    for (let index = 0; index < req.parameterList.length; index++) {
      if (req.parameterList[index].parameterData.typeName != 'cyclePlan') {
        delete req.parameterList[index]['cycleValue'];
      }
      // delete req.parameterList[index]['parameterData'];
    }
    console.log(req);
    // let x = 0;
    // if (x == 0) {
    //   this.submitLoader = false;
    //   return
    // }
    this.apiService.saveChecksheetParameter('apis/sm/addChecksheetParameter', req).subscribe((response: any) => {
      this.submitLoader = false;
      if (response.result) {
        // this.alertService.success("OJT checksheet parameter saved successfully.")
        this.alertService.success("OJT verification parameter saved successfully.")
        this.modalService.dismissAll();
      } else {
        if (response.statusCode == 100) {
          this.alertService.error(response.reason);
        } else {
          this.alertService.error('Error occurred while submitting data. Please try again');
        }
      }
    }, (error: any) => {
      this.submitLoader = false;
    });
  }
  removeParameter(paramIndex) {
    this.parameterDet.rec.splice(paramIndex, 1);
  }

  onPointInputChange = (control: any) => {
    const value = control.value;
    if (value === 0) {
      return { zeroValue: true };
    }
    if (value < 0) {
      return { negativeValue: true };
    }
    return null;
  };
  // Custom validator function
  validateNonNegativeOrZero(inputValue: number): boolean {
    return inputValue >= 0 && inputValue !== 0;
  }

  // Event handler for input change
  onInputChange(event: any) {
    const inputValue = parseInt(event.target.value);
    if (!this.validateNonNegativeOrZero(inputValue)) {

      this.isValidateNonNegativeOrZero = false;
      console.log('Invalid input');
    } else {
      this.parameterDet.parameter = inputValue;
    }
  }
  onNumberInputChange = (control: any) => {
    const value = parseInt(control.data);
    if (value === 0) {
      this.zeroValue = true;
    }
    if (value < 0) {
      this.negativeValue = true;
    }
  };


  onParameterInputChange(event: any, type: any) {
    let newValue = event.target.value;
    if (type === 'Number') {
      newValue = newValue.replace(/[^0-9]/g, "");
      newValue = newValue.replace(/^0+/g, "");
      if (newValue === "" || parseInt(newValue) < 1) {
        newValue = " ";
      }
    }
    else if (type === 'Text') {
      newValue = newValue.replace(/[^a-zA-Z0-9]/g, "");
    }
    event.target.value = newValue;
    // console.log(this.ParameterFlag);
  }


  /* to change input fields in parameterTye
   @Author Saurabh salunke
   * @Date Oct 7, 2023
 */
  onParameterTypeSelect(event: any) {
    this.checksheetParameterForm.get('parameter').reset();
    console.log(event);
    this.disableReferModel = true;
    const selectedParameterType = event.typeName;
    this.isSelectedParaType = event.typeName;


    if (selectedParameterType === 'Text') {
      this.checksheetParameterForm.get('parameter').setValidators([Validators.required]);
      this.checksheetParameterForm.get('cycleValue').clearValidators();
      this.isAddButtonClicked = false;
      this.isNumberParameter = false;
      this.isTextParameter = true;
      this.isCyclePlan = false;
      this.isDateTimeParameter = false;
      this.isModelParameter = false;
      this.isGapParameter = false;
    } else if (selectedParameterType === 'Number') {
      this.checksheetParameterForm.get('parameter').setValidators([Validators.required]);
      this.checksheetParameterForm.get('cycleValue').clearValidators();
      this.isAddButtonClicked = false;
      this.isTextParameter = false;
      this.isNumberParameter = true;
      this.isDateTimeParameter = false;
      this.isModelParameter = false;
      this.isGapParameter = false;
    } else if (selectedParameterType === 'cyclePlan') {
      // this.checksheetParameterForm.get('parameter').clearValidators();
      this.checksheetParameterForm.get('cycleValue').setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.isTextParameter = false;
      this.isCyclePlan = true;
      this.isAddButtonClicked = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = false;
      this.isModelParameter = false;
      this.isGapParameter = false;
      // this.isNoteShowParameter = false;
    } else if (selectedParameterType === 'Datetime') {
      this.checksheetParameterForm.get('parameter').setValidators([Validators.required]);
      this.checksheetParameterForm.get('cycleValue').clearValidators();
      this.isTextParameter = false;
      this.isAddButtonClicked = false;
      this.isGapParameter = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = true;
      this.isModelParameter = false;
      // this.isNoteShowParameter = false;

    } else if (selectedParameterType === 'Gap') {
      this.checksheetParameterForm.get('cycleValue').clearValidators();
      this.isAddButtonClicked = false;
      this.isTextParameter = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = false;
      this.isModelParameter = false;
      this.isGapParameter = true;
      // this.isNoteShowParameter = true;
    } else if (selectedParameterType === 'Model') {
      this.checksheetParameterForm.get('cycleValue').clearValidators();
      this.isAddButtonClicked = false;
      this.isTextParameter = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = false;
      this.isGapParameter = false;
      this.isModelParameter = true;
      // this.isNoteShowParameter = false;
    } else {
      // Handle other parameter types if necessary
      this.isTextParameter = false;
      this.isAddButtonClicked = false;
      this.isNumberParameter = false;
      this.isDateTimeParameter = false;
      this.isGapParameter = false;
      this.isModelParameter = false;
      this.disableReferModel = false;
      // this.isNoteShowParameter = false;
    }

    this.checksheetParameterForm.get('parameter').updateValueAndValidity();
    this.checksheetParameterForm.get('cycleValue').updateValueAndValidity();
  }


  /* Save or Update Checksheet Parameter
  @Author Jayshri Kolase
  * @Date August 18, 2023
*/
  /* saveChecksheetParameter(checksheetParameterForm: any) {
    if (checksheetParameterForm.invalid) {
      Object.keys(checksheetParameterForm.controls).forEach(key => {
        checksheetParameterForm.controls[key].markAsDirty();
      });
      return;
    }
    console.log(checksheetParameterForm);
    if (checksheetParameterForm.status == "VALID") {
      if (checksheetParameterForm.value.paraType != null && checksheetParameterForm.value.paraType.length > 0) {
        for (let i = 0; i < checksheetParameterForm.value.paraType.length; i++) {
          this.parameterDet.parameterTypeId = checksheetParameterForm.value.paraType[i].id;
        }
      }
      // if (this.selectedParameterDet.id == undefined && this.selectedParameterDet.id == '') {
      if (this.selectedParameterDet.isEditParameter != true && (this.setChecksheetId.isEditParameter == false || this.setChecksheetId.isEditParameter == undefined) && (this.selectedParameterDet.id == undefined || this.selectedParameterDet.id == 0)) {
        let reqData = {
          "updatedBy": this.userDet.empId,
          "createdBy": this.userDet.empId,
          "parameter": checksheetParameterForm.value.parameter,
          "checkSheetId": this.setChecksheetId.checkSheetId,
          "parameterTypeId": this.parameterDet.parameterTypeId
        }
        console.log(reqData)
        this.apiService.saveChecksheetParameter('apis/sm/addChecksheetParameter', reqData).subscribe((response: any) => {
          if (response.result) {
            this.alertService.success("OJT checksheet parameter saved successfully.")
            this.modalService.dismissAll();
          }
          else {
            this.alertService.error(response.reason)
          }
        });
      }
      else {
        let reqData = {
          "updatedBy": this.userDet.empId,
          "createdBy": this.userDet.empId,
          "parameter": checksheetParameterForm.value.parameter,
          "checkSheetId": this.setChecksheetId.checkSheetId,
          "parameterTypeId": this.parameterDet.parameterTypeId,
          "parameterId": this.selectedParameterDet.id
        }
        this.apiService.updateChecksheetParameter('apis/sm/updateChecksheetParameter', reqData).subscribe((response: any) => {
          console.log(response);
          if (response.result) {
            this.alertService.success("OJT checksheet parameter updated successfully.");
            this.modalService.dismissAll();
          }
          else {
            this.alertService.error(response.reason)
          }
        })
      }
    }
  } */
  getSortFunction(array, fieldToSort) {
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "paraType") {
        array.sort(function (a, b) {
          var nameA = a.typeName ? a.typeName.toUpperCase() : "";
          var nameB = b.typeName ? b.typeName.toUpperCase() : "";
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
}
