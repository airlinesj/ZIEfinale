import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-applicant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Welcome, {{ userName }}!</h1>
        <p class="dashboard-subtitle">Choose an action to continue your application journey</p>
      </div>

      <div class="dashboard-cards">
        <div class="card application-card">
          <div class="card-icon">📋</div>
          <h2>ZIE Application Form</h2>
          <p>Complete or continue your Form M1 membership application</p>
          <a routerLink="/form-m1" class="card-button">
            Go to Application
          </a>
        </div>

        <div class="card logout-card">
          <div class="card-icon">🚪</div>
          <h2>Logout</h2>
          <p>Sign out from your account securely</p>
          <button (click)="logout()" class="card-button logout-btn">
            Logout Now
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .dashboard-header h1 {
      font-size: 42px;
      font-weight: 700;
      color: #004A59;
      margin-bottom: 10px;
    }

    .dashboard-subtitle {
      font-size: 16px;
      color: #666;
    }

    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .card {
      background-color: #FFFFFF;
      border: 2.5px solid #004A59;
      border-radius: 8px;
      padding: 40px 30px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .card:hover {
      transform: translateY(-5px);
      border-color: #B99532;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }

    .card h2 {
      font-size: 24px;
      font-weight: 700;
      color: #004A59;
      margin: 0 0 15px 0;
    }

    .card p {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 30px;
      min-height: 40px;
    }

    .card-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #004A59;
      color: #FFFFFF;
      border: 2.5px solid #004A59;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .card-button:hover {
      background-color: #003A47;
      border-color: #B99532;
    }

    .logout-btn {
      background-color: #B99532;
      color: #004A59;
      border: 2.5px solid #B99532;
    }

    .logout-btn:hover {
      background-color: #a58628;
      border-color: #004A59;
    }

    .application-card:hover {
      border-color: #004A59;
    }

    .logout-card:hover {
      border-color: #B99532;
    }

    @media (max-width: 768px) {
      .dashboard-header h1 {
        font-size: 32px;
      }

      .dashboard-cards {
        grid-template-columns: 1fr;
      }

      .card {
        padding: 30px 20px;
      }

      .card h2 {
        font-size: 20px;
      }
    }
  `]
})
export class ApplicantDashboardComponent implements OnInit {
  userName = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.email?.split('@')[0] || 'User';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
