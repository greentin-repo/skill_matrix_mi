import { Component, Input, OnInit } from '@angular/core';
import { ActionsService } from '../actions.service';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-action-det-cycle',
  templateUrl: './action-det-cycle.component.html',
  styleUrls: ['./action-det-cycle.component.scss']
})
export class ActionDetCycleComponent implements OnInit {

  @Input() actionDet: any = {};

  productionList: any = [];
  filterFlag: boolean = false;
  submitSpinner: boolean = false;
  searchDet: any = {
    searchFlag: false,
    searchInput: ''
  }
  staticPagination: any = {
    total: 50,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  };
  sorting: any;
  listLoading: boolean = false;

  constructor(private actionsService: ActionsService,) { }

  ngOnInit(): void {
  }

  getCheckedValue() {
    return true;
  }

  /*
    @DESC : Function to sort table asc dsc
    @Author: Shashi
    @Date : 25 Aug 2023
  */
  sortData(sort: Sort) {
    this.sorting = sort;
    this.getProductionList('', false);
  }

  getSearchListTrainingProd(ev) {
    this.clearPagination();
    this.searchDet.searchData = ev;
    if (!ev) {
      this.searchDet.searchInput = '';
    }
    if (this.filterFlag) {
      this.getProductionList('filter', false);
    } else {
      this.getProductionList('', false);
    }
  }

  clearPagination() {
    this.staticPagination = {
      total: 0,
      page: 1,
      maxSize: 5,
      itemsPerPage: 10,
      totalPages: 0,
      listLength: 0
    }
  }

  removeFilterTrainingProd() {
    this.filterFlag = false;
    this.clearPagination();
    this.getProductionList('', false);
  }

  getProductionList(filterFlag, isClearPagination) {
    // this.productionList = [];
    // let reqBody: any;
    // Object.assign({}, reqBody)
    // this.listLoading = true;

    // if (this.staticPagination.offset > 0 && isClearPagination == true && filterFlag == 'filter') {
    //   this.clearPagination();
    // }
    // if (this.staticPagination.page == 1) {
    //   this.staticPagination.offset = 0;
    // } else {
    //   this.staticPagination.offset = (this.staticPagination.page - 1) * this.staticPagination.itemsPerPage;
    // }
    // reqBody = {
    //   // "empId": id,
    //   "limit": this.staticPagination.itemsPerPage,
    //   "offset": this.staticPagination.offset
    // }
    // if (this.searchDet.searchData && this.searchDet.searchInput && this.searchDet.searchInput != '') {
    //   reqBody.search = this.searchDet.searchInput;
    // }
    // if (this.sorting) {
    //   if (this.sorting.direction != "") {
    //     reqBody.colName = this.sorting.active,
    //     reqBody.orderType = this.sorting.direction
    //   }
    // }
    // this.actionsService.getProductionList(reqBody).subscribe((data: any) => {
    //   this.listLoading = false;
    //   if (data.result) {
    //     if (this.staticPagination.page == 1) {
    //       this.staticPagination.total = data.totalMySkillingCount;
    //       this.staticPagination.totalPages = Math.ceil(data.participantList.length / this.staticPagination.itemsPerPage);
    //     }
    //     if (data.participantList != null && data.participantList.length > 0) {
    //       this.productionList = data.participantList;
    //       this.staticPagination.listLength = data.participantList.length;
    //     } else {
    //       this.productionList = []
    //       this.staticPagination.listLength = this.productionList.length;
    //       this.staticPagination.total = this.productionList.length;
    //     }
    //   } else {
    //     this.productionList = []
    //     this.staticPagination.listLength = this.productionList.length;
    //     this.staticPagination.total = this.productionList.length;
    //   }
    // })
  }
  statusUpdate(ev) {

  }
  loadMoreTrainingProd(data: any) {
    this.staticPagination = data;
    if (this.filterFlag) {
      this.getProductionList('filter', false);
    } else {
      this.getProductionList('', false);
    }
  }

}
