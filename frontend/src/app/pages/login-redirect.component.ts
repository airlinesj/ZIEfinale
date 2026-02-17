import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleBasedDashboardService } from '../services/role-based-dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="redirect-container">
      <div class="redirect-card">
        <div class="loader"></div>
        <h2>{{ statusMessage }}</h2>
        <p>Redirecting to {{ destination }}...</p>
        <p class="classification-info">Classification: {{ userClassification }}</p>
      </div>
    </div>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .redirect-card {
      text-align: center;
      background: white;
      padding: 60px 40px;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 400px;
    }

    .loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 30px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    h2 {
      color: #004A59;
      font-size: 24px;
      margin: 20px 0 10px;
    }

    p {
      color: #666;
      font-size: 16px;
      margin: 10px 0;
    }

    .classification-info {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
      font-style: italic;
    }
  `],
})
export class LoginRedirectComponent implements OnInit, OnDestroy {
  statusMessage = 'Processing login...';
  destination = 'your dashboard';
  userClassification = 'loading...';
  private navigationTimeout: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private roleBasedDashboardService: RoleBasedDashboardService
  ) {}

  ngOnInit(): void {
    console.log('\n=== LOGIN REDIRECT COMPONENT ===');
    console.log('Component initialized');
    
    // Set a hard timeout - if we haven't navigated within 3 seconds, force navigation
    this.navigationTimeout = setTimeout(() => {
      console.warn('⚠ Timeout: No classification found, forcing navigation to /dashboard');
      this.router.navigate(['/dashboard']);
    }, 3000);
    
    // Get the classification that should have been set by auth.service
    const classification = this.roleBasedDashboardService.getClassification();
    
    console.log('Classification from service:', classification);
    console.log('  - classification:', classification?.classification);
    console.log('  - dashboard:', classification?.dashboard);
    console.log('  - displayName:', classification?.displayName);
    
    if (classification) {
      console.log('✓ Classification found:', classification.classification);
      this.userClassification = classification.classification;
      this.destination = this.getDashboardName(classification.classification);
      this.statusMessage = classification.displayName + ' - Redirecting...';
      
      // Determine dashboard path - all applicants go to /dashboard
      let dashboardPath = classification.dashboard;
      if (classification.classification === 'expatriate_applicant' || 
          classification.classification === 'local_applicant') {
        dashboardPath = '/dashboard';
      } else if (classification.classification === 'superadmin') {
        dashboardPath = '/super-admin-dashboard';
      } else if (classification.classification === 'admin') {
        dashboardPath = '/admin-dashboard';
      }
      
      console.log('Will navigate to:', dashboardPath);
      
      // Clear the hard timeout since we found classification
      if (this.navigationTimeout) {
        clearTimeout(this.navigationTimeout);
      }
      
      // Redirect after a short delay for visual feedback
      this.navigationTimeout = setTimeout(() => {
        console.log('🚀 Navigating to:', dashboardPath);
        this.router.navigate([dashboardPath]).catch(err => {
          console.error('Navigation error:', err);
          // Fallback navigation
          this.router.navigate(['/dashboard']);
        });
      }, 500);
    } else {
      console.warn('⚠ No classification found, will redirect to /dashboard after timeout');
      this.userClassification = 'unknown';
    }
  }

  ngOnDestroy(): void {
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }
  }

  private getDashboardName(classification: string): string {
    switch (classification) {
      case 'superadmin':
        return 'Super Admin Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'expatriate_applicant':
        return 'Dashboard';
      case 'local_applicant':
        return 'Dashboard';
      default:
        return 'Dashboard';
    }
  }
}
