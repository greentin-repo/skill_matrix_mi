import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SkillMatrixService } from '../../../skill-matrix.service';
import { AlertService } from 'src/app/theme/shared/components';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-check-sheet-points',
  templateUrl: './add-check-sheet-points.component.html',
  styleUrls: ['./add-check-sheet-points.component.scss']
})
export class AddCheckSheetPointsComponent implements OnInit {
  @Input() close;
  @Input() dayValue :any;
  @Input() noOfDays:any;
  checksheetPointsForm: FormGroup;
  checkSheetForm: FormGroup;
  addPoints: any = {};
  // setChecksheetId: any = {};
  userDet: any = {};
  // selectedPointsDet: any = {};
  submitLoader: boolean = false;
  selectedDet: any = {};
  constructor(
    private fb: FormBuilder,
    private skillMatrixService: SkillMatrixService,
    private alertService: AlertService,
    private modalService: NgbModal
  ) { }

  dayNumForm(): FormGroup {
    return this.fb.group({
      dayNo: '1',
      pointList: this.fb.array([])
    })
  }
  pointsForm(): FormGroup {
    return this.fb.group({
      itemName: new FormControl('', Validators.required),
      reference: new FormControl(''),//Validators.required
      id: new FormControl('0'),
      action: new FormControl('ADD')
    })
  }

  ngOnInit(): void {
    console.log(this.dayValue);
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    this.checkSheetForm = this.fb.group({
      daysList: this.fb.array([])
    })
    this.addDaysRow(0);
    this.getChecksheetDetails();
  }
  daysList(): FormArray {
    return this.checkSheetForm.get("daysList") as FormArray;
  }
    addDaysRow(dayNumIndex: number) {
    // this.daysList().push(this.fb.group({
    //     dayNo: dayNumIndex + 1,
    //     pointList: this.fb.array([])
    //   }));
    //   this.addPointsRow(dayNumIndex);
    const totalDays = this.selectedDet.noOfDays;
    const currentDays = this.daysList().length; 

    if (currentDays >= totalDays) {
       this.alertService.error('Cannot add more days. Maximum number of days reached.');
    return;
    }
    this.daysList().push(this.fb.group({
        dayNo: currentDays + 1, 
        pointList: this.fb.array([])
    }));
    this.addPointsRow(currentDays); 
    }
  removeDayNumRow(dayNumIndex: number) {
    this.daysList().removeAt(dayNumIndex);
    this.updateDayField();
  }
  pointList(dayNumIndex: number): FormArray {
    return this.daysList().at(dayNumIndex).get("pointList") as FormArray;
  }
  addPointsRow(dayNumIndex: number) {
    this.pointList(dayNumIndex).push(this.pointsForm());
  }
  removePointRow(empNumIndex: number, pointIndex: number) {
    this.pointList(empNumIndex).removeAt(pointIndex);
  }
  updateDayField() {
    if (this.daysList().controls != null && this.daysList().controls.length > 0) {
      for (let index = 0; index < this.daysList().controls.length; index++) {
        this.daysList().at(index).get("dayNo").setValue(index + 1);
      }
    }
  }


  /* Get Checksheet Details form Local Storage
   @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  getChecksheetDetails() {
    if (localStorage.getItem('setChecksheetId')) {
      this.selectedDet = JSON.parse(localStorage.getItem('setChecksheetId'));
    }
    if (localStorage.getItem('selectedPointsDet')) {
      this.selectedDet = JSON.parse(localStorage.getItem('selectedPointsDet'));
    }
    let obj: any = {
      daysList: []
    };
    //  && (this.setChecksheetId.isEditPoint == false || this.setChecksheetId.isEditPoint == undefined)
    if (this.selectedDet) {
      if (this.selectedDet.hasOwnProperty('isEditPoint') && this.selectedDet.isEditPoint) {
        obj.daysList.push(this.selectedDet);
      } else {
        obj.daysList = this.selectedDet.groupPointList;
      }
    }
    console.log(obj);
    if (obj.daysList != null && obj.daysList.length > 0) {
      for (let index = 0; index < obj.daysList.length; index++) {
        if (index != 0) {
          this.addDaysRow(index);
        }
        this.daysList().controls[index].get('dayNo').setValue(obj.daysList[index].dayNo);
        if (obj.daysList[index].pointList != null && obj.daysList[index].pointList.length > 0) {
          for (let x = 0; x < obj.daysList[index].pointList.length; x++) {
            if (x != 0) {
              this.addPointsRow(index);
            }
            this.pointList(index).controls[x].get('id').setValue(obj.daysList[index].pointList[x].checksheetPointId);
            this.pointList(index).controls[x].get('action').setValue('UPDATE');
            this.pointList(index).controls[x].get('itemName').setValue(obj.daysList[index].pointList[x].itemName);
            this.pointList(index).controls[x].get('reference').setValue(obj.daysList[index].pointList[x].reference);
          }
        }
      }
    }
  }
  saveChecksheetForm(form) {
    console.log(form.value)
    this.submitLoader = true;
    if (form.invalid) {
      Object.keys(form.controls).forEach((key: any, index) => {
        form.controls[key].markAsDirty();
        this.submitLoader = false;
      });
      this.alertService.error('Please fill mandatory data');
      return;
    }
    if (form.value.daysList.length < this.dayValue) {
      this.alertService.error('It is mandatory to add checksheet points for all days.');
      this.submitLoader = false;
      return;
    }
    console.log(this.noOfDays)
    let reqBody = {
      "checkSheetId": this.selectedDet.checkSheetId,
      "createdBy": this.userDet.empId,
      "daysList": form.value.daysList
    }
    // let x = 0;
    // if (x == 0) {
    console.log(reqBody);
    //   this.submitLoader = false;
    //   return;
    // }
    this.skillMatrixService.saveChecksheetPoint('apis/sm/addChecksheetPoint', reqBody).subscribe((response: any) => {
      if (response.result) {
        this.submitLoader = false;
        // this.alertService.success("OJT checksheet point saved successfully.");
        this.alertService.success("OJT key point saved successfully.");
        this.modalService.dismissAll();
      } else {
        if (response.statusCode == 100) {
          this.alertService.error(response.reason);
        } else {
          this.alertService.error('Error occurred while saving data. Please try again');
        }
      }
    }, (error: any) => {
      this.submitLoader = false;
    })
  }


  /* Delete Checksheet Parameter
   @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  deleteChecksheetPoint(id, dayNumIndex, pointIndex) {
    Swal.fire({
      title: 'Are You Sure!',
      text: 'Do you want to remove this points?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7044cd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes remove it',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      customClass: {
        container: 'swalConfirmationModal'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        let reqbody = {
          "updatedBy": this.userDet.empId,
          "createdBy": this.userDet.empId,
          "id": id
        }
        this.skillMatrixService.deleteChecksheetPoint('apis/sm/deleteChecksheetPoint', reqbody).subscribe((data: any) => {
          if (data.result) {
            // this.alertService.success("Checksheet point removed successfully");
            this.alertService.success("Key point removed successfully");
            this.removePointRow(dayNumIndex, pointIndex);
          } else {
            if (data.statusCode == 100) {
              this.alertService.error(data.reason);
            } else {
              this.alertService.error('Error occurred while removing data. Please try again');
            }
          }
        })
      } else {

      }
    });
  }



  /* Validation for checksheet point(is value not a 0 and not a negative and not a greater than no. of days)
   @Author Jayshri Kolase
   *@Date Sep 1, 2023
 */
  onPointInputChange = (control: any) => {
    const value = control.value;
    const noOfDays = this.selectedDet.noOfDays;
    if (value === 0) {
      return { zeroValue: true };
    }
    if (value < 0) {
      return { negativeValue: true };
    }
    if (value > noOfDays) {
      return { greaterThanNoOfDays: true };
    }
    return null;
  };


  /* Save or Update Checksheet Point
   @Author Jayshri Kolase
   * @Date August 18, 2023
 */
  saveChecksheetPoint(checksheetPointsForm: any) {
    if (checksheetPointsForm.invalid) {
      Object.keys(checksheetPointsForm.controls).forEach(key => {
        checksheetPointsForm.controls[key].markAsDirty();
      });
      return;
    }
    console.log(checksheetPointsForm);
    // if (checksheetPointsForm.status == "VALID") {
    //   if (this.selectedPointsDet.isEditPoint != true && (this.setChecksheetId.isEditPoint == false || this.setChecksheetId.isEditPoint == undefined) && (this.selectedPointsDet.checksheetPointId == undefined || this.selectedPointsDet.checksheetPointId == 0)) {
    let pointReq = {
      "checkSheetId": this.selectedDet.checkSheetId,
      "createdBy": this.userDet.empId,
      "daysList": [
        {
          "dayNo": checksheetPointsForm.value.dayNum,
          "pointList": [
            {
              "itemName": checksheetPointsForm.value.point,
              "reference": checksheetPointsForm.value.reference
            }
          ]
        }
      ]
    }
    this.skillMatrixService.saveChecksheetPoint('apis/sm/addChecksheetPoint', pointReq).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        this.alertService.success("OJT checksheet point added successfully.");
        // this.alertService.success("OJT key point added successfully.");
        this.modalService.dismissAll();
      }
      else {
        this.alertService.error(response.reason);
      }
    })
    // }
    // else {
    //   let pointReq = {
    //     itemName: checksheetPointsForm.value.point,
    //     dayNo: checksheetPointsForm.value.dayNum,
    //     checkSheetId: this.selectedPointsDet.checkSheetId,
    //     id: this.selectedPointsDet.checksheetPointId,
    //     updatedBy: this.userDet.empId,
    //     createdBy: this.userDet.empId
    //   }
    //   this.skillMatrixService.saveChecksheetPoint('apis/sm/updateChecksheetPoint', pointReq).subscribe((response: any) => {
    //     console.log(response);
    //     if (response.result) {
    //       this.alertService.success("OJT checksheet point updated successfully.")
    //       this.modalService.dismissAll();
    //     }
    //     else {
    //       this.alertService.error(response.reason);
    //     }
    //   })
    // }
    // }
  }
}
