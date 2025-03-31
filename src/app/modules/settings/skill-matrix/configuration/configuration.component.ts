import { Component, EventEmitter, OnInit, Output, ElementRef ,ViewChild } from '@angular/core';
import { SkillMatrixService } from '../skill-matrix.service';
import { AlertService } from 'src/app/theme/shared/components';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  mainTab: any;
  plantList: any;
  searchDet: any={};
  userDet: any={};
  showBranchForStageAndAssess: boolean = true;
  @Output() branchIdChange: EventEmitter<number> = new EventEmitter<number>();
  singleDropdownSettings: { singleSelection: boolean; idField: string; textField: string; allowSearchFilter: boolean; noDataAvailablePlaceholderText: string; closeDropDownOnSelection: boolean; };
  scrollRightBtn: boolean = true;
  scrollLeftBtn: boolean = false;
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any>;
  constructor(
    private skillMatrixService: SkillMatrixService,
    public alertService: AlertService
  ) { }

   ngOnInit() {
    this.mainTab = 1;
    this.userDet = JSON.parse(localStorage.getItem('userDet'));
    this.getAccessiblePlantList();
    this.singleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      noDataAvailablePlaceholderText:'Data not found',
      closeDropDownOnSelection: true,
    };

  }
  isSetMainTab = function (tabId) {
    return this.mainTab === tabId;
  };

  setMainTab(tabId) {
    this.mainTab = tabId;
    if (this.mainTab == 1) {
      this. showBranchForStageAndAssess = true;
    } else if (this.mainTab == 2) {
      this. showBranchForStageAndAssess = true;

    } else if (this.mainTab == 3) {
      this. showBranchForStageAndAssess = true;

    } 
    else if (this.mainTab == 4) {
      this. showBranchForStageAndAssess = true;
    } else if (this.mainTab == 5) {
      this. showBranchForStageAndAssess = true;

    } else if (this.mainTab == 6) {
      this. showBranchForStageAndAssess = true;    
    }
      // Aniket :- Add document tab lable 
    else if (this.mainTab == 7) {
      this. showBranchForStageAndAssess = true;
    }
    else if (this.mainTab == 8) {
      this. showBranchForStageAndAssess = false;

    }
    else if (this.mainTab == 8) {

    }
  //  else if (this.mainTab == 1) {
  //     this. showBranchForStageAndAssess = true;
  //   } else if (this.mainTab == 2) {
  //     this. showBranchForStageAndAssess = true;

  //   } else if (this.mainTab == 3) {
  //     this. showBranchForStageAndAssess = false;

  //   } else if (this.mainTab == 4) {

  //   }
  };
   
  /*
   Get Accessible Plant List
   @Author Saurabh S
* @Date  Sept 29 2023
*/
getAccessiblePlantList() {
  this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).subscribe((res: any) => {
    if (res.result) {
      if (res.branchAccessList != null && res.branchAccessList.length > 0) {
        /* Use For Add Screen */
        this.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        this.plantList = this.sortFunction(this.plantList, 'name');
        /* Use For Filter */
        this.searchDet.plantList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
        this.searchDet.plantList = this.sortFunction(this.plantList, 'name');

      } else {
        /* Use For Add Screen */
        this.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        /* Use For Filter */
        this.searchDet.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
    } else {
      /* Use For Add Screen */
      this.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      /* Use For Filter */
      this.searchDet.plantList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
    }
    this.searchDet.branchId = [this.searchDet.plantList[0]];
    this.searchDet.branchId = [this.plantList[0]];

    console.log(this.searchDet.branchId[0].id)
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
    this.branchIdChange.emit(ev.id);
  } else {
   
    this.branchIdChange.emit(null);
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
getSortFunction(array, fieldToSort) {  
  if (array && Array.isArray(array) && array.length > 0) {
    if (fieldToSort === "plant") {
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
sortFunction(array, key) {
  if (array != null && array.length > 0) {
    array.sort(function (a, b) {
      var nameA = (!Number(a[key])) ? a[key].toUpperCase() : a[key];
      var nameB = (!Number(b[key])) ? b[key].toUpperCase() : b[key];
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
//Aniket :-  Horizontal Scroll Bar
public scrollRight(): void {
  let rightWidth = this.widgetsContent.nativeElement.clientWidth + this.widgetsContent.nativeElement.scrollLeft;
  if (this.widgetsContent.nativeElement.scrollWidth == rightWidth) {
    this.scrollRightBtn = false;
    rightWidth = 0;
  }
  this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 150), behavior: 'smooth' });
  this.scrollLeftBtn = true;
}

public scrollLeft(): void {
  if (this.widgetsContent.nativeElement.scrollLeft == 0 || this.widgetsContent.nativeElement.scrollLeft == 150) {
    this.scrollLeftBtn = false;
  }
  this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 150), behavior: 'smooth' });
  this.scrollRightBtn = true;
}
}
