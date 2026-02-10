import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <div class="register-card card">
        <h2>Create Account</h2>
        <p class="subtitle">Join the Zimbabwe Institution of Engineers</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Enter your email"
              class="form-input"
            />
            <div class="error-message" *ngIf="registerForm.get('email')?.errors">
              Please enter a valid email
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Enter a strong password (min 6 characters)"
              class="form-input"
            />
            <div class="error-message" *ngIf="registerForm.get('password')?.errors">
              Password must be at least 6 characters
            </div>
          </div>

          <div class="form-group">
            <p class="account-type-note">
              You are registering as an <strong>Applicant</strong> to apply for ZIE membership.
            </p>
          </div>

          <div class="form-group" *ngIf="isAdminModeActive">
            <label for="role">Account Type</label>
            <select id="role" formControlName="role" class="form-input">
              <option value="Applicant">Applicant (Membership Seeker)</option>
              <option value="Admin">Admin (Staff Only)</option>
            </select>
            <p class="admin-note" *ngIf="registerForm.get('role')?.value === 'Admin'">
              <strong>Admin accounts require an email address containing &#64;admin</strong> (e.g., admin&#64;admin.com)
            </p>
          </div>

          <button type="submit" class="btn-primary" [disabled]="!registerForm.valid || isLoading">
            {{ isLoading ? 'Creating Account...' : 'Register' }}
          </button>

          <p class="login-link">
            Already have an account? <a (click)="goToLogin()">Login Here</a>
          </p>

          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="success-message" *ngIf="successMessage">{{ successMessage }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #FFFFFF;
      padding: 20px;
      margin-top: 80px;
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      border: 2.5px solid #004A59 !important;
      border-radius: 8px;
      padding: 30px;
    }

    h2 {
      color: #004A59;
      margin-bottom: 10px;
      text-align: center;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 20px;
      font-size: 14px;
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

    .login-link {
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

    .success-message {
      color: #388e3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .admin-note {
      color: #B99532;
      font-size: 12px;
      margin-top: 8px;
      padding: 8px;
      background-color: #f5f5f5;
      border-left: 3px solid #B99532;
    }

    .account-type-note {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    @media (max-width: 768px) {
      .register-container {
        min-height: calc(100vh - 70px);
        margin-top: 70px;
        padding: 15px;
      }

      .register-card {
        max-width: 100%;
        padding: 25px;
      }

      h2 {
        font-size: 1.5rem;
        margin-bottom: 8px;
      }

      .subtitle {
        font-size: 13px;
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

      .login-link {
        font-size: 13px;
        margin-top: 12px;
      }

      .error-message,
      .success-message {
        font-size: 12px;
      }

      .admin-note {
        font-size: 12px;
        padding: 6px;
        margin-top: 6px;
      }

      .account-type-note {
        font-size: 13px;
      }
    }

    @media (max-width: 480px) {
      .register-container {
        min-height: calc(100vh - 60px);
        margin-top: 60px;
        padding: 10px;
      }

      .register-card {
        max-width: 100%;
        padding: 20px;
        border-radius: 6px;
      }

      h2 {
        font-size: 1.3rem;
        margin-bottom: 8px;
      }

      .subtitle {
        font-size: 12px;
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

      .login-link {
        font-size: 12px;
        margin-top: 10px;
      }

      .error-message,
      .success-message {
        font-size: 11px;
      }

      .admin-note {
        font-size: 11px;
        padding: 6px;
        margin-top: 6px;
      }

      .account-type-note {
        font-size: 12px;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isAdminModeActive = false;
  private keySequence: string[] = [];
  private adminKeySequence = ['shift', 'a', 'd', 'm', 'i', 'n']; // Ctrl+Shift+A then d,m,i,n

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Applicant'],
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Secret keyboard shortcut: Ctrl+Shift+A to toggle admin mode
    if (event.ctrlKey && event.shiftKey && event.key.toUpperCase() === 'A') {
      event.preventDefault();
      this.isAdminModeActive = !this.isAdminModeActive;
      if (!this.isAdminModeActive) {
        // Reset to Applicant when exiting admin mode
        this.registerForm.get('role')?.setValue('Applicant');
      }
    }
  }

  onSubmit(): void {
    if (!this.registerForm.valid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting...';
        const redirectUrl = response.user.role === 'Admin' ? '/admin-dashboard' : '/form-m1';
        setTimeout(() => this.router.navigate([redirectUrl]), 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
