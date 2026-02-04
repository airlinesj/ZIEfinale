import { Component, OnInit } from '@angular/core';
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
            <label for="role">Account Type</label>
            <select id="role" formControlName="role" class="form-input">
              <option value="">Select Account Type</option>
              <option value="Applicant">Applicant (Membership Seeker)</option>
              <option value="Admin">Admin (Staff Only)</option>
            </select>
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
  `]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Applicant', Validators.required],
    });
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
        const redirectUrl = this.registerForm.get('role')?.value === 'Admin' ? '/admin-dashboard' : '/form-m1';
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
