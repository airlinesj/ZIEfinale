import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card card">
        <div class="tabs">
          <button
            [class.active]="isApplicant"
            (click)="toggleTab('applicant')"
            class="tab-button"
          >
            Applicant Login
          </button>
          <button
            [class.active]="!isApplicant"
            (click)="toggleTab('admin')"
            class="tab-button"
          >
            Admin Login
          </button>
        </div>

        <div class="tab-content">
          <h2>{{ isApplicant ? 'Applicant' : 'Admin' }} Login</h2>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="Enter your email"
                class="form-input"
              />
              <div class="error-message" *ngIf="loginForm.get('email')?.errors && (loginForm.get('email')?.touched || loginForm.get('email')?.dirty)">
                Please enter a valid email
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                formControlName="password"
                placeholder="Enter your password"
                class="form-input"
              />
              <div class="error-message" *ngIf="loginForm.get('password')?.errors && (loginForm.get('password')?.touched || loginForm.get('password')?.dirty)">
                Please enter a valid password
              </div>
            </div>

            <button type="submit" class="btn-primary" [disabled]="!loginForm.valid || isLoading">
              {{ isLoading ? 'Loading...' : 'Login' }}
            </button>

            <p class="signup-link">
              Don't have an account? <a (click)="goToRegister()">Sign Up Here</a>
            </p>

            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #FFFFFF;
      padding: 20px;
      margin-top: 80px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      border: 2.5px solid #004A59 !important;
      border-radius: 8px;
      padding: 30px;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .tab-button {
      flex: 1;
      padding: 10px;
      border: 2.5px solid #004A59;
      background-color: #FFFFFF;
      color: #004A59;
      cursor: pointer;
      font-weight: 600;
      border-radius: 4px;

      &.active {
        background-color: #004A59;
        color: white;
      }
    }

    h2 {
      color: #004A59;
      margin-bottom: 20px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #004A59;
    }

    .form-input {
      width: 100%;
      padding: 10px;
      border: 2.5px solid #004A59 !important;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #B99532 !important;
      }
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background-color: #004A59;
      color: white;
      font-weight: 700;
      border-radius: 8px;
      border: 2.5px solid #004A59 !important;
      cursor: pointer;
      margin-top: 20px;

      &:hover {
        background-color: darken(#004A59, 10%);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .signup-link {
      text-align: center;
      margin-top: 15px;
      font-size: 14px;

      a {
        color: #B99532;
        cursor: pointer;
        text-decoration: underline;
      }
    }

    .error-message {
      color: #d32f2f;
      font-size: 12px;
      margin-top: 5px;
    }

    @media (max-width: 768px) {
      .login-container {
        min-height: calc(100vh - 70px);
        margin-top: 70px;
        padding: 15px;
      }

      .login-card {
        max-width: 100%;
        padding: 25px;
      }

      .tabs {
        gap: 8px;
        margin-bottom: 18px;
      }

      .tab-button {
        padding: 10px;
        font-size: 13px;
      }

      h2 {
        font-size: 1.5rem;
        margin-bottom: 18px;
      }

      .form-group {
        margin-bottom: 13px;
      }

      label {
        font-size: 13px;
        margin-bottom: 5px;
      }

      .form-input {
        padding: 10px;
        font-size: 16px;
        min-height: 44px;
      }

      .btn-primary {
        padding: 11px;
        margin-top: 18px;
        font-size: 14px;
      }

      .signup-link {
        font-size: 13px;
        margin-top: 12px;
      }
    }

    @media (max-width: 480px) {
      .login-container {
        min-height: calc(100vh - 60px);
        margin-top: 60px;
        padding: 10px;
      }

      .login-card {
        max-width: 100%;
        padding: 20px;
        border-radius: 6px;
      }

      .tabs {
        gap: 6px;
        margin-bottom: 15px;
      }

      .tab-button {
        padding: 8px 6px;
        font-size: 12px;
        border-radius: 3px;
      }

      h2 {
        font-size: 1.3rem;
        margin-bottom: 15px;
      }

      .form-group {
        margin-bottom: 12px;
      }

      label {
        font-size: 12px;
        margin-bottom: 4px;
      }

      .form-input {
        padding: 10px;
        font-size: 16px;
        min-height: 44px;
        margin-bottom: 0;
      }

      .btn-primary {
        padding: 10px;
        margin-top: 15px;
        font-size: 13px;
        width: 100%;
      }

      .signup-link {
        font-size: 12px;
        margin-top: 10px;
      }

      .error-message {
        font-size: 11px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isApplicant = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  goBack(): void {
    this.router.navigate(['/']);
  }
  toggleTab(tab: string): void {
    this.isApplicant = tab === 'applicant';
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.loginForm.valid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        const redirectUrl = this.isApplicant ? '/dashboard' : '/admin-dashboard';
        this.router.navigate([redirectUrl]);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
