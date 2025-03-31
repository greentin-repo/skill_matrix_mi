import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-ui-kit',
  templateUrl: './ui-kit.component.html',
  styleUrls: ['./ui-kit.component.scss']
})
export class UiKitComponent implements OnInit {
  searchDet: any = {};
  filterFlag: boolean = false;
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  staticPagination: any = {
    total: 50,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  }

  submitSpinner: boolean = false;
  array: any = [
    { id: 1, name: 'Field 1' },
    { id: 2, name: 'Field 2' },
    { id: 3, name: 'Field 3' },
    { id: 4, name: 'Field 4' },
    { id: 5, name: 'Field 5' }
  ]
  constructor(
    modalConfig: NgbModalConfig,
    private modalService: NgbModal) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit(): void {
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
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
  }

  getCheckedValue() {
    return true;
  }
  /*
      Filter modal function
  */
  filterModalOpen(modal) {
    this.modalService.open(modal, {
      windowClass: 'filterPopup',
    });
  }

  /*
    Top Modal
  */
  modalOpen(modal, popupClass) {
    this.modalService.open(modal, {
      windowClass: popupClass
    });
  }
  getSearchList(ev) {
    console.log('Search Event')

  }
  onChangeAll(ev) {
    console.log('Select All Event')
  }
  onChange(ev) {
    console.log('Single Select Event')
  }
  loadMore(ev) {
    console.log('Pagination Event');
  }
  statusUpdate(ev) {
    console.log('Pagination Event');
  }
}
