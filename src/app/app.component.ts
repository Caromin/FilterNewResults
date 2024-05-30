import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from './models/data';

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

  public filteredResult: object[] = [];


  // Example 
  //   {
  //     "score": 0.0,
  //     "resultItem": {
  //         "class": "paris.web.app.RequisitionMeta",
  //         "id": 525585,
  //         "number": "5126632",
  //         "title": "Governance Executive Lead",
  //         "projectName": "Assessment",
  //         "client": "BATH & BODY WORKS INC",
  //         "status": "Open - Need Project Feedback",
  //         "locationPath": "Midwest > USA > Midwest > Columbus",
  //         "locationRadius": "In Country",
  //         "workLocation": "Columbus",
  //         "primaryContact": "Schenk,Luke",
  //         "billable": "Chargeable - Unsold",
  //         "owningOrg": "LLP",
  //         "fromLevel": 4,
  //         "toLevel": 4,
  //         "startDate": "2025-02-03",
  //         "createDate": "2024-01-22",
  //         "roleDTE": "LLP",
  //         "roleClearance": "Clearance Not Applicable",
  //         "locationType": "Remote",
  //         "acceptingResumes": "N",
  //         "percentOnsite": 0
  //     }
  // }

  constructor(private http: HttpClient) { }

  generateCsv() {
    this.http.get<any>(this.jsonResults).subscribe(results => {
      const data: Data[] = results.data
      const targetLevels = [this.roleLevel + 1, this.roleLevel - 1];

      for(const element of data) {
        if (this.projectStatus == null || element.status?.includes(this.projectStatus)) {
          console.log(element);
          if (this.billable == null || element.billable?.includes(this.billable)) {
            if (this.owningOrg == null || element.owningOrg?.includes(this.owningOrg)) {
              if (this.roleLevel == null || element.fromLevel == this.roleLevel || element.toLevel == this.roleLevel || targetLevels.includes(element.fromLevel) || targetLevels.includes(element.toLevel)) {
                if (this.startDate == null || element.startDate?.includes(this.startDate)) {
                  if (this.llpOrAfs == null || element.roleDTE?.includes(this.llpOrAfs)) {
                    if (this.roleClearance == null || element.roleClearance?.includes(this.roleClearance)) {
                      this.filteredResult.push(element);
                    }
                  }
                }
              }
            }
          }
        }
      }
    })  
  }
}
