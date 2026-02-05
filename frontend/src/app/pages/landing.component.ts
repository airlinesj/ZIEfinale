import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-container">
      <div class="landing-content">
        <div class="logo-section">
          <img src="assets/zielogo.png" alt="ZIE Logo" class="landing-logo" />
        </div>
        
        <h1 class="landing-title">ZIMBABWE INSTITUTE OF ENGINEERS</h1>
        
        <p class="landing-subtitle">Professional Membership Application Portal</p>
        
        <div class="landing-description">
          <p>Welcome to the ZIE Membership Application Portal. Apply for professional membership in the Zimbabwe Institute of Engineers and advance your engineering career.</p>
        </div>

        <div class="cta-buttons">
          <a routerLink="/login" class="btn-login">
            <span class="material-symbols-outlined">lock_person</span>
            Sign In
          </a>
          <a routerLink="/register" class="btn-register">
            <span class="material-symbols-outlined">app_registration</span>
            Create Account
          </a>
        </div>

        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <h3>Easy Application</h3>
            <p>Complete Form M1 step by step</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <h3>Professional Review</h3>
            <p>Expert assessment of your credentials</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <h3>Secure Process</h3>
            <p>Your data is protected and confidential</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #004A59 0%, #003A47 100%);
      padding: 20px;
    }

    .landing-content {
      text-align: center;
      background-color: #FFFFFF;
      border: 2.5px solid #B99532;
      border-radius: 8px;
      padding: 60px 40px;
      max-width: 600px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .logo-section {
      margin-bottom: 30px;
    }

    .landing-logo {
      height: 100px;
      width: auto;
    }

    .landing-title {
      font-family: 'Pacifico', cursive;
      font-size: 48px;
      font-weight: 900;
      color: #004A59;
      margin: 20px 0 10px 0;
      letter-spacing: 1px;
    }

    .landing-subtitle {
      font-family: 'Pacifico', cursive;
      font-size: 20px;
      color: #B99532;
      margin-bottom: 30px;
      font-weight: 900;
    }

    .landing-description {
      font-size: 14px;
      color: #555;
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      gap: 15px;
      margin-bottom: 50px;
      justify-content: center;
    }

    .btn-login, .btn-register {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 30px;
      font-size: 16px;
      font-weight: 700;
      border: 2.5px solid #004A59;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 200px;
    }

    .btn-login {
      background-color: #004A59;
      color: #FFFFFF;
    }

    .btn-login:hover {
      background-color: #003A47;
      border-color: #B99532;
    }

    .btn-register {
      background-color: #B99532;
      color: #004A59;
    }

    .btn-register:hover {
      background-color: #a58628;
      border-color: #004A59;
    }

    .btn-icon {
      font-size: 24px;
      font-variation-settings: 'wght' 600;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      padding-top: 30px;
      border-top: 2.5px solid #B99532;
    }

    .feature-item {
      padding: 15px;
    }

    .feature-icon {
      display: inline-block;
      width: 40px;
      height: 40px;
      background-color: #B99532;
      color: #FFFFFF;
      border-radius: 50%;
      line-height: 40px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .feature-item h3 {
      font-size: 14px;
      color: #004A59;
      margin: 10px 0 5px 0;
      font-weight: 700;
    }

    .feature-item p {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
      vertical-align: middle;
      margin-right: 5px;
    }

    @media (max-width: 768px) {
      .landing-content {
        padding: 40px 20px;
      }

      .landing-title {
        font-size: 28px;
      }

      .cta-buttons {
        flex-direction: column;
      }

      .btn-login, .btn-register {
        min-width: 100%;
      }
    }
  `]
})
export class LandingComponent {}
