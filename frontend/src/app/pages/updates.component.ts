import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { AuthService } from '../services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="updates-container">
      <div class="updates-header">
        <h1>Application Updates</h1>
        <p class="updates-subtitle">View your manual grades, divisions, and interview notifications</p>
      </div>

      <div class="updates-content">
        <!-- Manual Grade Card -->
        <div class="update-card" *ngIf="application?.manualGrade">
          <div class="card-icon">📊</div>
          <h2>Manual Grade and Division</h2>
          <div class="card-body">
            <div class="update-item">
              <label>Grade:</label>
              <span class="value">{{ application.manualGrade.grade }}</span>
            </div>
            <div class="update-item">
              <label>Division:</label>
              <span class="value">{{ application.manualGrade.division }}</span>
            </div>
            <div class="update-item" *ngIf="application.manualGrade.notes">
              <label>Admin Notes:</label>
              <p class="value">{{ application.manualGrade.notes }}</p>
            </div>
            <div class="update-item">
              <label>Set By:</label>
              <span class="value">{{ application.manualGrade.setByName }}</span>
            </div>
            <div class="update-item">
              <label>Date Set:</label>
              <span class="value">{{ application.manualGrade.setAt | date: 'medium' }}</span>
            </div>
          </div>
        </div>

        <!-- Automated Grade Card -->
        <div class="update-card" *ngIf="!application?.manualGrade">
          <div class="card-icon">🤖</div>
          <h2>Automated Assessment</h2>
          <div class="card-body">
            <div class="update-item">
              <label>Suggested Grade:</label>
              <span class="value">{{ application?.suggestedGrade }}</span>
            </div>
            <div class="update-item">
              <label>Suggested Division:</label>
              <span class="value">{{ application?.suggestedDivision }}</span>
            </div>
            <p class="info-text">Awaiting manual review and grading from admin</p>
          </div>
        </div>

        <!-- Interview Notification Card -->
        <div class="update-card interview-card" *ngIf="application?.interviewNotification">
          <div class="card-icon">📞</div>
          <h2>Interview Invitation</h2>
          <div class="card-body">
            <div class="notification-badge">INTERVIEW SCHEDULED</div>
            <div class="update-item">
              <label>Message:</label>
              <p class="value">{{ application.interviewNotification.message }}</p>
            </div>
            <div class="update-item">
              <label>Sent By:</label>
              <span class="value">{{ application.interviewNotification.sentByName }}</span>
            </div>
            <div class="update-item">
              <label>Sent On:</label>
              <span class="value">{{ application.interviewNotification.sentAt | date: 'medium' }}</span>
            </div>
          </div>
        </div>

        <!-- Certificate Card -->
        <div class="update-card certificate-card" *ngIf="application?.status === 'Passed'">
          <div class="card-icon">🎓</div>
          <h2>Professional Registration Certificate</h2>
          <div class="card-body">
            <div class="certificate-badge">✓ PASSED INTERVIEW</div>
            <div class="update-item">
              <label>Registration Number:</label>
              <span class="value registration-number">{{ application.registrationNumber }}</span>
            </div>
            <div class="update-item">
              <label>Interview Passed On:</label>
              <span class="value">{{ application.interviewPassedDate | date: 'medium' }}</span>
            </div>
            <p class="certificate-info">Congratulations! Your professional registration certificate is ready to download.</p>
            <button (click)="viewCertificate()" class="btn-view-certificate">View & Download Certificate</button>
          </div>
        </div>

        <!-- Admin Approval Status Card -->
        <div class="update-card">
          <div class="card-icon">✓</div>
          <h2>Admin Approval Status</h2>
          <div class="card-body">
            <p class="approval-text">
              {{ application?.adminApprovals?.length || 0 }} / 3 Admin Approvals
            </p>
            <div class="approval-progress">
              <div class="progress-bar">
                <div class="progress-fill" [style.width]="((application?.adminApprovals?.length || 0) / 3 * 100) + '%'"></div>
              </div>
            </div>
            <div class="approvals-list" *ngIf="application?.adminApprovals && application.adminApprovals.length > 0">
              <h3>Approved By:</h3>
              <div class="approval-item" *ngFor="let approval of application.adminApprovals">
                <span class="approval-name">{{ approval.adminName }}</span>
                <span class="approval-date">({{ approval.approvedAt | date: 'short' }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- No Updates Yet -->
        <div class="no-updates" *ngIf="!application?.manualGrade && !application?.interviewNotification && (!application?.adminApprovals || application.adminApprovals.length === 0)">
          <p>No updates yet. Admin will review your application and provide updates here.</p>
        </div>
      </div>

      <div class="button-group">
        <button (click)="goBack()" class="btn-secondary">Back to Dashboard</button>
      </div>
    </div>
  `,
  styles: [`
    .updates-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .updates-header {
      text-align: center;
      margin-bottom: 50px;
    }

    .updates-header h1 {
      font-size: 42px;
      font-weight: 700;
      color: #004A59;
      margin-bottom: 10px;
    }

    .updates-subtitle {
      font-size: 16px;
      color: #666;
    }

    .updates-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .update-card {
      background-color: #FFFFFF;
      border: 2.5px solid #004A59;
      border-radius: 8px;
      padding: 30px;
      transition: all 0.3s ease;
    }

    .update-card:hover {
      border-color: #B99532;
      box-shadow: 0 4px 12px rgba(0, 74, 89, 0.1);
    }

    .update-card h2 {
      font-size: 24px;
      font-weight: 600;
      color: #004A59;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .card-icon {
      font-size: 32px;
      margin-right: 10px;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .update-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .update-item:last-child {
      border-bottom: none;
    }

    .update-item label {
      display: block;
      font-weight: 600;
      color: #004A59;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .update-item .value {
      display: block;
      color: #333;
      font-size: 16px;
      padding: 8px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }

    .update-item p.value {
      margin: 0;
      white-space: pre-wrap;
    }

    .info-text {
      color: #666;
      font-size: 14px;
      font-style: italic;
      margin: 10px 0 0 0;
    }

    .interview-card {
      border: 2.5px solid #27ae60;
      background-color: #f0fdf4;
    }

    .interview-card h2 {
      color: #27ae60;
    }

    .notification-badge {
      display: inline-block;
      background-color: #27ae60;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 15px;
    }

    .approval-card {
      border: 2.5px solid #B99532;
      background-color: #fffbf0;
    }

    .approval-card h2 {
      color: #B99532;
    }

    .approval-text {
      font-size: 18px;
      font-weight: 600;
      color: #004A59;
      margin-bottom: 15px;
    }

    .approval-progress {
      margin-bottom: 20px;
    }

    .progress-bar {
      width: 100%;
      height: 24px;
      background-color: #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #004A59, #B99532);
      transition: width 0.3s ease;
    }

    .approvals-list {
      margin-top: 20px;
    }

    .approvals-list h3 {
      font-size: 14px;
      font-weight: 600;
      color: #004A59;
      margin-bottom: 10px;
    }

    .approval-item {
      padding: 8px 0;
      color: #333;
      font-size: 14px;
    }

    .approval-name {
      font-weight: 500;
    }

    .approval-date {
      color: #999;
      margin-left: 10px;
    }

    .no-updates {
      grid-column: 1;
      text-align: center;
      padding: 40px;
      background-color: #f9f9f9;
      border: 2px dashed #ddd;
      border-radius: 8px;
      color: #666;
    }

    .button-group {
      display: flex;
      justify-content: center;
      gap: 15px;
    }

    .btn-secondary {
      background-color: #004A59;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background-color: #003038;
    }

    .certificate-card {
      border-left: 5px solid #ffc107 !important;
    }

    .certificate-badge {
      display: inline-block;
      background: linear-gradient(135deg, #ffc107, #ff9800);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 15px;
      text-transform: uppercase;
    }

    .registration-number {
      font-family: 'Courier New', monospace;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 2px;
    }

    .certificate-info {
      color: #2e7d32;
      font-weight: 600;
      margin: 15px 0;
      padding: 10px;
      background-color: #e8f5e9;
      border-left: 3px solid #2e7d32;
      border-radius: 4px;
    }

    .btn-view-certificate {
      background: linear-gradient(135deg, #004A59, #1e6b7f);
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.3s ease;
      margin-top: 15px;
    }

    .btn-view-certificate:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 74, 89, 0.3);
    }

    @media (max-width: 768px) {
      .updates-container {
        padding: 20px 15px;
      }

      .updates-header h1 {
        font-size: 32px;
      }

      .update-card {
        padding: 20px;
      }
    }
  `]
})
export class UpdatesComponent implements OnInit, OnDestroy {
  application: any = null;
  loading = true;
  error = '';
  private refreshSubscription?: Subscription;

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadApplicationUpdates();
    // Auto-refresh every 5 seconds to show real-time updates
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.loadApplicationUpdates();
    });
  }

  ngOnDestroy() {
    // Cleanup subscription
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadApplicationUpdates() {
    this.applicationService.getApplications().subscribe({
      next: (applications: any) => {
        if (applications && applications.length > 0) {
          this.application = applications[0]; // Get the first (most recent) application
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading application:', err);
        this.error = 'Failed to load application updates';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  viewCertificate() {
    if (this.application && this.application._id) {
      this.router.navigate(['/certificate', this.application._id]);
    }
  }
}
