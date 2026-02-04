import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SponsorAppraisal {
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  question5: string;
  question6: string;
  question7: string;
  question8: string;
}

@Injectable({
  providedIn: 'root',
})
export class SponsorService {
  private apiUrl = 'http://localhost:5000/api/sponsors';

  constructor(private http: HttpClient) {}

  getSponsorAppraisal(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${token}`);
  }

  submitAppraisal(token: string, appraisal: SponsorAppraisal): Observable<any> {
    return this.http.post(`${this.apiUrl}/${token}/submit`, appraisal);
  }
}
