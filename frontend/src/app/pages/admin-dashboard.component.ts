import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header-section">
        <h1>Admin Dashboard - Application Verification</h1>
        <button (click)="logout()" class="btn-secondary">Logout</button>
      </div>

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

      <div class="applications-section">
        <h2>Applications Checklist</h2>

        <div class="filter-section">
          <input
            type="text"
            placeholder="Search applicant name or email..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterApplications()"
            class="search-input"
          />

          <select [(ngModel)]="statusFilter" (ngModelChange)="filterApplications()" class="filter-select">
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Interview Required">Interview Required</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div class="table-responsive" *ngIf="filteredApplications.length > 0">
          <table class="applications-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of filteredApplications" [class.status-submitted]="app.status === 'Submitted'">
                <td>{{ app.personalParticulars.firstName }} {{ app.personalParticulars.lastName }}</td>
                <td>{{ app.personalParticulars.email }}</td>
                <td>{{ app.chosenGrade }}</td>
                <td>
                  <span class="status-badge" [ngClass]="'status-' + app.status.toLowerCase().replace(' ', '-')">
                    {{ app.status }}
                  </span>
                </td>
                <td>{{ app.createdAt | date: 'short' }}</td>
                <td>
                  <button (click)="openApplicationDetails(app._id)" class="btn-view">View Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="no-results" *ngIf="filteredApplications.length === 0">
          <p>No applications found matching your criteria.</p>
        </div>
      </div>

      <!-- Application Details Modal -->
      <div class="modal" *ngIf="selectedApplication">
        <div class="modal-content">
          <button (click)="closeModal()" class="close-btn">×</button>

          <h2>Application Details</h2>

          <div class="details-section">
            <h3>Personal Information</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span>{{ selectedApplication.personalParticulars.firstName }} {{ selectedApplication.personalParticulars.lastName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span>{{ selectedApplication.personalParticulars.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span>{{ selectedApplication.personalParticulars.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">National ID:</span>
              <span>{{ selectedApplication.personalParticulars.nationalId }}</span>
            </div>
          </div>

          <div class="details-section">
            <h3>Application Information</h3>
            <div class="detail-row">
              <span class="label">Grade:</span>
              <span>{{ selectedApplication.chosenGrade }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Specialist Division:</span>
              <span>{{ selectedApplication.chosenSpecialistDivision }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Application Fee:</span>
              <span>${{ selectedApplication.applicationFee }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Current Status:</span>
              <span class="status-badge" [ngClass]="'status-' + selectedApplication.status.toLowerCase().replace(' ', '-')">
                {{ selectedApplication.status }}
              </span>
            </div>
          </div>

          <div class="checklist-section">
            <h3>Document Verification Checklist</h3>
            <div class="checklist-item">
              <input type="checkbox" id="photo" />
              <label for="photo">Photo Provided</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="signature" />
              <label for="signature">Signature Provided</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="nationalId" />
              <label for="nationalId">National ID Copy</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="certificates" />
              <label for="certificates">Certified Certificates</label>
            </div>
            <div class="checklist-item" *ngIf="selectedApplication.documents?.technicalReport">
              <input type="checkbox" id="report" />
              <label for="report">Technical Report</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="organogram" />
              <label for="organogram">Organogram (if required)</label>
            </div>
          </div>

          <div class="sponsor-section">
            <h3>Sponsor Appraisals</h3>
            <div *ngFor="let sponsor of selectedApplication.sponsors" class="sponsor-info">
              <p><strong>{{ sponsor.name }}</strong> ({{ sponsor.email }})</p>
              <p *ngIf="sponsor.appraisalResponse">
                <span class="badge-confidential">Confidential Response Received</span>
              </p>
              <p *ngIf="!sponsor.appraisalResponse" class="pending">Pending Response</p>
            </div>
          </div>

          <div class="action-section">
            <label for="statusUpdate">Update Application Status:</label>
            <select [(ngModel)]="selectedStatus" class="form-input">
              <option value="">Select Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Interview Required">Interview Required</option>
              <option value="Rejected">Rejected</option>
            </select>

            <textarea
              [(ngModel)]="adminNotes"
              placeholder="Admin notes for this application..."
              class="form-input notes"
            ></textarea>

            <div class="modal-buttons">
              <button (click)="updateApplicationStatus()" class="btn-primary">Update Status</button>
              <button (click)="closeModal()" class="btn-secondary">Close</button>
            </div>
          </div>

          <div class="success-message" *ngIf="updateSuccess">Status updated successfully!</div>
          <div class="error-message" *ngIf="updateError">{{ updateError }}</div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="selectedApplication" (click)="closeModal()"></div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 100px auto 40px;
      padding: 20px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;

      h1 {
        color: #004A59;
        font-weight: 700;
        margin: 0;
      }
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      border: 2.5px solid #004A59;
      padding: 20px;
      border-radius: 8px;
      text-align: center;

      h3 {
        color: #004A59;
        margin: 0 0 10px 0;
        font-size: 14px;
      }

      .stat-value {
        color: #B99532;
        font-size: 32px;
        font-weight: 700;
        margin: 0;
      }
    }

    .applications-section {
      h2 {
        color: #004A59;
        margin-bottom: 20px;
      }
    }

    .filter-section {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;

      input, select {
        border: 2.5px solid #004A59;
        padding: 10px;
        border-radius: 4px;
      }

      .search-input {
        flex: 1;

        &:focus {
          outline: none;
          border-color: #B99532;
        }
      }

      .filter-select {
        &:focus {
          outline: none;
          border-color: #B99532;
        }
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .applications-table {
      width: 100%;
      border-collapse: collapse;
      border: 2.5px solid #004A59;

      th {
        background-color: #004A59;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: 600;
      }

      td {
        padding: 12px;
        border-bottom: 1px solid #ddd;
      }

      tr:hover {
        background-color: #f5f5f5;
      }

      tr.status-submitted {
        background-color: #f0f7ff;
      }
    }

    .status-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;

      &.status-submitted {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      &.status-under-review {
        background-color: #fff3e0;
        color: #f57c00;
      }

      &.status-approved {
        background-color: #e8f5e9;
        color: #388e3c;
      }

      &.status-pending {
        background-color: #f3e5f5;
        color: #7b1fa2;
      }

      &.status-interview-required {
        background-color: #fff9c4;
        color: #f57f17;
      }

      &.status-rejected {
        background-color: #ffebee;
        color: #c62828;
      }
    }

    .btn-view {
      background-color: #B99532;
      color: white;
      border: 2.5px solid #B99532;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;

      &:hover {
        background-color: darken(#B99532, 10%);
      }
    }

    .btn-secondary {
      background-color: #FFFFFF;
      color: #004A59;
      border: 2.5px solid #004A59;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .btn-primary {
      background-color: #004A59;
      color: white;
      border: 2.5px solid #004A59;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;

      &:hover {
        background-color: darken(#004A59, 10%);
      }
    }

    .no-results {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      border: 2.5px solid #004A59;
      border-radius: 8px;
      max-width: 700px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 30px;
      z-index: 1001;

      .close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #004A59;
      }

      h2 {
        color: #004A59;
        margin-bottom: 20px;
      }
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }

    .details-section {
      border: 2.5px solid #004A59;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;

      h3 {
        color: #004A59;
        margin: 0 0 10px 0;
      }
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        color: #004A59;
      }
    }

    .checklist-section {
      border: 2.5px solid #004A59;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;

      h3 {
        color: #004A59;
        margin: 0 0 10px 0;
      }

      .checklist-item {
        display: flex;
        align-items: center;
        padding: 8px 0;

        input {
          margin-right: 10px;
          width: 18px;
          height: 18px;
          cursor: pointer;
          border: 2.5px solid #004A59;
        }

        label {
          cursor: pointer;
          margin: 0;
        }
      }
    }

    .sponsor-section {
      border: 2.5px solid #B99532;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
      background-color: #fafaf5;

      h3 {
        color: #004A59;
        margin: 0 0 10px 0;
      }

      .sponsor-info {
        padding: 8px 0;
        border-bottom: 1px solid #e0e0e0;

        &:last-child {
          border-bottom: none;
        }

        p {
          margin: 3px 0;
        }

        .badge-confidential {
          display: inline-block;
          background-color: #e8f5e9;
          color: #388e3c;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .pending {
          color: #f57c00;
          font-weight: 600;
        }
      }
    }

    .action-section {
      border: 2.5px solid #004A59;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;

      label {
        display: block;
        font-weight: 600;
        color: #004A59;
        margin-bottom: 8px;
      }

      .form-input {
        width: 100%;
        padding: 10px;
        border: 2.5px solid #004A59;
        border-radius: 4px;
        margin-bottom: 15px;
        font-size: 14px;

        &:focus {
          outline: none;
          border-color: #B99532;
        }

        &.notes {
          min-height: 80px;
          resize: vertical;
        }
      }
    }

    .modal-buttons {
      display: flex;
      gap: 10px;
    }

    .error-message, .success-message {
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .error-message {
      background-color: #ffebee;
      color: #d32f2f;
      border: 1px solid #d32f2f;
    }

    .success-message {
      background-color: #e8f5e9;
      color: #388e3c;
      border: 1px solid #388e3c;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  selectedApplication: any = null;
  selectedStatus = '';
  adminNotes = '';
  searchTerm = '';
  statusFilter = '';
  updateSuccess = false;
  updateError = '';

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
        this.filteredApplications = applications;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
      },
    });
  }

  filterApplications(): void {
    this.filteredApplications = this.applications.filter((app) => {
      const nameMatch =
        `${app.personalParticulars.firstName} ${app.personalParticulars.lastName}`
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        app.personalParticulars.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const statusMatch = !this.statusFilter || app.status === this.statusFilter;

      return nameMatch && statusMatch;
    });
  }

  getStatusCount(status: string): number {
    return this.applications.filter((app) => app.status === status).length;
  }

  openApplicationDetails(appId: string): void {
    this.selectedApplication = this.applications.find((app) => app._id === appId);
    this.selectedStatus = this.selectedApplication?.status || '';
    this.adminNotes = '';
    this.updateSuccess = false;
    this.updateError = '';
  }

  closeModal(): void {
    this.selectedApplication = null;
  }

  updateApplicationStatus(): void {
    if (!this.selectedStatus) {
      this.updateError = 'Please select a status';
      return;
    }

    this.applicationService.updateApplicationStatus(this.selectedApplication._id, this.selectedStatus).subscribe({
      next: (response) => {
        // Update local application
        const appIndex = this.applications.findIndex((app) => app._id === this.selectedApplication._id);
        if (appIndex !== -1) {
          this.applications[appIndex].status = this.selectedStatus;
          this.filteredApplications = [...this.applications];
        }

        this.updateSuccess = true;
        this.updateError = '';

        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (error) => {
        this.updateError = error.error?.message || 'Failed to update status';
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
