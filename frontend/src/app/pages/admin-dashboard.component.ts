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
            <h3>Uploaded Documents</h3>
            <div class="documents-section">
              <div class="document-item">
                <span class="label">National ID Copy (PDF):</span>
                <a *ngIf="selectedApplication.uploadedFiles?.nationalIdPath" 
                   [href]="'http://localhost:5000/api/uploads/' + selectedApplication.uploadedFiles.nationalIdPath"
                   target="_blank" 
                   class="document-link">
                  📄 View PDF
                </a>
                <span *ngIf="!selectedApplication.uploadedFiles?.nationalIdPath" class="no-document">Not uploaded</span>
              </div>
              <div class="document-item">
                <span class="label">Certificates (PDF):</span>
                <div *ngIf="selectedApplication.uploadedFiles?.certificatePaths && selectedApplication.uploadedFiles.certificatePaths.length > 0" class="certificate-list">
                  <a *ngFor="let certPath of selectedApplication.uploadedFiles.certificatePaths; let i = index"
                     [href]="'http://localhost:5000/api/uploads/' + certPath"
                     target="_blank" 
                     class="document-link">
                    📄 Certificate {{ i + 1 }}
                  </a>
                </div>
                <span *ngIf="!selectedApplication.uploadedFiles?.certificatePaths || selectedApplication.uploadedFiles.certificatePaths.length === 0" class="no-document">Not uploaded</span>
              </div>
              <div class="document-item">
                <span class="label">Technical Project Report (PDF):</span>
                <a *ngIf="selectedApplication.uploadedFiles?.technicalReportPath" 
                   [href]="'http://localhost:5000/api/uploads/' + selectedApplication.uploadedFiles.technicalReportPath"
                   target="_blank" 
                   class="document-link">
                  📄 View Technical Report
                </a>
                <span *ngIf="!selectedApplication.uploadedFiles?.technicalReportPath" class="no-document">Not uploaded</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h3>Automated Grading & Division</h3>
            <div class="detail-row">
              <span class="label">Suggested Grade:</span>
              <span class="suggested-value">{{ selectedApplication.suggestedGrade }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Suggested Division:</span>
              <span class="suggested-value">{{ selectedApplication.suggestedDivision }}</span>
            </div>
            <div class="detail-row">
              <span class="label">User Summary:</span>
              <span>{{ selectedApplication.userSummary }}</span>
            </div>
          </div>

          <div class="checklist-section">
            <h3>8-Point Verification Checklist (ZIE Manual Process)</h3>
            <p class="checklist-progress">Progress: {{ getChecklistProgress() }}</p>
            <div class="checklist-item">
              <input type="checkbox" id="photo" [(ngModel)]="selectedApplication.adminChecklist.photo" />
              <label for="photo">Photo - Professional photograph verified and attached</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="m1Form" [(ngModel)]="selectedApplication.adminChecklist.m1Form" />
              <label for="m1Form">M1 Form - Membership Application Form completed and signed</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="signature" [(ngModel)]="selectedApplication.adminChecklist.signature" />
              <label for="signature">Signature - Applicant signature verified on application</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="trainingReport" [(ngModel)]="selectedApplication.adminChecklist.trainingReport" />
              <label for="trainingReport">Training Report - Professional training and development report submitted</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="projectReport" [(ngModel)]="selectedApplication.adminChecklist.projectReport" />
              <label for="projectReport">Project Report - Technical project report demonstrating competence</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="organogram" [(ngModel)]="selectedApplication.adminChecklist.organogram" />
              <label for="organogram">Organogram - Organizational structure showing applicant role</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="sponsorships" [(ngModel)]="selectedApplication.adminChecklist.sponsorships" />
              <label for="sponsorships">Sponsorships - Required sponsor appraisals received and verified</label>
            </div>
            <div class="checklist-item">
              <input type="checkbox" id="certificates" [(ngModel)]="selectedApplication.adminChecklist.certificates" />
              <label for="certificates">Certificates - Educational and professional certificates verified</label>
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

          <!-- Payment Verification Section -->
          <div class="payment-verification-section" *ngIf="selectedApplication.paymentProof">
            <h3>Payment Proof Verification</h3>
            <div class="payment-info-box">
              <div class="payment-details">
                <div class="detail-row">
                  <span class="label">Application Fee:</span>
                  <span>{{ selectedApplication.applicationFee | number: '1.2-2' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Proof Uploaded:</span>
                  <span>{{ selectedApplication.paymentProof.uploadedAt | date: 'short' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="payment-status-badge" 
                        [ngClass]="'status-' + (selectedApplication.paymentProof.verificationStatus || 'pending')">
                    {{ (selectedApplication.paymentProof.verificationStatus || 'pending') | uppercase }}
                  </span>
                </div>
              </div>

              <div class="proof-file">
                <a *ngIf="selectedApplication.paymentProof.filePath"
                   [href]="'http://localhost:5000/api/uploads/' + selectedApplication.paymentProof.filePath"
                   target="_blank"
                   class="view-proof-link">
                  📎 View Payment Proof
                </a>
              </div>

              <div class="verification-controls" *ngIf="!selectedApplication.paymentProof.verificationStatus || selectedApplication.paymentProof.verificationStatus === 'pending'">
                <div class="control-group">
                  <label for="rejectionReason">Rejection Reason (if applicable):</label>
                  <textarea
                    id="rejectionReason"
                    [(ngModel)]="paymentRejectionReason"
                    placeholder="Enter reason for rejection..."
                    class="form-input notes"
                    rows="3"
                  ></textarea>
                </div>
                <div class="button-group">
                  <button (click)="verifyPayment(selectedApplication._id, true)" class="btn-approve">
                    ✓ Approve Payment
                  </button>
                  <button (click)="verifyPayment(selectedApplication._id, false)" class="btn-reject">
                    ✗ Reject Payment
                  </button>
                </div>
              </div>

              <div class="verification-confirmed" *ngIf="selectedApplication.paymentProof.verificationStatus && selectedApplication.paymentProof.verificationStatus !== 'pending'">
                <p class="verified-text">
                  <span *ngIf="selectedApplication.paymentProof.verificationStatus === 'verified'">
                    ✓ Payment verified on {{ selectedApplication.paymentProof.verifiedAt | date: 'short' }}
                  </span>
                  <span *ngIf="selectedApplication.paymentProof.verificationStatus === 'rejected'">
                    ✗ Payment rejected on {{ selectedApplication.paymentProof.verifiedAt | date: 'short' }}
                    <br *ngIf="selectedApplication.paymentProof.rejectionReason" />
                    <span *ngIf="selectedApplication.paymentProof.rejectionReason" class="rejection-reason">
                      Reason: {{ selectedApplication.paymentProof.rejectionReason }}
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div class="action-section">
            <div class="detail-row">
              <span class="label">Chosen Grade:</span>
              <span>{{ selectedApplication.chosenGrade }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Chosen Division:</span>
              <span>{{ selectedApplication.chosenSpecialistDivision }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Application Fee:</span>
              <span>{{ selectedApplication.applicationFee }}</span>
            </div>

            <label for="statusUpdate">Update Application Status:</label>
            <select [(ngModel)]="selectedStatus" class="form-input">
              <option value="">Select Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved (All checklist items must be verified)</option>
              <option value="Pending">Pending</option>
              <option value="Interview Required">Interview Required</option>
              <option value="Approved with Conditions">Approved with Conditions</option>
              <option value="Rejected">Rejected</option>
            </select>

            <textarea
              [(ngModel)]="selectedApplication.adminNotes"
              placeholder="Admin notes for this application..."
              class="form-input notes"
            ></textarea>

            <div class="modal-buttons">
              <button (click)="updateApplicationChecklist()" class="btn-primary">Save Checklist & Notes</button>
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

      .suggested-value {
        color: #B99532;
        font-weight: 600;
      }
    }

    .checklist-section {
      border: 2.5px solid #B99532;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
      background-color: #fffaf0;

      h3 {
        color: #004A59;
        margin: 0 0 10px 0;
      }

      .checklist-progress {
        font-weight: 600;
        color: #B99532;
        margin: 0 0 15px 0;
      }

      .checklist-item {
        display: flex;
        align-items: flex-start;
        padding: 10px 0;

        input {
          margin-right: 12px;
          margin-top: 2px;
          width: 20px;
          height: 20px;
          cursor: pointer;
          border: 2.5px solid #B99532;
          accent-color: #B99532;
        }

        label {
          cursor: pointer;
          margin: 0;
          line-height: 1.4;
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

    .documents-section {
      margin: 15px 0;
      padding: 15px;
      background-color: #f9f9f9;
      border-left: 4px solid #B99532;
      border-radius: 4px;

      .document-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 10px;
        background-color: white;
        border-radius: 4px;
        border: 1px solid #e0e0e0;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 600;
          color: #004A59;
          flex: 1;
        }
      }

      .certificate-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .document-link {
        background-color: #004A59;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.3s ease;
        display: inline-block;

        &:hover {
          background-color: #B99532;
          text-decoration: none;
        }
      }

      .no-document {
        color: #999;
        font-style: italic;
        font-size: 13px;
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

    /* Payment Verification Section */
    .payment-verification-section {
      border: 2.5px solid #B99532;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
      background-color: #fffaf0;

      h3 {
        color: #004A59;
        margin: 0 0 15px 0;
      }
    }

    .payment-info-box {
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 15px;
    }

    .payment-details {
      margin-bottom: 15px;

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
    }

    .payment-status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;

      &.status-pending {
        background-color: #fff3e0;
        color: #e65100;
      }

      &.status-verified {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      &.status-rejected {
        background-color: #ffebee;
        color: #c62828;
      }
    }

    .proof-file {
      margin-bottom: 15px;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;

      .view-proof-link {
        background-color: #004A59;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.3s ease;
        display: inline-block;

        &:hover {
          background-color: #B99532;
          text-decoration: none;
        }
      }
    }

    .verification-controls {
      border-top: 1px solid #e0e0e0;
      padding-top: 15px;

      .control-group {
        margin-bottom: 15px;

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
          font-size: 13px;

          &:focus {
            outline: none;
            border-color: #B99532;
          }

          &.notes {
            resize: vertical;
            min-height: 60px;
          }
        }
      }

      .button-group {
        display: flex;
        gap: 10px;
      }
    }

    .btn-approve {
      background-color: #4caf50;
      color: white;
      border: 2.5px solid #4caf50;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      flex: 1;

      &:hover {
        background-color: darken(#4caf50, 10%);
      }
    }

    .btn-reject {
      background-color: #f44336;
      color: white;
      border: 2.5px solid #f44336;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      flex: 1;

      &:hover {
        background-color: darken(#f44336, 10%);
      }
    }

    .verification-confirmed {
      border-top: 1px solid #e0e0e0;
      padding-top: 15px;

      .verified-text {
        margin: 0;
        font-weight: 600;
        padding: 10px;
        border-radius: 4px;

        &.verified-text {
          color: #2e7d32;
          background-color: #e8f5e9;
          border: 1px solid #4caf50;
        }
      }

      .rejection-reason {
        display: block;
        color: #c62828;
        font-size: 13px;
        font-weight: normal;
        margin-top: 8px;
        padding: 8px;
        background-color: #ffebee;
        border-radius: 4px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  selectedApplication: any = null;
  selectedStatus = '';
  searchTerm = '';
  statusFilter = '';
  updateSuccess = false;
  updateError = '';
  paymentRejectionReason = '';

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
    this.updateSuccess = false;
    this.updateError = '';
  }

  closeModal(): void {
    this.selectedApplication = null;
  }

  getChecklistProgress(): string {
    if (!this.selectedApplication) return '0/8';
    const checklist = this.selectedApplication.adminChecklist;
    const checked = Object.values(checklist).filter((v: any) => v === true).length;
    const total = Object.keys(checklist).length;
    return `${checked}/${total}`;
  }

  updateApplicationChecklist(): void {
    if (!this.selectedApplication) return;

    const checklistData = {
      photo: this.selectedApplication.adminChecklist.photo,
      m1Form: this.selectedApplication.adminChecklist.m1Form,
      signature: this.selectedApplication.adminChecklist.signature,
      trainingReport: this.selectedApplication.adminChecklist.trainingReport,
      projectReport: this.selectedApplication.adminChecklist.projectReport,
      organogram: this.selectedApplication.adminChecklist.organogram,
      sponsorships: this.selectedApplication.adminChecklist.sponsorships,
      certificates: this.selectedApplication.adminChecklist.certificates,
      adminNotes: this.selectedApplication.adminNotes,
    };

    this.applicationService.updateApplicationChecklist(this.selectedApplication._id, checklistData).subscribe({
      next: (response) => {
        this.updateSuccess = true;
        this.updateError = '';

        // Update local application
        const appIndex = this.applications.findIndex((app) => app._id === this.selectedApplication._id);
        if (appIndex !== -1) {
          this.applications[appIndex] = { ...this.applications[appIndex], ...checklistData };
          this.filteredApplications = [...this.applications];
        }
      },
      error: (error) => {
        this.updateError = error.error?.message || 'Failed to update checklist';
      },
    });
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
        this.updateError = error.error?.reason || error.error?.message || 'Failed to update status';
      },
    });
  }

  verifyPayment(applicationId: string, approved: boolean): void {
    const rejectionReason = approved ? null : this.paymentRejectionReason;

    if (!approved && !this.paymentRejectionReason.trim()) {
      this.updateError = 'Please provide a rejection reason';
      return;
    }

    this.applicationService.verifyPayment(applicationId, approved).subscribe({
      next: (response: any) => {
        // Update local application payment status
        const appIndex = this.applications.findIndex((app) => app._id === applicationId);
        if (appIndex !== -1 && this.applications[appIndex].paymentProof) {
          this.applications[appIndex].paymentProof.verificationStatus = approved ? 'verified' : 'rejected';
          this.applications[appIndex].paymentProof.verifiedAt = new Date();
          if (!approved) {
            this.applications[appIndex].paymentProof.rejectionReason = this.paymentRejectionReason;
          }
          
          // Update selected application
          if (this.selectedApplication && this.selectedApplication._id === applicationId) {
            this.selectedApplication = { ...this.applications[appIndex] };
            this.paymentRejectionReason = '';
          }
          
          this.filteredApplications = [...this.applications];
        }

        this.updateSuccess = true;
        this.updateError = '';
      },
      error: (error: any) => {
        this.updateError = error.error?.message || 'Failed to verify payment';
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
