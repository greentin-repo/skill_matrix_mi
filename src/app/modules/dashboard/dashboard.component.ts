import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbCalendar, NgbDateParserFormatter, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DashboardService } from './dashboard.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import {
  ChartComponent, ApexAxisChartSeries, ApexChart, ApexFill, ApexYAxis, ApexTooltip, ApexTitleSubtitle, ApexXAxis, ApexDataLabels, ApexStroke,
  ApexPlotOptions, ApexLegend, ApexNoData, ApexAnnotations
} from "ng-apexcharts";
import * as ApexCharts from 'apexcharts';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('org-chart-container') orgChartContainer: ElementRef;
  @ViewChild('branch-chart-container') branchChartContainer: ElementRef;
  @ViewChild('dept-chart-container') deptChartContainer: ElementRef;
  filterData: FormGroup;
  formData: FormGroup;
  filterFlag: boolean = false;
  SingleDropdownSettings: IDropdownSettings = {};
  multipleDropdownSettings: IDropdownSettings = {};
  branchLevelGraph: any;
  @ViewChild('chartsContainer', { static: false }) chartsContainer: ElementRef;
  graphDetails: any = [];
  optionValue: any = [];
  selectedDate: any = {};
  isLoading: boolean = false;
  
  selectedDateType: any;
  hasDataToShow: boolean = false;
  submitLoader: boolean;
  isSet: boolean = false;
  dateObj: any = {};
  selectedReport: any = {};
  staticPagination: any = {
    total: 50,
    page: 1,
    maxSize: 5,
    itemsPerPage: 10,
    totalPages: 5,
    listLength: 50
  }
  levelList: any = [
    { id: 1, name: 'Organization' },
    { id: 2, name: 'Plant' },
    { id: 3, name: 'Cell' },
    ,
  ];

  submitSpinner: boolean = false;
  deparmentList: any;
  cellLineList: any;
  deptList: any;
  dataList: any;
  cellLineName: any;
  branchAccessList: any[];
  userDet: any = {};
  selectedBranch: any = {};
  selectedBranchId: any;
  branchId: any;
  searchDet: any = {}
  branchLvlGraph: any;
  BranchChart: echarts.ECharts;
  chartOptions: { tooltip: {}; legend: {}; xAxis: {}; yAxis: {}; series: any[]; };
  myChart: echarts.ECharts;
  orgLevelGraph: any = {};
  deptLevelGraph: any;
  selectedData: any;
  seletedOption: any = {};
  orgLevelGraphArray: any = [];
  chartUri: any[];
  isDownloadingPDF: boolean = false;
  isSubmitted: boolean = false;
  showDropdownError: boolean = false;
  showPlantError: boolean = false;
  showCellError: boolean = false;

  constructor(modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public fb: FormBuilder,
    private skillMatrixService: DashboardService,) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  async ngOnInit() {
    this.SingleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      closeDropDownOnSelection: true,
      allowSearchFilter: true
    };
    this.multipleDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    try {
      this.userDet = JSON.parse(localStorage.getItem('userDet'));
      await this.getBranchAccessList();
      this.searchDet.option = [this.levelList[1]];
      this.seletedOption = this.levelList[0];
      this.submitData();
    } catch (error) {
      console.error(error);
    }
  }

  /* Multi Select Dropdown onChange function
  Author saurabh salunke
  @Date sept 12, 2023 */

  onChangeAll(ev: any, type) {
    if (ev) {
      if (type == 'Cell') {
        this.showCellError = false;
      }
    } else {
      if (type == 'Cell') {
        this.showCellError = true;
        this.graphDetails=[];
        this.fetchGraphData('');
        this.hasDataToShow=true;
      }
    }
  }

  /* open filter modal popup
  @Author saurabh salunke
  @Date sept 12, 2023 */

  filterModalOpen(FilterModal) {
    console.log("In filter")
    if (!this.filterFlag) {
      // this.filterData.reset();
    }
    // this.getInterventions();
    this.modalService.open(FilterModal, {
      windowClass: 'filterPopup',
    });
  }

  /* get deparment list
  @Author saurabh salunke
  @Date sept 12, 2023 */

  getDeptList(branchId) {
    this.skillMatrixService.getdepartmentlistbybranchid('getdepartmentlistbybranchid/' + branchId.id).subscribe((response: any) => {
      console.log(response);
      if (response.result) {
        if (response.deptList != null && response.deptList.length > 0) {
          this.deparmentList = response.deptList;
          this.deptList = this.setArray(response.deptList, 'deptId', 'deptName');
          this.searchDet.deptList = this.setArray(response.deptList, 'deptId', 'deptName');
          this.searchDet.deptIds = [this.searchDet.deptList[0]];
        }
        else {
          this.deptList = [];
        }
      }
      else {
        this.deptList = [];
      }
    })
  }

  /* Common function for set an array for dropdown
  @Author saurabh salunke
  @Date sept 12, 2023 */

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

  /* gets Branch access list on employee
  @Author saurabh salunke
  @Date sept 12, 2023 */

  async getBranchAccessList() {
    this.isLoading = true;
    try {
      const res: any = await this.skillMatrixService.getBranchAccessList('getBranchAccessSetupByEmpId/' + this.userDet.organization.orgId + "/" + this.userDet.empId).toPromise();
      if (res.result) {
        if (res.branchAccessList != null && res.branchAccessList.length > 0) {
          this.branchAccessList = this.setArray(res.branchAccessList, 'branchId', 'branchName');
          this.branchAccessList = this.sortFunction(this.branchAccessList, 'name');
          this.selectedBranch.branched = [this.branchAccessList[0]];
        } else {
          this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
        }
      } else {
        this.branchAccessList = [{ id: this.userDet.branch.branchId, name: this.userDet.branch.name }];
      }
      this.searchDet.branchId = [this.branchAccessList[0]];
      // this.getDeptList(this.searchDet.branchId[0]);
      this.getLineNameList(this.searchDet.branchId[0])
    } catch (error) {
      console.error(error);
      // Handle error here, e.g., show an error message to the user
    } finally {
      // Hide loading indicator regardless of success or error
      this.isLoading = false;
    }
  }

  /* featch graph data
  @Author saurabh salunke
  @Date sept 23, 2023 */

  fetchGraphData(selectedOption: any): void {

    this.submitLoader = true;
    this.graphDetails = [];
    const apiEndpoints = {
      Organization: 'apis/sm/getOrgLvlAnalytics',
      Plant: 'apis/sm/getBranchLvlAnalytics',
      Cell: 'apis/sm/getDeptLvlAnalytics',
    };

    const apiUrl = apiEndpoints[selectedOption.name];
    const data: any = {
    };
    if (selectedOption.name !== 'Cell') {
      data.orgId = this.userDet.organization.orgId;
    }
    if (selectedOption.name !== 'Organization') {
      if (this.searchDet.branchId != null && this.searchDet.branchId.length > 0) {
        for (let i = 0; i < this.searchDet.branchId.length; i++) {
          data.branchId = this.searchDet.branchId[0].id;
        }
      }
    }
    if (selectedOption.name !== 'Organization' && selectedOption.name !== 'Plant') {
      if (this.getIDsArray(this.searchDet.lineIds) != null && this.getIDsArray(this.searchDet.lineIds).length > 0) {
        for (let i = 0; i < this.getIDsArray(this.searchDet.lineIds).length; i++) {
          data.lineIds = this.getIDsArray(this.searchDet.lineIds);
        }
      }
    }

    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    });

    this.skillMatrixService.getLevelAnalytics(apiUrl, data).subscribe((res: any) => {
      this.submitLoader = false;
      if (res.result) {
        this.hasDataToShow = false;
        // console.log('API Response:', res);
        this.orgLevelGraph = res.data.orgLvlSkilling;
        this.branchLevelGraph = res.data.branchSMLevelGraph;
        this.deptLevelGraph = res.data.deptSMLevelGraph;
        let chartContainerId: string;
        if (selectedOption.name === 'Organization') {
          chartContainerId = 'org-chart-container';
        } else if (selectedOption.name === 'Plant') {
          chartContainerId = 'branch-chart-container';
        } else if (selectedOption.name === 'Cell') {
          chartContainerId = 'dept-chart-container';
        }

        const chartContainer = document.getElementById(chartContainerId);
        //BRANCHLEVEL GRAPH STARTS HERE
        if (this.branchLevelGraph && selectedOption.name === 'Plant') {
          // const uniqueDepartments = [...new Set(this.branchLevelGraph.map((item) => item.dept))];
          const deptCharts: { [key: string]: any } = {};
          const departmentNames = new Set<string>();
          this.branchLevelGraph.forEach((item) => {
            departmentNames.add(item.deptName);
          });
          const uniqueDepartments = [...departmentNames];
          uniqueDepartments.forEach((departmentName) => {
            const departmentData = this.branchLevelGraph.filter((item) => item.deptName === departmentName);
            const chartElement = document.createElement('div');
            chartElement.style.height = '400px';
            chartElement.style.width = '100%';
            chartElement.style.background = 'white';
            chartElement.style.border = '1px solid #4680ff';
            chartElement.style.padding = '10px';
            chartElement.style.textAlign = 'center';
            chartElement.style.borderRadius = '10px';
            chartElement.style.marginBottom = '5px';
            // chartElement.style.marginRight = '10px';
            chartContainer.appendChild(chartElement);
            deptCharts[departmentName] = echarts.init(chartElement);
            // const myChart = echarts.init(chartElement);
            // const labels = departmentData.map((item) => item.levelName);
            const levelOrder = ['Level 1', 'Level 2', 'Level 3'];
            const actualCounts = departmentData.map((item) => item.actualCount);
            const requiredCounts = departmentData.map((item) => item.requiredCount);

            let branchLevelId = 1;
            const option = {
              title: {
                text: departmentName,
                left: 'center',
                textStyle: {
                  color: 'rgb(14, 66, 115)',
                },
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  crossStyle: {
                    color: '#999',
                  },
                },
              },
              legend: {
                data: ['Actual Count', 'Required Count'],
                bottom: 10,
              },
              xAxis: [
                {
                  type: 'category',
                  data: levelOrder,
                  axisPointer: {
                    type: 'shadow',
                  },
                },
              ],
              yAxis: [
                {
                  type: 'value',
                  name: 'Actual Count',
                  axisLabel: {
                    formatter: '{value}',
                  },
                },
              ],
              series: [
                {
                  name: 'Actual Count',
                  type: 'bar',
                  data: actualCounts,
                  label: {
                    show: true,
                    position: 'top',
                  },
                  itemStyle: {
                    color: 'blue', // Blue color for actual counts
                  },
                },
                {
                  name: 'Required Count',
                  type: 'line',
                  data: requiredCounts,
                  label: {
                    show: true,
                    position: 'top',
                  },
                  yAxisIndex: 0,
                  itemStyle: {
                    color: 'green', // Green color for required counts
                  },
                },
              ],
            };
            // Set the chart options and render the chart
            deptCharts[departmentName].setOption(option);

            // Store the chart in the departmentCharts array
            // departmentCharts.push(deptCharts);
            this.graphDetails.push({
              name: departmentName,
              GraphName: 'Plant Level',
              id: 'branch-chart-container',
              type: 'Branch',
              chartElement: chartElement,
              chart: deptCharts[departmentName],
              data: departmentData,
            });
          });
        }
        //BRANCHLEVEL GRAPH ENDS HERE

        //ORGANIZTION GRAPH STARTS HERE
        if (this.orgLevelGraph && selectedOption.name === 'Organization') {
          const branchCharts: { [key: string]: any } = {};
          const branchNames = new Set<string>();
          this.orgLevelGraph.forEach((item) => {
            branchNames.add(item.branch);
          });
          let graphIdCounter = 0;
          const allBranchNames = [...branchNames];
          allBranchNames.forEach((branchName) => {
            const branchData = this.orgLevelGraph.filter((item) => item.branch === branchName);
            const chartElement = document.createElement('div');
            chartElement.style.height = '400px';
            chartElement.style.width = '100%';
            chartElement.style.background = 'white';
            chartElement.style.border = '1px solid #4680ff';
            chartElement.style.padding = '10px';
            chartElement.style.textAlign = 'center';
            chartElement.style.borderRadius = '10px';
            chartElement.style.marginBottom = '5px';
            chartContainer.appendChild(chartElement);
            const actualCounts = branchData.map((item) => item.actualCount);
            const requiredCounts = branchData.map((item) => item.requiredCount);
            branchCharts[branchName] = echarts.init(chartElement);
            const levelOrder = ['Level 1', 'Level 2', 'Level 3'];
            let orgLevelId = 2;
            const seriesData = [
              {
                name: 'Actual Count',
                type: 'bar',
                data: branchData.map((item) => item.actualCount),
              },
              {
                name: 'Required Count',
                type: 'line',
                data: branchData.map((item) => item.requiredCount),
              },
            ];

            const option = {
              title: {
                text: branchName,
                left: 'center',
                textStyle: {
                  color: 'rgb(14, 66, 115)',
                },
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow',
                },
              },
              legend: {
                data: ['Actual Count', 'Required Count'],
                bottom: 10,
              },
              xAxis: {
                type: 'category',
                data: levelOrder, // Use level names on the x-axis
              },
              yAxis: {
                type: 'value',
                name: 'Actual Count',
              },
              series: seriesData,
            };

            branchCharts[branchName].setOption(option);

            this.graphDetails.push({
              name: branchName,
              GraphName: 'Organization Level',
              id: 'org-chart-container',
              type: 'Organization',
              chartElement: chartElement,
              chart: branchCharts[branchName],
              data: branchData,
            });
          });
        }
        //ORGANIZATIN GRAPH ENDS HERE

        //DEPARTMENT GRAPH STARTS HERE
        if (this.deptLevelGraph && selectedOption.name === 'Cell') {
          const departmentCharts: { [key: string]: any } = {};
          const departmentNames = new Set<string>();
          this.deptLevelGraph.forEach((item) => {
            departmentNames.add(item.workstationName);
          });
          const allDepartmentNames = [...departmentNames];
          allDepartmentNames.forEach((workstationName) => {
            const departmentData = this.deptLevelGraph.filter((item) => item.workstationName === workstationName);
            // console.log(departmentData)
            const chartElement = document.createElement('div');
            chartElement.style.height = '400px';
            chartElement.style.width = '100%';
            chartElement.style.background = 'white';
            chartElement.style.border = '1px solid #4680ff';
            chartElement.style.padding = '10px';
            chartElement.style.textAlign = 'center';
            chartElement.style.borderRadius = '10px';
            chartElement.style.marginBottom = '5px';
            chartContainer.appendChild(chartElement);
            // const actualCounts = departmentData.map((item) => item.actualCount);
            // const requiredCounts = departmentData.map((item) => item.requiredCount);
            departmentCharts[workstationName] = echarts.init(chartElement);
            let departmentLevelId = 3;
            const seriesData = [
              {
                name: 'Actual Count',
                type: 'bar',
                data: departmentData.map((item) => item.actualCount),
              },
              {
                name: 'Required Count',
                type: 'line',
                data: departmentData.map((item) => item.requiredCount),
              },
            ];

            const option = {
              title: {
                text: workstationName,
                left: 'center',
                textStyle: {
                  color: 'rgb(14, 66, 115)',
                },
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow',
                },
              },
              legend: {
                data: ['Actual Count', 'Required Count'],
                bottom: 10,
              },
              xAxis: {
                type: 'category',
                data: departmentData.map((item) => `M/c ${item.workstationId}`),
              },
              yAxis: {
                type: 'value',
                name: 'Actual Count',
              },
              series: seriesData,
            };

            departmentCharts[workstationName].setOption(option);

            this.graphDetails.push({
              name: workstationName,
              id: 'dept-chart-container',
              GraphName: 'Cell/Line Level',
              type: 'Cell',
              chartElement: chartElement,
              chart: departmentCharts[workstationName],
              data: departmentData, // You can add other details as needed
            });
          });
        }
        //DEPARTMENT GRAPH ENDS HERE
      } else {
        this.hasDataToShow = true;
      }
      window.addEventListener('resize', () => {
        this.graphDetails.forEach((graphDetail) => {
          if (graphDetail.chart) {
            graphDetail.chart.resize();
          }
        });
      });
    }, (error: any) => {
      this.submitLoader = false;
      this.branchLevelGraph = [];
    })
  }

  /* Filter function for plant and cell
  Author: Saurabh salunke
  Date: 25 Aug 2023 */

  submitData() {
    this.isSubmitted = true;
    this.selectedData = this.searchDet.option;
    if (!this.selectedData || this.selectedData.length === 0) {
      this.showDropdownError = true;
      return;
    }
    if (!this.searchDet.branchId || this.searchDet.branchId.length === 0) {
      this.showPlantError = true;
      return;
    }
    if ((!this.searchDet.lineIds || this.searchDet.lineIds.length === 0) && this.optionValue.name == 'Cell') {
      this.showCellError = true;
      return;
    }
    if (this.showDropdownError || this.showPlantError || this.showCellError) {
      return;
    }
  
    this.fetchGraphData(this.selectedData[0])
    this.modalService.dismissAll();

  }

  /* Common function For get Ids from array
  @Author Saurabh salunke
  @Date sept 1, 2023 */

  getIDsArray(array) {
    let tmp: any = [];
    if (array != null && array.length > 0) {
      for (const element of array) {
        tmp.push(element.id);
      }
    }
    return tmp;
  }

  /* Close filter modal popup
  @Author  Saurabh salunke
  @Date sept 1, 2023 */

  closeFilterPopup() {
    this.filterData.reset();
    this.modalService.dismissAll();
  }

  /* Single Select Dropdown onChange function
  @Author  Saurabh salunke
  @Date sept 1, 2023 */

  onChange(ev: any, type) {
    if (ev) {
      if (type == 'level') {
        this.getBranchAccessList();
        this.optionValue = this.searchDet.option[0];
        this.showDropdownError = false;
        this.showPlantError = false;
        this.showCellError = false;
      }
      else if (type == 'plant') {
        // this.getDeptList(ev);
        this.getLineNameList(ev);
        this.searchDet.deptIds = [];
        this.showCellError = false;
        this.showPlantError = false;
      } else if (type == 'Cell') {
        this.showCellError = false;
      }
    } else {
      if (type == 'plant') {
        this.showPlantError = true;
        this.showCellError = true;
        this.searchDet.lineIds=[];
        this.dataList=[];
        this.graphDetails=[];
        this.fetchGraphData('');
        this.hasDataToShow=true;
      } else if (type == 'Cell' && (!this.searchDet.lineIds || this.searchDet.lineIds.length === 0) ) {
        this.showCellError = true;
        // this.graphDetails=[];
        // this.fetchGraphData('');
        this.hasDataToShow=true;
      } else if (type == 'level') {
        this.showDropdownError = true;
        this.graphDetails=[];
        this.fetchGraphData('');
        this.hasDataToShow=true;
      }
    }
  }

  /* Dashboard - To get Cell/Line list in dropdown at Plant level
  @Author  Sanket Boramanikar
  @Date Oct 5, 2023 */

  getLineNameList(branchId) {
    this.selectedBranchId = branchId.id;
    const data = {
      "branchId": this.selectedBranchId,
    }
    this.skillMatrixService.getLineNameList('apis/sm/getCellList', data).subscribe((response: any) => {
      if (response.result) {
        if (response.dataList != null && response.dataList.length > 0) {
          for (let index = 0; index < response.dataList.length; index++) {
            response.dataList[index].tmpName = '';
            if (response.dataList[index].lineName) {
              response.dataList[index].tmpName += response.dataList[index].lineName;
              if (response.dataList[index].deptName) {
                response.dataList[index].tmpName += ' (Department : ' + response.dataList[index].deptName + ')';
              }
            }
          }
          this.cellLineList = response.dataList;
          this.dataList = this.setArray(response.dataList, 'lineId', 'tmpName');
          // this.searchDet.dataList = this.setArray(response.dataList, 'lineId', 'tmpName');
          this.searchDet.dataList = this.sortFunction( this.dataList, 'lineName');
          this.searchDet.lineIds = [this.searchDet.dataList[0]];
        }
        else {
          this.dataList = [];
        }
      }
      else {
        this.dataList = [];
      }
    })
  }

  /* to hide dropdown when these values aew selected
  @Author  Saurabh salunke
  @Date sept 1, 2023 */

  shouldShowCellDropdown(): boolean {
    return this.searchDet.option && this.searchDet.option.length > 0 &&
      this.searchDet.option[0].name !== 'Organization' &&
      this.searchDet.option[0].name !== 'Plant';
  }

  /* Export functionality for graph
  @Author  Saurabh salunke
  @Date sept 28, 2023 */

  downloadPdf() {
    console.log(this.graphDetails[0].type);

    this.isDownloadingPDF = true;
    try {
      if (this.graphDetails && this.graphDetails.length > 0) {

        const pdf: any = new jsPDF('p', 'mm', 'a4');
        // pdf.internal.scaleFactor = 20;
        var i = 0;
        pdf.setTextColor(31, 160, 226);
        pdf.text(90 , 15, this.graphDetails[0].GraphName);
        this.graphDetails.forEach((chartDetails, key) => {
          if (key != 0 && key % 4 == 0) {
            i = 0;
            pdf.addPage();
          }
          const chartImageURI = chartDetails.chart.getDataURL({ pixelRatio: 1 });
          pdf.addImage(chartImageURI, 'JPEG', 20, 30 + i, 180, 49, '', 'FAST');
          i = i + 50;
        });
        const GraphName= 'Sm_'+this.graphDetails[0].type+'.pdf';
        pdf.save(GraphName);
        this.isDownloadingPDF = false;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      this.isDownloadingPDF = false;
    }
  }


  getSortFunction(array, fieldToSort) {  
    if (array && Array.isArray(array) && array.length > 0) {
      if (fieldToSort === "plant" || fieldToSort === "dept" || fieldToSort === "level" || fieldToSort === "cell") {
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

  /* TO hide scroll
  @Author  Saurabh salunke
  @Date 20 oct, 2023 */
  isGraphDetailsEmpty(): boolean {
    return !this.graphDetails || this.graphDetails.length === 0;
  }
}