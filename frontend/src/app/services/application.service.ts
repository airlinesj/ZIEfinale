import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApplicationData {
  personalParticulars: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationalId: string;
    dateOfBirth: Date;
    nationality: string;
    professionalNumber?: string;
  };
  education: Array<{
    institution: string;
    qualification: string;
    year: number;
    major?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startYear: number;
    endYear: number;
    description: string;
  }>;
  chosenGrade: string;
  chosenSpecialistDivision: string;
  sponsors: Array<{
    name: string;
    email: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = 'http://localhost:5000/api/applications';

  constructor(private http: HttpClient) {}

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  submitApplication(data: ApplicationData): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  getApplications(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getApplicationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateApplicationStatus(id: string, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  getAllApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/all`, { headers: this.getHeaders() });
  }
}
