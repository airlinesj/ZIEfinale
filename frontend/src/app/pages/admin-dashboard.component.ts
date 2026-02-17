import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { AuthService } from '../services/auth.service';
import { ApplicationStatsComponent, MembershipGradeStats } from '../components/application-stats.component';
import { RefereeResponsesComponent } from '../components/referee-responses.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ApplicationStatsComponent, RefereeResponsesComponent],
  template: `
    <div class="dashboard-wrapper">
      <div class="header-section">
        <h1>Admin Dashboard</h1>
        <div class="header-buttons">
          <a routerLink="/applications-list" class="btn-view-details">
            <span class="material-symbols-outlined">description</span>
            View Details
          </a>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="stats-section">
          <div class="stat-card">
            <h3>Total Applications</h3>
            <p class="stat-value">{{ applications.length }}</p>
          </div>
          <div class="stat-card">
            <h3>Submitted</h3>
            <p class="stat-value">{{ getStatusCount('Submitted') }}</p>
          </div>
          <div class="stat-card">
            <h3>Under Review</h3>
            <p class="stat-value">{{ getStatusCount('Under Review') }}</p>
          </div>
          <div class="stat-card">
            <h3>Approved</h3>
            <p class="stat-value">{{ getStatusCount('Approved') }}</p>
          </div>
        </div>

        <div class="analytics-section">
          <!-- Current Applications Card -->
          <div class="analytics-card">
            <div class="card-header">
              <h2>Latest Applicants</h2>
              <span class="count-badge">{{ getNewApplicationsCount() }}</span>
            </div>
            <div class="card-content">
              <div class="new-apps-list">
                <div *ngIf="getNewApplications().length > 0" class="apps-grid">
                  <div *ngFor="let app of getNewApplications()" class="app-item">
                    <div class="app-name">{{ app.personalParticulars.firstName }} {{ app.personalParticulars.lastName }}</div>
                    <div class="app-grade">{{ app.chosenGrade }}</div>
                    <div class="app-date">{{ app.createdAt | date: 'short' }}</div>
                  </div>
                </div>
                <div *ngIf="getNewApplications().length === 0" class="no-data">
                  <p>No applications available</p>
                </div>
              </div>
            </div>
          </div>


        </div>

        <!-- Application Stats by Membership Grade -->
        <div class="stats-by-grade-section">
          <app-application-stats [membershipGrades]="getApplicationStatsByGrade()"></app-application-stats>
        </div>

        <!-- Referee Responses Section -->
        <app-referee-responses></app-referee-responses>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      min-height: 100vh;
      background-color: #f5f5f5;
      padding-bottom: 40px;
    }

    .header-section {
      background-color: #004A59;
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-section h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }

    .header-buttons {
      display: flex;
      gap: 15px;
    }

    .btn-view-details,
    .btn-logout {
      border: 2px solid white;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-view-details {
      background-color: #0088cc;
      color: white;
    }

    .btn-view-details:hover {
      background-color: #0066aa;
      transform: translateY(-2px);
    }

    .btn-logout {
      background-color: white;
      color: #004A59;
    }

    .btn-logout:hover {
      background-color: #f0f0f0;
      transform: translateY(-2px);
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background-color: white;
      border: 2px solid #004A59;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-card h3 {
      color: #004A59;
      margin: 0 0 10px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-card .stat-value {
      color: #B99532;
      font-size: 36px;
      font-weight: 700;
      margin: 0;
    }

    .analytics-section {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .analytics-card {
      background-color: white;
      border: 2px solid #004A59;
      border-radius: 8px;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .analytics-card .card-header {
      background-color: #004A59;
      color: white;
      padding: 20px;
      border-bottom: 2px solid #003347;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .analytics-card .card-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }

    .analytics-card .card-header .count-badge {
      background-color: #B99532;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 18px;
      font-weight: 700;
    }

    .analytics-card .card-content {
      padding: 20px;
    }

    .new-apps-list .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 15px;
    }

    .new-apps-list .apps-grid .app-item {
      background-color: #f9f9f9;
      border: 2px solid #B99532;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }

    .new-apps-list .apps-grid .app-item .app-name {
      font-weight: 600;
      color: #004A59;
      font-size: 13px;
      margin-bottom: 8px;
      word-break: break-word;
    }

    .new-apps-list .apps-grid .app-item .app-grade {
      color: #B99532;
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .new-apps-list .apps-grid .app-item .app-date {
      color: #999;
      font-size: 11px;
    }

    .new-apps-list .no-data {
      text-align: center;
      padding: 30px 20px;
      color: #999;
      font-size: 14px;
    }

    .no-results {
      padding: 40px 20px;
      text-align: center;
      color: #666;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .analytics-section {
        grid-template-columns: 1fr;
      }

      .header-section {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .header-section h1 {
        font-size: 20px;
      }

      .header-section .header-buttons {
        width: 100%;
        justify-content: center;
        gap: 10px;
      }

      .header-section .header-buttons button {
        flex: 1;
      }

      .stats-by-grade-section {
        margin-top: 40px;
        display: grid;
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  applications: any[] = [];

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.applicationService.getAllApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
      },
    });
  }

  getStatusCount(status: string): number {
    return this.applications.filter((app) => app.status === status).length;
  }

  getNewApplications(): any[] {
    // Sort all applications by creation date (most recent first) and limit to 6
    return this.applications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }

  getNewApplicationsCount(): number {
    return this.getNewApplications().length;
  }

  getApplicationStatsByGrade(): MembershipGradeStats[] {
    // Group all applications by membership grade and status
    const gradeStats: { [key: string]: { [key: string]: number } } = {};

    this.applications.forEach((app) => {
      const grade = app.chosenGrade || 'Unknown';
      const status = app.status || 'Submitted';

      if (!gradeStats[grade]) {
        gradeStats[grade] = {
          pending: 0,
          inReview: 0,
          approved: 0,
          rejected: 0,
        };
      }

      // Map application status to our category
      if (status === 'Submitted') {
        gradeStats[grade]['pending'] += 1;
      } else if (status === 'Under Review') {
        gradeStats[grade]['inReview'] += 1;
      } else if (status === 'Approved') {
        gradeStats[grade]['approved'] += 1;
      } else if (status === 'Rejected') {
        gradeStats[grade]['rejected'] += 1;
      }
    });

    // Convert to array format
    return Object.entries(gradeStats)
      .map(([name, counts]) => ({
        name,
        pending: counts['pending'],
        inReview: counts['inReview'],
        approved: counts['approved'],
        rejected: counts['rejected'],
      }))
      .sort((a, b) => (b.pending + b.inReview + b.approved + b.rejected) - (a.pending + a.inReview + a.approved + a.rejected));
  }


  goToViewApplications(): void {
    this.router.navigate(['/applications-list']);
  }

  openApplicationDetails(appId: string): void {
    this.router.navigate(['/application', appId]);
  }

  logout(): void {
    // Use logoutAndNavigate to properly clear browser history and navigate to landing page
    this.authService.logoutAndNavigate();
  }
}
