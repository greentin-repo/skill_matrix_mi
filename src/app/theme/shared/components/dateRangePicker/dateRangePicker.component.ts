import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import * as _moment from 'moment';
import { Moment } from 'moment';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dateRangePicker',
  templateUrl: './dateRangePicker.component.html',
  styleUrls: ['./dateRangePicker.component.scss'],
  providers: [DatePipe, NgbModalConfig, NgbModal]
})

export class DateRangePickerComponent implements OnInit {
  customDateVisible: boolean;
  selectedDate: any = {};
  selectedDateType: any;
  hoveredDate: NgbDate | null = null;
  ngbSelectedDate: any = {};
  maxDate: any;
  fromDate: any;
  toDate: any;
  isSet: boolean = false;
  dateObj: any = {};
  profileDiv: any = {};
  @Output() dateRangeDates: EventEmitter<any> = new EventEmitter();
  loggedInEmpDet: any = {};
  collapsed = true;
  constructor(
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public datepipe: DatePipe,
    modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private router: Router) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;

  }

  ngOnInit() {
    // this.setDate('1Y');
    this.maxDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    if (localStorage.getItem('userDet')) {
      this.loggedInEmpDet = JSON.parse(localStorage.getItem('userDet'));
    }
  }

  setDate(type) {
    if (this.selectedDateType && this.selectedDateType == type) {
      this.selectedDateType = undefined;
      this.selectedDate = {};
    } else {
      this.selectedDateType = type;
      this.selectedDate.toDate = moment(new Date()).format('YYYY-MM-DD')
      var tmpFromMonthYear = '';
      this.isSet = false;
      if (type) {
        if (type == '1M') {
          tmpFromMonthYear = moment().subtract(1, 'months').format();
        } else if (type == '6M') {
          tmpFromMonthYear = moment().subtract(6, 'months').format();
        } else if (type == '1Y') {
          tmpFromMonthYear = moment().subtract(1, 'year').format();
        } else if (type == '2Y') {
          tmpFromMonthYear = moment().subtract(2, 'year').format();
        }
        this.selectedDate.fromDate = moment(tmpFromMonthYear).format('YYYY-MM-DD');
      } else {
        this.isSet = true;
      }
    }
    // console.log(this.selectedDate);
    this.dateRangeDates.emit(this.selectedDate);
  }
  selectCustomDate(fromDate, toDate) {
    if (fromDate) {
      var fromdate = new Date(
        fromDate.value
      );
      this.dateObj.fromDate = moment(fromDate.value).format('YYYY-MM-DD');
    }
    else if (toDate) {
      var todate = new Date(
        toDate.value
      );
      this.dateObj.toDate = moment(toDate.value).format('YYYY-MM-DD');;
    }
    if (this.dateObj.fromDate && this.dateObj.toDate) {
      this.dateRangeDates.emit(this.dateObj)
      // console.log(this.dateObj);
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
}
