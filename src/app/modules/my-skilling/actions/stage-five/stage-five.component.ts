import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ActionsService } from '../actions.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/theme/shared/components';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-stage-five',
    templateUrl: './stage-five.component.html',
    styleUrls: ['./stage-five.component.scss']
})
export class StageFiveComponent implements OnInit {

    @ViewChild('QuesPerfectScroll') QuesPerfectScroll: PerfectScrollbarComponent;

    @Input() actionDet: any = {};

    answerList: any = [];
    submitLoading: boolean = false;
    reqAss: any = {};
    // Aniket :- boolean key name for assessment 
    timeInterval: any;
    isAssessmentStart: boolean = false;
    isAssessmentClose: boolean = false;
    assessmentStartCloseSpinner: boolean = false;

    Constant: any = {
        RATING: 1,
        RADIO: 2,
        CHECKBOX: 3,
        AlphabetLetter: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    }

    assessmentLoader: boolean = false;
    assessmentDet: any = {};
    checkTimeOut: boolean = false;
    isReload: boolean = false;

    constructor(private actionsService: ActionsService,
        private modalService: NgbModal,
        private alertService: AlertService,
    ) { }

    ngOnInit(): void {
        this.getAssessmentDetails(this.actionDet.oJTAssessmentId);
        window.addEventListener('beforeunload', this.confirmExit.bind(this)); // Add the 'beforeunload' event listener
    }
    // Aniket :- add destroy fun
    ngOnDestroy() {
        console.log('Assessment page left');
        this.actionDet.assessmentTimer = '00:00:00';
        this.isAssessmentStart = false;
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        window.removeEventListener('beforeunload', this.confirmExit.bind(this)); // Clean up the event listener when the component is destroyed
    }

    @HostListener('window:beforeunload', ['$event'])
    confirmExit(event: BeforeUnloadEvent): void {
        if (this.isAssessmentStart) {
            this.isReload = true;
            const message = 'Are you sure you want to leave? Unsaved changes might be lost.';
            event.returnValue = message; // Triggers the browser's default warning
            // Automatically submit the assessment before leaving
            // this.submitStageFiveStatus();
        }
    }

    getAssessmentDetails(oJTAssessmentId: any) {
        this.assessmentLoader = true;
        this.assessmentDet = {};
        this.actionsService.getAssignedAssessmentDetails(oJTAssessmentId).subscribe((data: any) => {
            this.assessmentLoader = false;
            if (data.result) {
                if (data.assessment != null && data.assessment.quesList != null && data.assessment.quesList.length > 0) {
                    this.assessmentDet = data.assessment;
                    this.setSubCategoryGroup();
                }
                //Aniket :- Timer code
                this.actionDet.remainingTime = parseFloat(data.assessment.time) - parseFloat(data.assessment.totalAssessedTime);
                console.log(this.actionDet.remainingTime);
                // this.actionDet.assessmentTimer = '00:00:00';
                const totalMinutes = this.actionDet.remainingTime;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = Math.floor(totalMinutes % 60);
                const seconds = Math.floor((totalMinutes * 60) % 60);
                const formattedTime =
                    String(hours).padStart(2, '0') + ':' +
                    String(minutes).padStart(2, '0') + ':' +
                    String(seconds).padStart(2, '0');
                this.actionDet.assessmentTimer = formattedTime;
                if (data.assessment.time <= data.assessment.totalAssessedTime) {
                    this.actionDet.remainingTime = 0;
                    this.isAssessmentStart = false;
                    this.isAssessmentClose = true;
                    // this.alertService.error('Your assessment time up');
                    // return;
                    this.timeRemaining(this.actionDet.remainingTime);
                } else {
                    if (data.assessment.totalAssessedTime > 0) {
                        if (!this.isAssessmentStart) {
                            clearInterval(this.timeInterval);
                        } else {
                            //this.timeRemaining(this.selectedDet.remainingTime);
                        }
                    }
                }
            } else {
                this.assessmentDet = {};
            }
        }, (error: any) => {
            this.assessmentLoader = false;
        });
    }
    setSubCategoryGroup() {
        var tmpCatArray: any = [];
        var tmpCatIds = [];
        var quesArray = [];

        this.assessmentDet.quesList.forEach(data => {
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
            this.assessmentDet.quesListGroupBy = tmpCatArray;
        }
        console.log(this.assessmentDet.quesListGroupBy)
    }

    addOrUpdateRequestList(ques, opt) {
        if (this.answerList == null && this.answerList.length == 0) {
            this.answerList.push({
                "questionId": ques.quetionId,
                "queOptionList": [
                    {
                        "optionId": opt.assessmentQueOptId
                    }
                ]
            });
        } else {
            let isExist = false;
            this.answerList.forEach(element => {
                if (element.questionId == ques.quetionId) {
                    isExist = true;
                    element.queOptionList = [{
                        "optionId": opt.assessmentQueOptId
                    }];
                }
            });

            if (!isExist) {
                this.answerList.push({
                    "questionId": ques.quetionId,
                    "queOptionList": [
                        {
                            "optionId": opt.assessmentQueOptId
                        }
                    ]
                });
            }
        }
        ques.highlight = false;
        console.log(this.answerList);
    }

    highlightUnansweredQuestions() {
        if (
            this.assessmentDet?.quesListGroupBy &&
            this.assessmentDet.quesListGroupBy.length > 0
        ) {
            // Collect all answered question IDs into a Set for quick lookup
            const answeredQuestionIds = new Set(
                this.answerList?.map((answer) => answer.questionId) || []
            );

            // Loop through question groups and their questions to set 'highlight' property
            this.assessmentDet.quesListGroupBy.forEach((group) => {
                if (group.quesList && group.quesList.length > 0) {
                    group.quesList.forEach((question) => {
                        question.highlight = !answeredQuestionIds.has(question.quetionId);
                    });
                }
            });
        }
    }


    submitStageFiveStatus() {
        this.submitLoading = true;
        if ((this.answerList == null || this.answerList.length == 0 || this.answerList.length != this.assessmentDet.quesList.length) && !this.checkTimeOut && !this.isReload) {
            this.highlightUnansweredQuestions();
            this.alertService.error("Please ensure all mandatory questions are answered before submitting.");
            this.submitLoading = false;
            return;
        }
        let url = '';
        this.reqAss = {
            ojtRegiId: this.assessmentDet.ojtRegisId,
            assessmentId: this.assessmentDet.assessmentId,
            skillingAuditId: this.assessmentDet.skillingAuditId,
            ojtAssId: this.assessmentDet.oJTAssessmentId,
            queList: this.answerList,
            status: "COMPLETED",
        }
        if (this.actionDet.assessmentType != "SAFETY") {
            this.reqAss.skillingId = this.assessmentDet.skillingId; //this.actionDet.skillingId
            this.reqAss.tlEmpId = this.assessmentDet.tlEmpId;
            this.reqAss.deptId = this.assessmentDet.deptId;
            this.reqAss.workstationId = this.assessmentDet.workstationId;
            this.reqAss.lineId = this.assessmentDet.lineId;

            url = 'apis/sm/stageFiveSubmission';

        }
        if (this.actionDet.assessmentType == "SAFETY") {
            url = 'apis/sm/safteyAssessmentSubmission'

        }
        console.log(this.reqAss);

        this.actionsService.submitStageFiveStatus(url, this.reqAss).subscribe((data: any) => {
            console.log(data);
            this.submitLoading = false;
            if (data.result) {
                this.alertService.success("Assessment Completed Successfully.");
                this.modalService.dismissAll();
            } else if (data.statusCode == 100 || data.statusCode == 500) {
                this.alertService.error(data.reason);
                // this.alertService.error("Error occurred.");
            }
            else {
                this.alertService.error("Error occurred.");
            }
        })
    }

    closeModal() {
        // Swal.fire({
        //     title: 'Are You Sure!',
        //     text: 'Do you want to cancel this assessment ?',
        //     icon: 'warning',
        //     showCancelButton: true,
        //     confirmButtonColor: '#7044cd',
        //     cancelButtonColor: '#d33',
        //     confirmButtonText: 'Yes, Cancel It',
        //     allowOutsideClick: false,
        //     allowEscapeKey: false,
        //     allowEnterKey: false,
        // }).then((result) => {
        //     if (result.isConfirmed) {
        //         this.modalService.dismissAll();
        //     }
        // })
        this.modalService.dismissAll();
    }
    // Aniket :- Countdown time show in assessment
    connect() {
        this.assessmentStartCloseSpinner = true;
        this.isAssessmentStart = true;
        console.log(this.actionDet);
        this.timeRemaining(this.actionDet.remainingTime);
    }
    updateTimer() {
        if (!this.isAssessmentClose) {
            var req = {
                skillingAuditId: this.assessmentDet.skillingAuditId,
                assessmentTimeInterval: 1,
                //  queList: this.answerList,
            }
            this.actionsService.setRemainingTime(req).subscribe((res: any) => {
                this.assessmentCounter = 0;
                if (res.result) {
                } else { }
            })
        }
    }

    assessmentCounter: any = 0;
    timeRemaining(time) {
        var countDownDate = new Date();
        this.assessmentCounter = 0;
        countDownDate.setMinutes(countDownDate.getMinutes() + time);
        var countDownMiliSec = countDownDate.getTime();
        this.timeInterval = setInterval(() => {
            if (this.assessmentCounter == 60) {
                this.updateTimer();
            } else {
                this.assessmentCounter = this.assessmentCounter + 1;
            }
            var now = new Date().getTime();
            var timeleft = countDownMiliSec - now;
            // Calculating the days, hours, minutes and seconds left
            var days: any = Math.floor(timeleft / (1000 * 60 * 60 * 24));
            var hours: any = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes: any = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
            var seconds: any = Math.floor((timeleft % (1000 * 60)) / 1000);

            hours = ("0" + hours).slice(-2);
            minutes = ("0" + minutes).slice(-2);
            seconds = ("0" + seconds).slice(-2);
            // Result is output to the specific element
            this.actionDet.assessmentTimer = hours + ':' + minutes + ':' + seconds;
            document.getElementsByClassName("assessmentTimer")[0].innerHTML = hours + ':' + minutes + ':' + seconds;

            // Display the message when countdown is over
            if (timeleft <= 0) {
                this.updateTimer();
                clearInterval(this.timeInterval);
                this.isAssessmentStart = false;
                this.isAssessmentClose = true;
                console.log('TIME UP!!');
                document.getElementsByClassName("assessmentTimer")[0].innerHTML = 'TIME UP!!';
                this.actionDet.assessmentTimer = 'TIME UP!!';
                this.checkTimeOut = true
                this.submitStageFiveStatus();
            }
        }, 1000);
    }

}
