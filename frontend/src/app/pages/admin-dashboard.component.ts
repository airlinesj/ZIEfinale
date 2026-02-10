import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
              <h2>Current Applications (Latest 6)</h2>
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

          <!-- Membership Categories Analytics Card -->
          <div class="analytics-card chart-card">
            <div class="card-header">
              <h2>Membership Categories (Last 7 Days)</h2>
            </div>
            <div class="card-content">
              <div class="chart-container">
                <div class="chart-bars">
                  <div class="bar-item" *ngFor="let category of getMembershipCategoriesWeek()">
                    <div class="bar-wrapper">
                      <div class="bar-label">{{ category.grade }}</div>
                      <div class="bar-chart">
                        <div class="bar" [style.height.%]="getBarHeight(category.count)"></div>
                        <div class="bar-value">{{ category.count }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

      h1 {
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

        &:hover {
          background-color: #0066aa;
          transform: translateY(-2px);
        }
      }

      .btn-logout {
        background-color: white;
        color: #004A59;

        &:hover {
          background-color: #f0f0f0;
          transform: translateY(-2px);
        }
      }
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

      h3 {
        color: #004A59;
        margin: 0 0 10px 0;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat-value {
        color: #B99532;
        font-size: 36px;
        font-weight: 700;
        margin: 0;
      }
    }

    .analytics-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .analytics-card {
      background-color: white;
      border: 2px solid #004A59;
      border-radius: 8px;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;

      .card-header {
        background-color: #004A59;
        color: white;
        padding: 20px;
        border-bottom: 2px solid #003347;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .count-badge {
          background-color: #B99532;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 18px;
          font-weight: 700;
        }
      }

      .card-content {
        padding: 20px;
      }
    }

    .new-apps-list {
      .apps-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 15px;

        .app-item {
          background-color: #f9f9f9;
          border: 2px solid #B99532;
          border-radius: 6px;
          padding: 12px;
          text-align: center;

          .app-name {
            font-weight: 600;
            color: #004A59;
            font-size: 13px;
            margin-bottom: 8px;
            word-break: break-word;
          }

          .app-grade {
            color: #B99532;
            font-weight: 600;
            font-size: 12px;
            margin-bottom: 6px;
          }

          .app-date {
            color: #999;
            font-size: 11px;
          }
        }
      }

      .no-data {
        text-align: center;
        padding: 30px 20px;
        color: #999;
        font-size: 14px;
      }
    }

    .chart-card {
      .card-content {
        padding: 25px;
      }
    }

    .chart-container {
      height: 100%;
      display: flex;
      align-items: flex-end;

      .chart-bars {
        display: flex;
        gap: 20px;
        width: 100%;
        height: 200px;
        align-items: flex-end;
        justify-content: space-around;

        .bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;

          .bar-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;

            .bar-label {
              text-align: center;
              font-weight: 600;
              color: #004A59;
              font-size: 12px;
              width: 100%;
              word-wrap: break-word;
            }

            .bar-chart {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100%;
              gap: 8px;

              .bar {
                background-color: #B99532;
                width: 50px;
                border-radius: 6px 6px 0 0;
                min-height: 20px;
                transition: all 0.3s ease;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(185, 149, 50, 0.2);

                &:hover {
                  background-color: #d4a844;
                  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 6px 16px rgba(185, 149, 50, 0.35);
                  transform: translateY(-4px);
                }
              }

              .bar-value {
                font-weight: 700;
                color: #B99532;
                font-size: 14px;
              }
            }
          }
        }
      }
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

        h1 {
          font-size: 20px;
        }

        .header-buttons {
          width: 100%;
          justify-content: center;
          gap: 10px;

          button {
            flex: 1;
          }
        }
      }

      .chart-bars {
        flex-direction: column;
        height: auto !important;
        gap: 15px;

        .bar-item {
          width: 100%;

          .bar-wrapper {
            flex-direction: row;
            justify-content: space-between;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 4px;

            .bar-label {
              flex: 1;
              text-align: left;
            }

            .bar-chart {
              flex-direction: row;
              gap: 10px;

              .bar {
                width: 80px;
                height: 30px !important;
              }
            }
          }
        }
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

  getMembershipCategoriesWeek(): any[] {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const applicationsThisWeek = this.applications.filter((app) => {
      const appDate = new Date(app.createdAt);
      return appDate >= sevenDaysAgo;
    });

    const categories: { [key: string]: number } = {};
    applicationsThisWeek.forEach((app) => {
      const grade = app.chosenGrade || 'Unknown';
      categories[grade] = (categories[grade] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => b.count - a.count);
  }

  getBarHeight(count: number): number {
    const maxCount = Math.max(
      ...this.getMembershipCategoriesWeek().map((c) => c.count),
      1
    );
    return (count / maxCount) * 100;
  }

  goToViewApplications(): void {
    this.router.navigate(['/applications-list']);
  }

  openApplicationDetails(appId: string): void {
    this.router.navigate(['/application', appId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
