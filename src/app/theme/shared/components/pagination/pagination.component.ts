import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  providers: [NgbDropdownConfig]
})

export class PaginationComponent implements OnInit {
  @Input() staticPagination: any;
  @Output() paginationData: EventEmitter<any> = new EventEmitter();
  @Output() submitData: EventEmitter<any> = new EventEmitter();
  @Input() submitButton: boolean;
  @Input() submitSpinner: boolean;
  @Input() buttonLabel: any;
  isSubmitBtnShow: boolean;
  constructor(config: NgbDropdownConfig) {
  }

  ngOnInit() {
    console.log(this.buttonLabel);
    if (this.submitButton == true || this.submitButton == false) {
      this.isSubmitBtnShow = true;
    }
  }
  loadPage(page: number) {
    this.paginationData.emit(this.staticPagination);
  }
  callSubmitBtn() {
    this.submitData.emit('Call Submit Data');
  }
}
