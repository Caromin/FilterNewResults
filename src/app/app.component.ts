import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FilterNewResults';
  private jsonResults = 'assets/results.json';

  private projectStatus: any = null;
  private billable: any= null;
  private owningOrg: any= null;
  private roleLevel = 9;
  private startDate: any= null;
  private llpOrAfs: any= null;
  private roleClearance: any= null;
  private roleDTE = 'AFS';

  public filteredResult: object[] = [];

  constructor(private http: HttpClient) { }

  generateCsv() {
    this.http.get<any>(this.jsonResults).subscribe(json => {
      console.log(json);
      const data: any[] = json.data;
      const targetLevels = [this.roleLevel + 1, this.roleLevel - 1];

      for(const element of data) {
        if (this.projectStatus == null || element.resultItem.status?.includes(this.projectStatus)) {
          if (this.billable == null || element.resultItem.billable?.includes(this.billable)) {
            if (element.resultItem.fromLevel == this.roleLevel || element.resultItem.toLevel == this.roleLevel || targetLevels.includes(element.resultItem.fromLevel) || targetLevels.includes(element.resultItem.toLevel)) {
              if (this.startDate == null || element.resultItem.startDate?.includes(this.startDate)) {
                if (this.llpOrAfs == null || element.resultItem.roleDTE?.includes(this.llpOrAfs)) {
                  if (this.roleClearance == null || element.resultItem.roleClearance?.includes(this.roleClearance)) {
                    if (element.resultItem.roleDTE?.includes(this.roleDTE)) {
                      this.filteredResult.push(element.resultItem);
                    }
                  }
                }
              }
            }
          }
        }
      }
      this.export();
    })  
  }

  export() {
    const headerList = ['number', 'title', 'createDate', 'fromLevel', 'toLevel', 'status', 'billable', 'startDate', 'acceptingResumes', 'locationType', 'projectName', 'roleClearance'];
    const csvData = this.convertToCSV(this.filteredResult, headerList);
    this.downloadCSV(csvData, 'results.csv');
  }

  convertToCSV(objArray: any[], headerList: string[]): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';

    for (const header of headerList) {
      row += header + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = (i + 1) + '';
      for (const header of headerList) {
        let value = array[i][header] !== undefined ? array[i][header] : '';
        value = this.escapeCSVValue(value);
        line += ',' + value;
      }
      str += line + '\r\n';
    }
    return str;
  }

  downloadCSV(csvData: string, filename: string) {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    value = value.toString();
    if (value.includes(',') || value.includes('\n')) {
      value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes by doubling them
    }
    return value;
  }
}
