import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-application-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="details-container">
      <!-- Header -->
      <div class="header">
        <button (click)="goBackToList()" class="btn-back">← Back to List</button>
        <h1>Application Details - {{ selectedApplication?.personalParticulars.firstName }} {{ selectedApplication?.personalParticulars.lastName }}</h1>
        <button (click)="logout()" class="btn-logout">Logout</button>
      </div>

      <!-- Main Content -->
      <div class="main-layout">
        <!-- Left Sidebar Navigation -->
        <div class="sidebar-nav">
          <div class="sidebar-header">
            <h3>Application Details</h3>
          </div>
          <nav class="nav-menu">
            <button 
              *ngFor="let section of navSections" 
              [class.active]="activeSection === section.id"
              (click)="navigateToSection(section.id)"
              class="nav-item">
              {{ section.label }}
            </button>
          </nav>
        </div>

        <!-- Right Content Area -->
        <div class="content-area">
          <div *ngIf="!selectedApplication" class="loading-spinner">
            <p>Loading application details...</p>
          </div>

          <ng-container *ngIf="selectedApplication">
          <!-- Personal Information Section -->
          <section *ngIf="activeSection === 'personal'" #personalSection class="content-section">
            <div class="section-header">
              <h2>Personal Information</h2>
            </div>
            <div class="section-content">
              <div class="detail-row">
                <span class="label">Full Name:</span>
                <span>{{ selectedApplication?.personalParticulars?.firstName }} {{ selectedApplication?.personalParticulars?.lastName }}</span>
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
              <div class="detail-row">
                <span class="label">Chosen Grade:</span>
                <span>{{ selectedApplication.chosenGrade }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Chosen Division:</span>
                <span>{{ selectedApplication.chosenSpecialistDivision }}</span>
              </div>
            </div>
          </section>

          <!-- Documents Section -->
          <section *ngIf="activeSection === 'documents'" #documentsSection class="content-section">
            <div class="section-header">
              <h2>Uploaded Documents</h2>
            </div>
            <div class="section-content">
              <div class="document-item">
                <span class="label">National ID Copy (PDF):</span>
                <a *ngIf="selectedApplication.uploadedFiles?.nationalIdPath"
                   [href]="uploadsBaseUrl + '/' + selectedApplication.uploadedFiles.nationalIdPath"
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
                     [href]="uploadsBaseUrl + '/' + certPath"
                     target="_blank"
                     class="document-link">
                    📄 Certificate {{ i + 1 }}
                  </a>
                </div>
                <span *ngIf="!selectedApplication.uploadedFiles?.certificatePaths || selectedApplication.uploadedFiles.certificatePaths.length === 0" class="no-document">Not uploaded</span>
              </div>
            </div>
          </section>

          <!-- Verification Checklist Section -->
          <section *ngIf="activeSection === 'checklist'" #checklistSection class="content-section">
            <div class="section-header">
              <h2>Verification Checklist</h2>
              <p class="progress">{{ getChecklistProgress() }}</p>
            </div>
            <div class="section-content">
              <div class="checklist-items">
                <div class="checklist-item">
                  <input type="checkbox" id="photo" [(ngModel)]="selectedApplication.adminChecklist.photo" (change)="onChecklistChange()" />
                  <label for="photo">Photo - Professional passport-sized photo</label>
                </div>
                <div class="checklist-item">
                  <input type="checkbox" id="m1Form" [(ngModel)]="selectedApplication.adminChecklist.m1Form" (change)="onChecklistChange()" />
                  <label for="m1Form">M1 Form - Completed membership form</label>
                </div>
                <div class="checklist-item">
                  <input type="checkbox" id="signature" [(ngModel)]="selectedApplication.adminChecklist.signature" (change)="onChecklistChange()" />
                  <label for="signature">Signature - Authorized signature on form</label>
                </div>
                <div class="checklist-item">
                  <input type="checkbox" id="trainingReport" [(ngModel)]="selectedApplication.adminChecklist.trainingReport" (change)="onChecklistChange()" />
                  <label for="trainingReport">Training Report - Professional development records</label>
                </div>
                <div class="checklist-item">
                  <input type="checkbox" id="projectReport" [(ngModel)]="selectedApplication.adminChecklist.projectReport" (change)="onChecklistChange()" />
                  <label for="projectReport">Project Report - Technical project report demonstrating competence</label>
                </div>
                <div class="checklist-item">
                  <input type="checkbox" id="organogram" [(ngModel)]="selectedApplication.adminChecklist.organogram" (change)="onChecklistChange()" />
                  <label for="organogram">Organogram - Organizational structure showing applicant role</label>
                </div>
                <div class="checklist-item">
                  <input type="checkbox" id="sponsorships" [(ngModel)]="selectedApplication.adminChecklist.sponsorships" (change)="onChecklistChange()" />
                  <label for="sponsorships">Sponsorships - Required sponsor appraisals received</label>
                </div>
                <div class="checklist-item">
                  <input type="checkbox" id="certificates" [(ngModel)]="selectedApplication.adminChecklist.certificates" (change)="onChecklistChange()" />
                  <label for="certificates">Certificates - Educational and professional certificates verified</label>
                </div>
              </div>
              <div class="form-group">
                <label for="adminNotes">Admin Notes:</label>
                <textarea [(ngModel)]="selectedApplication.adminNotes" id="adminNotes" class="form-input notes" placeholder="Add notes for this application..."></textarea>
              </div>
              <button (click)="updateApplicationChecklist()" class="btn-primary">Save Checklist</button>
            </div>
          </section>

          <!-- Payment Section -->
          <section *ngIf="activeSection === 'payment'" #paymentSection class="content-section">
            <div class="section-header">
              <h2>Payment Verification</h2>
            </div>
            <div class="section-content" *ngIf="selectedApplication.paymentProof; else noPayment">
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
                  <span class="payment-status-badge" [ngClass]="'status-' + (selectedApplication.paymentProof.verificationStatus || 'pending')">
                    {{ (selectedApplication.paymentProof.verificationStatus || 'pending') | uppercase }}
                  </span>
                </div>
              </div>
              <a *ngIf="selectedApplication.paymentProof.filePath"
                 [href]="uploadsBaseUrl + '/' + selectedApplication.paymentProof.filePath"
                 target="_blank"
                 class="document-link">
                📎 View Payment Proof
              </a>
            </div>
            <ng-template #noPayment>
              <p class="no-document">No payment proof uploaded yet</p>
            </ng-template>
          </section>

          <!-- Manual Grading Section -->
          <section *ngIf="activeSection === 'grading'" #gradingSection class="content-section">
            <div class="section-header">
              <h2>Manual Grade and Division</h2>
            </div>
            <div class="section-content">
              <div *ngIf="selectedApplication?.manualGrade" class="existing-grade">
                <div class="detail-row">
                  <span class="label">Grade:</span>
                  <span>{{ selectedApplication.manualGrade.grade }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Division:</span>
                  <span>{{ selectedApplication.manualGrade.division }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Set By:</span>
                  <span>{{ selectedApplication.manualGrade.setByName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span>{{ selectedApplication.manualGrade.setAt | date: 'short' }}</span>
                </div>
              </div>
              <div *ngIf="!selectedApplication?.manualGrade" class="grading-form">
                <div class="form-group">
                  <label for="manualGrade">Grade:</label>
                  <select [(ngModel)]="manualGradeData.grade" id="manualGrade" class="form-input">
                    <option value="">Select Grade</option>
                    <option value="Student">Student</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Technician">Technician</option>
                    <option value="Technologist">Technologist</option>
                    <option value="Member">Member</option>
                    <option value="Fellow">Fellow</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="manualDivision">Division:</label>
                  <input type="text" [(ngModel)]="manualGradeData.division" id="manualDivision" placeholder="Enter division" class="form-input" />
                </div>
                <div class="form-group">
                  <label for="gradeNotes">Notes:</label>
                  <textarea [(ngModel)]="manualGradeData.notes" id="gradeNotes" placeholder="Grade determination notes..." class="form-input notes" rows="2"></textarea>
                </div>
                <button (click)="setManualGrade()" class="btn-primary">Set Manual Grade</button>
              </div>
            </div>
          </section>

          <!-- Sponsor Appraisals Section -->
          <section *ngIf="activeSection === 'sponsors'" #sponsorsSection class="content-section">
            <div class="section-header">
              <h2>Sponsor Appraisals</h2>
              <p class="sponsor-count">{{ getSponsorResponseCount() }}/{{ selectedApplication?.sponsors?.length || 0 }} Responses Received</p>
            </div>
            <div class="section-content">
              <div *ngIf="!selectedApplication?.sponsors || selectedApplication.sponsors.length === 0" class="no-sponsors">
                <p>No sponsors have been assigned to this application yet.</p>
              </div>
              <div *ngFor="let sponsor of selectedApplication?.sponsors; let i = index" class="sponsor-card">
                <div class="sponsor-header">
                  <h4>Sponsor {{ i + 1 }}: {{ sponsor.sponsorName }}</h4>
                  <span class="sponsor-status" [class.responded]="sponsor.responses" [class.pending]="!sponsor.responses">
                    {{ sponsor.responses ? 'Responded' : 'Pending' }}
                  </span>
                </div>
                <div class="sponsor-email">{{ sponsor.sponsorEmail }}</div>
                
                <div *ngIf="sponsor.responses" class="appraisal-responses">
                  <div class="response-item">
                    <strong>1. How long have you known the applicant?</strong>
                    <p>{{ sponsor.responses.question1 }}</p>
                  </div>
                  <div class="response-item">
                    <strong>2. What is your professional relationship with the applicant?</strong>
                    <p>{{ sponsor.responses.question2 }}</p>
                  </div>
                  <div class="response-item">
                    <strong>3. Describe the applicant's professional competence and technical knowledge.</strong>
                    <p>{{ sponsor.responses.question3 }}</p>
                  </div>
                  <div class="response-item">
                    <strong>4. What are the applicant's key strengths in their engineering practice?</strong>
                    <p>{{ sponsor.responses.question4 }}</p>
                  </div>
                  <div class="response-item">
                    <strong>5. Does the applicant meet the ethical standards required by the engineering profession?</strong>
                    <p>{{ sponsor.responses.question5 }}</p>
                  </div>
                  <div class="response-item">
                    <strong>6. Can you recommend the applicant for membership?</strong>
                    <p class="recommendation" [class.positive]="sponsor.responses.question6 === 'Yes'" [class.conditional]="sponsor.responses.question6 === 'Yes with conditions'" [class.negative]="sponsor.responses.question6 === 'No'">
                      {{ sponsor.responses.question6 }}
                    </p>
                  </div>
                  <div class="response-item" *ngIf="sponsor.responses.question7">
                    <strong>7. Conditions/Explanation:</strong>
                    <p>{{ sponsor.responses.question7 }}</p>
                  </div>
                  <div class="response-item" *ngIf="sponsor.responses.question8">
                    <strong>8. Additional Comments:</strong>
                    <p>{{ sponsor.responses.question8 }}</p>
                  </div>
                  <div class="response-date" *ngIf="sponsor.submittedAt">
                    <em>Submitted: {{ sponsor.submittedAt | date: 'medium' }}</em>
                  </div>
                </div>
                
                <div *ngIf="!sponsor.responses" class="pending-notice">
                  <p>Awaiting response from sponsor...</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Interview Approval Section -->
          <section *ngIf="activeSection === 'interviews'" #interviewsSection class="content-section">
            <div class="section-header">
              <h2>Interview Approval ({{ selectedApplication?.adminApprovals?.length || 0 }}/3)</h2>
            </div>
            <div class="section-content">
              <div class="progress-bar">
                <div class="progress-fill" [style.width]="((selectedApplication?.adminApprovals?.length || 0) / 3 * 100) + '%'"></div>
              </div>
              <button (click)="addAdminApproval()"
                      [disabled]="!canAddApproval()"
                      class="btn-primary">
                {{ canAddApproval() ? 'Add Approval' : 'Already Approved' }}
              </button>
              <div *ngIf="selectedApplication?.adminApprovals && selectedApplication.adminApprovals.length > 0" class="approvals-list">
                <h4>Approvals:</h4>
                <div *ngFor="let approval of selectedApplication.adminApprovals" class="approval-item">
                  <span>{{ approval.adminName }}</span> - <span class="date">{{ approval.approvedAt | date: 'short' }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Interview Notification Section -->
          <section *ngIf="activeSection === 'notification'" #notificationSection class="content-section">
            <div class="section-header">
              <h2>Interview Notification</h2>
            </div>
            <div class="section-content">
              <div *ngIf="selectedApplication?.interviewNotification" class="existing-notification">
                <div class="notification-badge">INTERVIEW SCHEDULED</div>
                <div class="detail-row">
                  <span class="label">Message:</span>
                  <p class="value">{{ selectedApplication.interviewNotification.message }}</p>
                </div>
                <div class="detail-row">
                  <span class="label">Sent By:</span>
                  <span>{{ selectedApplication.interviewNotification.sentByName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span>{{ selectedApplication.interviewNotification.sentAt | date: 'medium' }}</span>
                </div>
              </div>
              <div *ngIf="!selectedApplication?.interviewNotification" class="notification-form">
                <div class="form-group">
                  <label for="interviewMessage">Message:</label>
                  <textarea [(ngModel)]="interviewMessage" id="interviewMessage" placeholder="Enter interview notification message..." class="form-input notes" rows="3"></textarea>
                </div>
                <button (click)="sendInterviewNotification()" class="btn-primary">Send Interview Notification</button>
              </div>
            </div>
          </section>

          <!-- Interview Confirmation Section -->
          <section *ngIf="activeSection === 'status'" class="content-section interview-confirmation-section">
            <div class="section-header">
              <h2>Interview Confirmation & Certificate Generation</h2>
            </div>
            <div class="section-content">
              <div class="confirmation-card" [class.passed]="selectedApplication?.status === 'Passed'">
                <div class="confirmation-header">
                  <span class="status-indicator" [ngClass]="selectedApplication?.status === 'Passed' ? 'passed' : 'pending'">
                    {{ selectedApplication?.status === 'Passed' ? '✓ PASSED' : '⏳ PENDING' }}
                  </span>
                </div>
                <div class="confirmation-details">
                  <div class="detail-item">
                    <span class="label">Interview Status:</span>
                    <span class="value">
                      {{ selectedApplication?.status === 'Passed' ? 'Passed - Certificate Ready' : 'Not Yet Confirmed' }}
                    </span>
                  </div>
                  <div class="detail-item" *ngIf="selectedApplication?.registrationNumber">
                    <span class="label">Registration Number:</span>
                    <span class="value reg-number">{{ selectedApplication.registrationNumber }}</span>
                  </div>
                  <div class="detail-item" *ngIf="selectedApplication?.interviewPassedDate">
                    <span class="label">Interview Passed Date:</span>
                    <span class="value">{{ selectedApplication.interviewPassedDate | date: 'medium' }}</span>
                  </div>
                </div>
                <div class="confirmation-action">
                  <p class="instruction-text">
                    Click the button below to confirm that this applicant has successfully passed the interview.
                    This will generate a unique registration number and allow the applicant to download their professional certificate.
                  </p>
                  <button 
                    (click)="passInterview()" 
                    class="btn-confirm-interview"
                    [disabled]="!canPassInterview()">
                    {{ selectedApplication?.status === 'Passed' ? '✓ Interview Already Confirmed' : '🎓 Confirm Interview Pass & Generate Certificate' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Update Status Section -->
          <section *ngIf="activeSection === 'status'" #statusSection class="content-section">
            <div class="section-header">
              <h2>Update Status</h2>
            </div>
            <div class="section-content">
              <div class="detail-row">
                <span class="label">Current Status:</span>
                <span class="status-badge" [ngClass]="'status-' + selectedApplication.status.toLowerCase().replace(' ', '-')">
                  {{ selectedApplication.status }}
                </span>
              </div>

              <!-- Show rejection info if application is rejected -->
              <div *ngIf="selectedApplication.status === 'Rejected' && selectedApplication.rejectionInfo" class="rejection-info-box">
                <div class="rejection-detail">
                  <strong>Rejection Reason:</strong>
                  <p>{{ selectedApplication.rejectionInfo.rejectionReason }}</p>
                </div>
                <div class="rejection-detail">
                  <strong>Rejected By:</strong>
                  <p>{{ selectedApplication.rejectionInfo.rejectedByName }} ({{ selectedApplication.rejectionInfo.rejectedByEmail }})</p>
                </div>
                <div class="rejection-detail">
                  <strong>Rejected At:</strong>
                  <p>{{ selectedApplication.rejectionInfo.rejectionTimestamp | date: 'medium' }}</p>
                </div>
                <div class="rejection-detail edit-window">
                  <strong>Edit Window:</strong>
                  <p [ngClass]="rejectionEditWindowRemaining > 0 ? 'warning' : 'expired'">
                    {{ getRejectionEditWindowDisplay() }}
                  </p>
                </div>
              </div>

              <!-- Show interview invitation for "Interview Required" status -->
              <div *ngIf="selectedApplication.status === 'Interview Required'" class="interview-action">
                <p class="action-description">Send an interview invitation to the applicant. They will be notified in their portal.</p>
                <button (click)="inviteForInterview()" class="btn-interview">
                  <span class="material-symbols-outlined">mail</span>
                  Invite for Interview
                </button>
              </div>

              <!-- Show status update and certificate download for "Passed" status -->
              <div *ngIf="selectedApplication.status === 'Passed'" class="certificate-action">
                <p class="action-description">The applicant has passed the interview and is registered as a ZIE Professional Member.</p>
                <div class="reg-display" *ngIf="selectedApplication.registrationNumber">
                  <strong>Registration Number:</strong> {{ selectedApplication.registrationNumber }}
                </div>
                <div class="button-group">
                  <button (click)="downloadCertificate()" class="btn-certificate">
                    <span class="material-symbols-outlined">download</span>
                    Download Certificate
                  </button>
                </div>
              </div>

              <!-- Show regular status update for other statuses -->
              <div *ngIf="selectedApplication.status !== 'Interview Required' && selectedApplication.status !== 'Passed'" class="regular-status-update">
                <div class="form-group">
                  <label for="statusUpdate">New Status:</label>
                  <select [(ngModel)]="selectedStatus" id="statusUpdate" class="form-input">
                    <option value="">Select Status</option>
                    <option *ngFor="let status of getAvailableStatuses()" [value]="status">{{ status }}</option>
                  </select>
                  <small class="status-hint">Current: <strong>{{ selectedApplication.status }}</strong></small>
                </div>

                <!-- Show rejection reason input if selecting "Rejected" status -->
                <div *ngIf="selectedStatus === 'Rejected'" class="form-group">
                  <label for="rejectionReason">Rejection Reason:</label>
                  <textarea 
                    [(ngModel)]="rejectionReason" 
                    id="rejectionReason"
                    class="form-input"
                    placeholder="Please provide a reason for the rejection..."
                    rows="4"></textarea>
                  <small>Applicant will have 48 hours to revise and re-submit their application</small>
                </div>

                <button (click)="updateApplicationStatus()" class="btn-primary">Update Status</button>
              </div>
            </div>
          </section>

          <!-- Messages -->
          <div class="message-area" *ngIf="updateSuccess || updateError">
            <div *ngIf="updateSuccess" class="success-message">✓ Update successful</div>
            <div *ngIf="updateError" class="error-message">✗ {{ updateError }}</div>
          </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      display: flex;
      flex-direction: column;
      padding-top: 80px;
    }

    .header {
      background-color: #004A59;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      gap: 20px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1001;

      h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        flex: 1;
      }

      .btn-back {
        background-color: #B99532;
        color: #004A59;
        border: 2px solid #B99532;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        white-space: nowrap;
        font-size: 13px;

        &:hover {
          background-color: #a58628;
        }
      }

      .btn-logout {
        background-color: white;
        color: #004A59;
        border: 2px solid white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        white-space: nowrap;
        font-size: 13px;

        &:hover {
          background-color: #f0f0f0;
        }
      }
    }

    .main-layout {
      display: flex;
      flex: 1;
      gap: 0;
    }

    .sidebar-nav {
      width: 280px;
      background-color: #004A59;
      border-right: 2px solid #B99532;
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: sticky;
      top: 80px;
      min-height: calc(100vh - 80px);

      .sidebar-header {
        background-color: #003347;
        border-bottom: 2px solid #B99532;
        padding: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin: 0;

        h3 {
          margin: 0;
          color: white;
          font-size: 16px;
          font-weight: 700;
          flex: 1;
        }

        .logout-btn-header {
          background-color: rgba(185, 149, 50, 0.3);
          border: 2px solid #B99532;
          color: white;
          padding: 8px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;

          &:hover {
            background-color: #B99532;
            color: #004A59;
          }

          .icon {
            font-size: 18px;
          }
        }
      }

      .nav-menu {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 15px 0;
      }

      .nav-item {
        background: none;
        border: none;
        border-left: 3px solid transparent;
        color: white;
        padding: 14px 20px;
        text-align: left;
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(185, 149, 50, 0.2);
          border-left-color: #B99532;
          padding-left: 17px;
        }

        &.active {
          background-color: rgba(185, 149, 50, 0.3);
          border-left-color: #B99532;
          font-weight: 600;
        }
      }
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 30px;
      width: 100%;
      max-width: 100%;
    }

    .content-section {
      background-color: white;
      border: 2px solid #004A59;
      border-radius: 8px;
      margin-bottom: 30px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #004A59;
      font-size: 16px;
      font-weight: 500;
    }

    .section-header {
      background-color: #004A59;
      color: white;
      padding: 15px 20px;
      border-bottom: 2px solid #003347;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .progress {
        background-color: rgba(185, 149, 50, 0.3);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        margin: 0;
      }
    }

    .section-content {
      padding: 20px;

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 600;
          color: #004A59;
          min-width: 150px;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;

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
      }
    }

    .document-item {
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        color: #004A59;
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

    .checklist-items {
      margin-bottom: 20px;

      .checklist-item {
        display: flex;
        align-items: flex-start;
        padding: 10px 0;
        gap: 12px;

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
          border: 2px solid #004A59;
          accent-color: #B99532;
        }

        label {
          cursor: pointer;
          margin: 0;
          line-height: 1.4;
          color: #333;
        }
      }
    }

    .existing-grade {
      background-color: #e8f5e9;
      border: 1px solid #4caf50;
      padding: 15px;
      border-radius: 4px;
      color: #2e7d32;

      .detail-row {
        border-bottom: 1px solid rgba(76, 175, 80, 0.2);

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #2e7d32;
          font-weight: 600;
        }
      }
    }

    .grading-form {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;

      .form-group {
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-weight: 600;
        color: #004A59;
        font-size: 13px;
      }

      .form-input {
        padding: 10px;
        border: 2px solid #004A59;
        border-radius: 4px;
        font-size: 13px;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: #B99532;
          box-shadow: 0 0 4px rgba(185, 149, 50, 0.3);
        }

        &.notes {
          resize: vertical;
          min-height: 80px;
        }
      }
    }

    .progress-bar {
      width: 100%;
      height: 24px;
      background-color: #f0f0f0;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 15px;
      border: 1px solid #ddd;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #B99532 0%, #004A59 100%);
      transition: width 0.3s ease;
    }

    .approvals-list {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #f0f0f0;

      h4 {
        margin: 0 0 10px 0;
        color: #004A59;
        font-size: 13px;
      }

      .approval-item {
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
        display: flex;
        justify-content: space-between;

        &:last-child {
          border-bottom: none;
        }

        .date {
          color: #999;
          font-size: 12px;
        }
      }
    }

    .existing-notification {
      background-color: #fff9c4;
      border: 1px solid #f9a825;
      padding: 15px;
      border-radius: 4px;
      color: #6d4c41;

      .notification-badge {
        display: inline-block;
        background-color: #27ae60;
        color: white;
        padding: 6px 12px;
        border-radius: 15px;
        font-weight: 600;
        font-size: 11px;
        margin-bottom: 10px;
      }

      .detail-row {
        padding: 8px 0;

        .label {
          color: #6d4c41;
        }

        .value {
          color: #6d4c41;
          margin: 0;
          font-size: 13px;
        }
      }
    }

    .notification-form {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }

    /* Sponsor Appraisals Styles */
    .sponsor-count {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .no-sponsors {
      text-align: center;
      padding: 30px;
      color: #666;
      background-color: #f9f9f9;
      border-radius: 8px;
    }

    .sponsor-card {
      background-color: #f9f9f9;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .sponsor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      h4 {
        margin: 0;
        color: #004A59;
        font-size: 16px;
      }
    }

    .sponsor-status {
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 600;

      &.responded {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      &.pending {
        background-color: #fff3e0;
        color: #ef6c00;
      }
    }

    .sponsor-email {
      color: #666;
      font-size: 13px;
      margin-bottom: 15px;
    }

    .appraisal-responses {
      border-top: 2px solid #B99532;
      padding-top: 15px;
      margin-top: 10px;
    }

    .response-item {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      strong {
        display: block;
        color: #004A59;
        font-size: 13px;
        margin-bottom: 8px;
      }

      p {
        margin: 0;
        color: #333;
        font-size: 14px;
        line-height: 1.5;
        background-color: white;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
      }
    }

    .recommendation {
      font-weight: 600 !important;

      &.positive {
        color: #2e7d32 !important;
        background-color: #e8f5e9 !important;
        border-color: #a5d6a7 !important;
      }

      &.conditional {
        color: #ef6c00 !important;
        background-color: #fff3e0 !important;
        border-color: #ffcc80 !important;
      }

      &.negative {
        color: #c62828 !important;
        background-color: #ffebee !important;
        border-color: #ef9a9a !important;
      }
    }

    .response-date {
      text-align: right;
      color: #999;
      font-size: 12px;
      margin-top: 10px;
    }

    .pending-notice {
      text-align: center;
      padding: 20px;
      color: #ef6c00;
      background-color: #fff3e0;
      border-radius: 4px;
      border: 1px dashed #ef6c00;

      p {
        margin: 0;
      }
    }

    .payment-details {
      margin-bottom: 15px;

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 600;
          color: #004A59;
        }

        .payment-status-badge {
          display: inline-block;
          padding: 4px 12px;
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
      }
    }

    .btn-primary {
      background-color: #004A59;
      color: white;
      border: 2px solid #004A59;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.3s ease;
      width: 100%;
      margin-top: 15px;

      &:hover:not(:disabled) {
        background-color: #B99532;
        border-color: #B99532;
      }

      &:disabled {
        background-color: #ccc;
        border-color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    .btn-success {
      background-color: #28a745;
      color: white;
      border: 2px solid #28a745;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.3s ease;
      width: 100%;
      margin-top: 15px;

      &:hover:not(:disabled) {
        background-color: #218838;
        border-color: #218838;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      }

      &:disabled {
        background-color: #ccc;
        border-color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;

      button {
        flex: 1;
        min-width: 200px;
        margin-top: 0 !important;
      }
    }

    .interview-action,
    .certificate-action,
    .regular-status-update {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #B99532;
      margin-top: 15px;
    }

    .interview-action {
      border-left-color: #FFA500;
      background-color: #fffbf0;
    }

    .certificate-action {
      border-left-color: #28a745;
      background-color: #f0f9f6;
    }

    .rejection-info-box {
      background-color: #ffeceb;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #c62828;
      margin-top: 15px;
      border: 2px solid #ffcccc;
    }

    .rejection-detail {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      strong {
        display: block;
        color: #c62828;
        font-weight: 700;
        margin-bottom: 5px;
      }

      p {
        margin: 0;
        color: #555;
        font-size: 14px;
        line-height: 1.5;
      }

      &.edit-window {
        p {
          &.warning {
            color: #ff9800;
            font-weight: 600;
          }

          &.expired {
            color: #c62828;
            font-weight: 600;
          }
        }
      }
    }

    .action-description {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #555;
      line-height: 1.5;
    }

    .reg-display {
      background-color: white;
      padding: 12px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-size: 14px;
      border: 1px solid #ddd;
    }

    .reg-display strong {
      display: block;
      margin-bottom: 8px;
      color: #333;
    }

    .btn-interview,
    .btn-certificate {
      width: 100%;
      padding: 12px 20px;
      border: 2px solid;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 0;

      .material-symbols-outlined {
        font-size: 18px;
      }
    }

    .btn-interview {
      background-color: #FFA500;
      color: white;
      border-color: #FF8C00;

      &:hover {
        background-color: #FF8C00;
        box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
        transform: translateY(-2px);
      }
    }

    .btn-certificate {
      background-color: #28a745;
      color: white;
      border-color: #218838;

      &:hover {
        background-color: #218838;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        transform: translateY(-2px);
      }
    }

    .interview-confirmation-section {
      border-top: 3px solid #28a745;
      background-color: #f0f9f6;
      margin-bottom: 20px;
    }

    .confirmation-card {
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background-color: white;
      transition: all 0.3s ease;

      &.passed {
        border-color: #28a745;
        background-color: #f0f9f6;
      }
    }

    .confirmation-header {
      margin-bottom: 15px;
    }

    .status-indicator {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.pending {
        background-color: #fff3cd;
        color: #856404;
      }

      &.passed {
        background-color: #d4edda;
        color: #155724;
      }
    }

    .confirmation-details {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 6px;
    }

    .detail-item {
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
        min-width: 180px;
      }

      .value {
        color: #333;
        text-align: right;
        flex: 1;

        &.reg-number {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          color: #28a745;
          font-size: 15px;
        }
      }
    }

    .confirmation-action {
      padding: 15px;
      background-color: #f0f9f6;
      border-left: 4px solid #28a745;
      border-radius: 4px;
    }

    .instruction-text {
      margin: 0 0 15px 0;
      font-size: 13px;
      color: #555;
      line-height: 1.5;
    }

    .btn-confirm-interview {
      width: 100%;
      padding: 12px 20px;
      background-color: #28a745;
      color: white;
      border: 2px solid #28a745;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &:hover:not(:disabled) {
        background-color: #218838;
        border-color: #1e7e34;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        transform: translateY(-2px);
      }

      &:disabled {
        background-color: #ccc;
        border-color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    .message-area {
      margin-top: 20px;

      .success-message, .error-message {
        padding: 12px 15px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 13px;
      }

      .success-message {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #4caf50;
      }

      .error-message {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #ef5350;
      }
    }

    .no-document {
      color: #999;
      font-style: italic;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .main-layout {
        flex-direction: column;
      }

      .sidebar-nav {
        width: 100%;
        position: static;
        flex-direction: row;
        padding: 10px;
        height: auto;
        border-right: none;
        border-bottom: 2px solid #B99532;

        .nav-menu {
          flex-direction: row;
          overflow-x: auto;
          gap: 5px;
        }

        .nav-item {
          white-space: nowrap;
          padding: 8px 12px;
          font-size: 12px;
        }

        .logout-btn {
          margin: 0;
          flex-shrink: 0;
        }
      }

      .content-area {
        padding: 15px;
      }
    }

    .button-group {
      display: flex;
      gap: 15px;
      align-items: flex-end;
      flex-wrap: wrap;

      .form-group {
        flex: 1;
        min-width: 200px;
      }

      button {
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;

        button {
          width: 100%;
        }

        .form-group {
          width: 100%;
        }
      }
    }
  `]
})
export class AdminApplicationDetailsComponent implements OnInit {
  selectedApplication: any = null;
  activeSection = 'personal';
  selectedStatus = '';
  updateSuccess = false;
  updateError = '';
  isEditingChecklist = false;
  
  // Dynamic base URL for uploads
  get uploadsBaseUrl(): string {
    return `${environment.apiUrl}/uploads`;
  }
  manualGradeData = {
    grade: '',
    division: '',
    notes: '',
  };
  interviewMessage = '';

  // Valid status transitions - mirrors backend logic
  validStatusTransitions: { [key: string]: string[] } = {
    'Draft': ['Submitted', 'Rejected'],
    'Submitted': ['Under Review', 'Rejected'],
    'Pending': ['Under Review', 'Interview Required', 'Rejected'],
    'Under Review': ['Approved', 'Rejected', 'Approved with Conditions', 'Interview Required'],
    'Interview Required': ['Approved', 'Rejected', 'Approved with Conditions', 'Passed'],
    'Approved': ['Passed'],
    'Rejected': ['Submitted'],  // Allow re-submission within 24 hours
    'Approved with Conditions': ['Approved', 'Rejected', 'Passed'],
    'Passed': [],
  };

  rejectionReason = '';
  rejectionEditWindowRemaining = 0;  // In seconds

  navSections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'documents', label: 'Documents' },
    { id: 'checklist', label: 'Verification' },
    { id: 'payment', label: 'Payment' },
    { id: 'grading', label: 'Manual Grading' },
    { id: 'sponsors', label: 'Sponsor Appraisals' },
    { id: 'interviews', label: 'Interviews' },
    { id: 'notification', label: 'Interview Notification' },
    { id: 'status', label: 'Update Status' },
  ];

  getSponsorResponseCount(): number {
    if (!this.selectedApplication?.sponsors) return 0;
    return this.selectedApplication.sponsors.filter((s: any) => s.responses).length;
  }

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadApplication(params['id']);
      }
    });
  }

  loadApplication(appId: string): void {
    // Use auto-refresh to get real-time updates every 5 seconds
    // but only if not currently editing the checklist
    const subscription = this.applicationService.getApplicationByIdWithAutoRefresh(appId).subscribe({
      next: (app) => {
        if (!this.isEditingChecklist) {
          this.selectedApplication = app;
          this.updateRejectionEditWindow();
        }
      },
      error: (error) => {
        console.error('Error loading application:', error);
        this.updateError = 'Failed to load application';
      },
    });
  }

  updateRejectionEditWindow(): void {
    if (this.selectedApplication?.rejectionInfo?.allowEditUntil) {
      const now = new Date();
      const allowEditUntil = new Date(this.selectedApplication.rejectionInfo.allowEditUntil);
      const remainingMs = allowEditUntil.getTime() - now.getTime();
      this.rejectionEditWindowRemaining = Math.max(0, Math.floor(remainingMs / 1000));
    }
  }

  getRejectionEditWindowDisplay(): string {
    if (this.rejectionEditWindowRemaining <= 0) {
      return 'Editing window closed';
    }
    const hours = Math.floor(this.rejectionEditWindowRemaining / 3600);
    const minutes = Math.floor((this.rejectionEditWindowRemaining % 3600) / 60);
    const seconds = this.rejectionEditWindowRemaining % 60;
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  }

  navigateToSection(sectionId: string): void {
    this.activeSection = sectionId;
  }

  goBackToList(): void {
    this.router.navigate(['/applications-list']);
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

    this.isEditingChecklist = true;
    this.applicationService.updateApplicationChecklist(this.selectedApplication._id, checklistData).subscribe({
      next: (response) => {
        // Update the full application with response to preserve all data
        this.selectedApplication = response.application || this.selectedApplication;
        this.updateSuccess = true;
        this.updateError = '';
        // Keep flag true for 1 second after save to prevent race conditions
        setTimeout(() => {
          this.isEditingChecklist = false;
        }, 1000);
      },
      error: (error) => {
        this.updateError = error.error?.message || 'Failed to update checklist';
        this.isEditingChecklist = false;
      },
    });
  }

  onChecklistChange(): void {
    // Set flag to prevent auto-refresh while user is editing
    this.isEditingChecklist = true;
  }

  updateApplicationStatus(): void {
    if (!this.selectedStatus) {
      this.updateError = 'Please select a status';
      return;
    }

    // If rejecting, require a reason
    if (this.selectedStatus === 'Rejected' && !this.rejectionReason.trim()) {
      this.updateError = 'Please provide a rejection reason';
      return;
    }

    const statusData: any = { status: this.selectedStatus };
    
    if (this.selectedStatus === 'Rejected') {
      statusData.rejectionReason = this.rejectionReason;
    }

    this.applicationService.updateApplicationStatus(this.selectedApplication._id, statusData).subscribe({
      next: (response) => {
        // Update the full application object to preserve all fields
        this.selectedApplication = response;
        this.updateRejectionEditWindow();
        this.updateSuccess = true;
        this.updateError = '';
        this.rejectionReason = '';
        setTimeout(() => (this.updateSuccess = false), 3000);
      },
      error: (error) => {
        this.updateError = error.error?.reason || error.error?.message || 'Failed to update status';
      },
    });
  }

  setManualGrade(): void {
    if (!this.selectedApplication || !this.manualGradeData.grade || !this.manualGradeData.division) {
      this.updateError = 'Please fill in grade and division';
      return;
    }

    this.applicationService.setManualGrade(this.selectedApplication._id, this.manualGradeData).subscribe({
      next: (response: any) => {
        this.selectedApplication.manualGrade = response.manualGrade;
        this.updateSuccess = true;
        this.updateError = '';
        this.manualGradeData = { grade: '', division: '', notes: '' };
        setTimeout(() => (this.updateSuccess = false), 3000);
      },
      error: (error: any) => {
        this.updateError = error.error?.message || 'Failed to set manual grade';
      },
    });
  }

  canAddApproval(): boolean {
    if (!this.selectedApplication) return false;
    const approvals = this.selectedApplication.adminApprovals || [];
    return !approvals.some((app: any) => app.adminId === localStorage.getItem('userId'));
  }

  addAdminApproval(): void {
    if (!this.selectedApplication) {
      this.updateError = 'No application selected';
      return;
    }

    this.applicationService.addAdminApproval(this.selectedApplication._id).subscribe({
      next: (response: any) => {
        this.selectedApplication.adminApprovals = response.adminApprovals;
        this.selectedApplication.status = response.status;
        this.updateSuccess = true;
        this.updateError = '';
        setTimeout(() => (this.updateSuccess = false), 3000);
      },
      error: (error: any) => {
        this.updateError = error.error?.message || 'Failed to add approval';
      },
    });
  }

  sendInterviewNotification(): void {
    if (!this.selectedApplication || !this.interviewMessage.trim()) {
      this.updateError = 'Please enter an interview message';
      return;
    }

    this.applicationService.sendInterviewNotification(this.selectedApplication._id, this.interviewMessage).subscribe({
      next: (response: any) => {
        this.selectedApplication.interviewNotification = response.interviewNotification;
        this.updateSuccess = true;
        this.updateError = '';
        this.interviewMessage = '';
        setTimeout(() => (this.updateSuccess = false), 3000);
      },
      error: (error: any) => {
        this.updateError = error.error?.message || 'Failed to send interview notification';
      },
    });
  }

  canPassInterview(): boolean {
    return this.selectedApplication && this.selectedApplication.status !== 'Passed';
  }

  inviteForInterview(): void {
    if (!this.selectedApplication) {
      this.updateError = 'No application selected';
      return;
    }

    if (confirm('Send interview invitation to ' + this.selectedApplication.personalParticulars.firstName + '?')) {
      this.applicationService.sendInterviewNotification(this.selectedApplication._id, 'You have been invited for your interview. Please check your portal for details.').subscribe({
        next: (response: any) => {
          this.updateSuccess = true;
          this.updateError = '';
          console.log('Interview invitation sent successfully');
          setTimeout(() => (this.updateSuccess = false), 3000);
        },
        error: (error: any) => {
          console.error('Error sending interview invitation:', error);
          this.updateError = error.error?.message || 'Failed to send interview invitation';
        },
      });
    }
  }

  downloadCertificate(): void {
    if (this.selectedApplication && this.selectedApplication._id) {
      this.router.navigate(['/certificate', this.selectedApplication._id]);
    }
  }

  passInterview(): void {
    if (!this.selectedApplication) {
      this.updateError = 'No application selected';
      return;
    }

    if (confirm('Are you sure you want to mark this interview as passed and generate a certificate?')) {
      this.applicationService.passInterview(this.selectedApplication._id).subscribe({
        next: (response: any) => {
          // Extract from nested application object in response
          const appData = response.application || response;
          this.selectedApplication.status = appData.status || 'Passed';
          this.selectedApplication.registrationNumber = appData.registrationNumber;
          this.selectedApplication.interviewPassedDate = appData.interviewPassedDate;
          this.updateSuccess = true;
          this.updateError = '';
          console.log('Interview passed successfully. Registration Number:', appData.registrationNumber);
          setTimeout(() => (this.updateSuccess = false), 3000);
        },
        error: (error: any) => {
          console.error('Error passing interview:', error);
          this.updateError = error.error?.message || 'Failed to mark interview as passed';
        },
      });
    }
  }

  /**
   * Get available status options based on current status
   */
  getAvailableStatuses(): string[] {
    if (!this.selectedApplication) {
      return [];
    }
    return this.validStatusTransitions[this.selectedApplication.status] || [];
  }

  viewCertificate(): void {
    if (this.selectedApplication && this.selectedApplication._id) {
      this.router.navigate(['/certificate', this.selectedApplication._id]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
