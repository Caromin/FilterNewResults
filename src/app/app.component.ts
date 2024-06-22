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

  public statuses = ["Open - In Process", "Open - New", "Open - Need Project Feedback", "Open - Confirming Candidate"];
  public billables = ["Chargeable - Sold", "Chargeable - Unsold", "Not Chargeable - Sold", "Not Chargeable - Unsold"];
  public orgs = ["AFS", "LLP"];
  public levels = [12, 11, 10, 9, 8, 7, 6, 5];
  public clearances = ["Clearance Not Applicable", "Public Trust", "Secret", "Top Secret", "TS/SCI","TS/SCI/CI", "TS/SCI/FS", "Unknown"];

  protected projectStatus: any = null;
  protected billable: any= null;
  protected roleDTE: any= null;
  protected roleLevel = 9;
  protected roleClearance: any= null;

  public filteredResult: object[] = [];

  constructor(private http: HttpClient) { }

  generateCsv() {
    this.filteredResult = [];

    this.http.get<any>(this.jsonResults).subscribe(json => {
      const data: any[] = json.data;
      let targetLevels: any = null;
      if (this.roleLevel) {
        targetLevels = [this.roleLevel + 1, this.roleLevel - 1];
      }

      for(const element of data) {
        if (this.projectStatus == null || element.resultItem.status?.includes(this.projectStatus)) {
          if (this.billable == null || element.resultItem.billable?.includes(this.billable)) {
            if (targetLevels == null || element.resultItem.fromLevel == this.roleLevel || element.resultItem.toLevel == this.roleLevel || targetLevels.includes(element.resultItem.fromLevel) || targetLevels.includes(element.resultItem.toLevel)) {
              if (this.roleClearance == null || element.resultItem.roleClearance?.includes(this.roleClearance)) {
                if (element.resultItem.roleDTE?.includes(this.roleDTE)) {
                  this.filteredResult.push(element.resultItem);
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
