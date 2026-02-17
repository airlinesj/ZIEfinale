import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { AuthService } from '../services/auth.service';
import { DocumentValidationService } from '../services/document-validation.service';
import { getFeeBreakdown } from '../services/membership-fee.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Custom Validators
class CustomValidators {
  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const phoneValue = String(control.value).replace(/\D/g, '');
    if (phoneValue.length !== 10) {
      return { invalidPhone: true };
    }
    return null;
  }

  static passportNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    // Accept various passport formats: mix of letters and numbers, 6-20 characters
    const pattern = /^[A-Z0-9]{6,20}$/;
    if (!pattern.test(String(control.value).toUpperCase())) {
      return { invalidPassport: true };
    }
    return null;
  }
}

@Component({
  selector: 'app-expatriate-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="form-container">
      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loader"></div>
        <p class="loading-text">Submitting your application...</p>
      </div>

      <h1>Expatriate Application Form - ZIE Membership</h1>
      <p class="form-subtitle">Professional Application for Non-Zimbabwean Engineering Professionals</p>

      <mat-stepper #stepper>
        <!-- Step 1: Personal Particulars -->
        <mat-step [stepControl]="personalParticularsForm" label="Personal Particulars">
          <form [formGroup]="personalParticularsForm">
            <div class="step-content">
              <div class="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  formControlName="firstName"
                  placeholder="Enter first name"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  formControlName="lastName"
                  placeholder="Enter last name"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="Enter email"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  formControlName="phoneNumber"
                  placeholder="Enter phone number (10 digits)"
                  class="form-input"
                />
                <div class="help-text" *ngIf="!personalParticularsForm.get('phoneNumber')?.errors && personalParticularsForm.get('phoneNumber')?.value">
                  Format: 10 digits
                </div>
              </div>

              <div class="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  formControlName="dateOfBirth"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Country of Residence</label>
                <input
                  type="text"
                  formControlName="country"
                  placeholder="Your current country"
                  class="form-input"
                  readonly
                />
              </div>

              <div class="form-group">
                <label>Nationality/Country of Citizenship</label>
                <input
                  type="text"
                  formControlName="nationality"
                  placeholder="Your nationality"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Passport/National ID Number</label>
                <input
                  type="text"
                  formControlName="idNumber"
                  placeholder="Passport or National ID Number"
                  class="form-input"
                />
                <div class="help-text">
                  <strong>Examples of acceptable formats:</strong><br>
                  • US Passport: ABC123456<br>
                  • UK Passport: 123456789<br>
                  • Australian Passport: N12345678<br>
                  • India Passport: A1234567<br>
                  • South African ID: 8001011234567
                </div>
              </div>

              <button mat-button matStepperNext class="btn-next">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Professional Qualifications -->
        <mat-step [stepControl]="educationForm" label="Qualifications">
          <form [formGroup]="educationForm">
            <div class="step-content">
              <h3>Educational Background</h3>

              <div class="form-group">
                <label>Highest Qualification</label>
                <select formControlName="qualification" class="form-input">
                  <option value="">Select qualification</option>
                  <option value="Diploma">Diploma in Engineering</option>
                  <option value="Bachelor">Bachelor of Engineering</option>
                  <option value="Master">Master's in Engineering</option>
                  <option value="PhD">PhD in Engineering</option>
                </select>
              </div>

              <div class="form-group">
                <label>Field of Engineering</label>
                <input
                  type="text"
                  formControlName="fieldOfEngineering"
                  placeholder="E.g., Civil, Mechanical, Electrical, etc."
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>University/Institution</label>
                <input
                  type="text"
                  formControlName="university"
                  placeholder="Name of institution"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Year of Graduation</label>
                <input
                  type="number"
                  formControlName="yearOfGraduation"
                  placeholder="YYYY"
                  class="form-input"
                  min="1950"
                  [max]="currentYear"
                />
              </div>

              <div class="form-group">
                <label>Professional Registration/License Number (if applicable)</label>
                <input
                  type="text"
                  formControlName="licenseNumber"
                  placeholder="License number or N/A"
                  class="form-input"
                />
              </div>

              <button mat-button matStepperPrevious class="btn-back">Back</button>
              <button mat-button matStepperNext class="btn-next">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Professional Experience -->
        <mat-step [stepControl]="experienceForm" label="Experience">
          <form [formGroup]="experienceForm">
            <div class="step-content">
              <h3>Professional Experience</h3>

              <div class="form-group">
                <label>Current Job Title</label>
                <input
                  type="text"
                  formControlName="currentJobTitle"
                  placeholder="Your current position"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Current Employer</label>
                <input
                  type="text"
                  formControlName="currentEmployer"
                  placeholder="Company/Organization name"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  formControlName="yearsOfExperience"
                  placeholder="Total years in engineering field"
                  class="form-input"
                  min="0"
                  max="70"
                />
              </div>

              <div class="form-group">
                <label>Summary of Professional Experience (250 words max)</label>
                <textarea
                  formControlName="experienceSummary"
                  placeholder="Describe your engineering experience and achievements"
                  class="form-textarea"
                  rows="4"
                  maxlength="250"
                ></textarea>
                <div class="word-count">
                  {{ experienceForm.get('experienceSummary')?.value?.length || 0 }}/250 characters
                </div>
              </div>

              <button mat-button matStepperPrevious class="btn-back">Back</button>
              <button mat-button matStepperNext class="btn-next">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 4: Apprentices/Trainees -->
        <mat-step [stepControl]="apprenticesForm" label="Apprentices">
          <form [formGroup]="apprenticesForm">
            <div class="step-content">
              <h3>Apprentice/Trainee Information</h3>
              <p class="step-subtitle">Please provide details of apprentices or trainees you have trained</p>

              <div class="form-group">
                <label>Apprentice/Trainee Name</label>
                <input
                  type="text"
                  formControlName="apprenticeName"
                  placeholder="Full name of the apprentice/trainee"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Working Place/Department</label>
                <input
                  type="text"
                  formControlName="workingPlace"
                  placeholder="Department or division they work in"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Company/Organization</label>
                <input
                  type="text"
                  formControlName="company"
                  placeholder="Company or organization name"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  formControlName="apprenticeEmail"
                  placeholder="Apprentice's email address"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  formControlName="apprenticePhone"
                  placeholder="Apprentice's phone number"
                  class="form-input"
                />
              </div>

              <button mat-button matStepperPrevious class="btn-back">Back</button>
              <button mat-button matStepperNext class="btn-next">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 5: Grade Selection -->
        <mat-step [stepControl]="gradeForm" label="Membership Grade">
          <form [formGroup]="gradeForm">
            <div class="step-content">
              <h3>Select Your Membership Grade</h3>

              <div class="grades-container">
                <div class="grade-card" *ngFor="let grade of membershipGrades" 
                     [class.selected]="gradeForm.get('grade')?.value === grade.id">
                  <input
                    type="radio"
                    [value]="grade.id"
                    formControlName="grade"
                    [id]="'grade-' + grade.id"
                    class="grade-radio"
                    (change)="onGradeSelected(grade.id)"
                  />
                  <label [for]="'grade-' + grade.id" class="grade-label">
                    <strong>{{ grade.name }}</strong>
                    <p class="grade-description">{{ grade.description }}</p>
                  </label>
                </div>
              </div>

              <!-- Fee Breakdown Display for Expatriates -->
              <div class="fee-breakdown" *ngIf="feeBreakdown">
                <div class="fee-breakdown-header">
                  <h4>💰 Membership Fee Breakdown - {{ feeBreakdown.gradeName }}</h4>
                </div>
                <div class="fee-items">
                  <div class="fee-item" *ngFor="let item of (feeBreakdown.fees | keyvalue)">
                    <span class="fee-label">{{ item.key }}</span>
                    <span class="fee-amount">$ {{ item.value }}</span>
                  </div>
                  <div class="fee-total">
                    <strong>Total Annual Fee:</strong>
                    <strong class="total-amount">$ {{ feeBreakdown.total }}</strong>
                  </div>
                </div>
                <p class="fee-note">
                  <em>All fees shown in USD. Payment options will be available during checkout.</em>
                </p>
              </div>

              <button mat-button matStepperPrevious class="btn-back">Back</button>
              <button mat-button matStepperNext class="btn-next">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 5: Company Recommendation Letter -->
        <mat-step [stepControl]="companyLetterForm" label="Company Letter">
          <form [formGroup]="companyLetterForm">
            <div class="step-content">
              <h3>Company Recommendation Letter</h3>

              <p class="requirement-notice">
                <strong>Important:</strong> As an expatriate applicant, you must provide a company recommendation letter.
                This letter should be on official company letterhead and recommend you for ZIE membership.
              </p>

              <div class="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  formControlName="companyName"
                  placeholder="Recommending company name"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Company Contact Person</label>
                <input
                  type="text"
                  formControlName="contactPerson"
                  placeholder="Name of person providing recommendation"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Upload Recommendation Letter (PDF only, max 5MB)</label>
                <input
                  type="file"
                  #companyLetterInput
                  accept=".pdf"
                  class="file-input"
                  (change)="onCompanyLetterSelected($event)"
                  hidden
                />
                <button
                  type="button"
                  (click)="companyLetterInput.click()"
                  class="btn-file-upload"
                >
                  Choose PDF File
                </button>
                <span class="file-name" *ngIf="companyLetterForm.get('letterFile')?.value">
                  {{ companyLetterForm.get('letterFile')?.value }}
                </span>
              </div>

              <div class="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="declarationCheckbox"
                  formControlName="declaration"
                  class="form-checkbox"
                />
                <label for="declarationCheckbox" class="checkbox-label">
                  I certify that the information provided is accurate and the company recommendation letter is genuine
                </label>
              </div>

              <button mat-button matStepperPrevious class="btn-back">Back</button>
              <button
                mat-button
                (click)="onSubmit(stepper)"
                [disabled]="!companyLetterForm.valid || isLoading"
                class="btn-submit"
              >
                {{ isLoading ? 'Submitting...' : 'Submit Application' }}
              </button>
            </div>
          </form>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 900px;
      margin: 20px auto;
      padding: 30px;
      background-color: #FFFFFF;
      position: relative;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 74, 89, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 9999;
    }

    .loader {
      position: relative;
      font-size: 16px;
      width: 5.5em;
      height: 5.5em;
    }

    .loader:before {
      content: '';
      position: absolute;
      transform: translate(-50%, -50%) rotate(45deg);
      height: 100%;
      width: 4px;
      background: #B99532;
      left: 50%;
      top: 50%;
    }

    .loader:after {
      content: '';
      position: absolute;
      left: 0.2em;
      bottom: 0.18em;
      width: 1em;
      height: 1em;
      background-color: #B99532;
      border-radius: 15%;
      animation: rollingRock 2.5s cubic-bezier(.79, 0, .47, .97) infinite;
    }

    @keyframes rollingRock {
      0% {
        transform: translate(0, -1em) rotate(-45deg)
      }

      5% {
        transform: translate(0, -1em) rotate(-50deg)
      }

      20% {
        transform: translate(1em, -2em) rotate(47deg)
      }

      25% {
        transform: translate(1em, -2em) rotate(45deg)
      }

      30% {
        transform: translate(1em, -2em) rotate(40deg)
      }

      45% {
        transform: translate(2em, -3em) rotate(137deg)
      }

      50% {
        transform: translate(2em, -3em) rotate(135deg)
      }

      55% {
        transform: translate(2em, -3em) rotate(130deg)
      }

      70% {
        transform: translate(3em, -4em) rotate(217deg)
      }

      75% {
        transform: translate(3em, -4em) rotate(220deg)
      }

      100% {
        transform: translate(0, -1em) rotate(-225deg)
      }
    }

    .loading-text {
      margin-top: 30px;
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    h1 {
      color: #004A59;
      text-align: center;
      margin-bottom: 30px;
      font-weight: 700;
      font-size: 28px;
    }

    h3 {
      color: #004A59;
      font-weight: 700;
      margin-bottom: 20px;
      font-size: 18px;
    }

    .step-subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
      font-style: italic;
    }

    .step-content {
      padding: 20px 0;
    }

    .form-group {
      margin-bottom: 18px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #004A59;
      font-size: 14px;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 10px;
      border: 2.5px solid #004A59 !important;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #B99532 !important;
        box-shadow: 0 0 0 3px rgba(185, 149, 50, 0.1);
      }
    }

    .form-textarea {
      min-height: 100px;
      resize: vertical;
      line-height: 1.4;
    }

    .word-count {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      text-align: right;
    }

    .requirement-notice {
      background-color: #fff3e0;
      border-left: 4px solid #B99532;
      padding: 12px;
      margin-bottom: 20px;
      border-radius: 2px;
      font-size: 14px;
      color: #333;
      line-height: 1.6;
    }

    .grades-container {
      display: grid;
      gap: 15px;
      margin-bottom: 20px;
    }

    .grade-card {
      border: 2.5px solid #004A59;
      padding: 15px;
      border-radius: 4px;
      display: flex;
      align-items: flex-start;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #FFFFFF;

      &:hover {
        border-color: #B99532;
        background-color: #fafaf5;
      }

      &.selected {
        border-color: #B99532;
        background-color: #fafaf5;
        box-shadow: 0 2px 8px rgba(0, 74, 89, 0.1);
      }
    }

    .grade-radio {
      margin-top: 2px;
      margin-right: 12px;
      cursor: pointer;
    }

    .grade-label {
      cursor: pointer;
      margin: 0;
      font-weight: 600;
      color: #004A59;
    }

    .grade-description {
      margin: 5px 0 0 0;
      font-size: 13px;
      color: #666;
      font-weight: normal;
    }

    .file-input {
      display: none;
    }

    .btn-file-upload {
      padding: 10px 16px;
      background-color: #004A59;
      color: white;
      border: 2.5px solid #004A59;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;

      &:hover {
        background-color: #003A47;
        border-color: #B99532;
      }
    }

    .file-name {
      margin-left: 10px;
      color: #388e3c;
      font-size: 13px;
      font-weight: 600;
    }

    .checkbox-group {
      display: flex;
      align-items: flex-start;
      margin-top: 20px;
      gap: 10px;
    }

    .form-checkbox {
      margin-top: 3px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .checkbox-label {
      margin: 0;
      font-weight: normal;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      line-height: 1.5;
    }

    .btn-next,
    .btn-back,
    .btn-submit {
      background-color: #004A59;
      color: white;
      padding: 10px 30px;
      margin: 20px 5px 0 0;
      border-radius: 4px;
      font-weight: 600;
      border: 2.5px solid #004A59 !important;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-next:hover,
    .btn-back:hover {
      background-color: #003A47;
      border-color: #B99532 !important;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #003A47;
      border-color: #B99532 !important;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-container {
        padding: 20px 15px;
        margin-top: 70px;
      }

      h1 {
        font-size: 22px;
        margin-bottom: 20px;
      }

      h3 {
        font-size: 16px;
      }

      .step-content {
        padding: 15px 0;
      }

      .form-group {
        margin-bottom: 15px;
      }

      label {
        font-size: 13px;
      }

      .form-input,
      .form-textarea {
        padding: 8px;
        font-size: 13px;
      }

      .btn-next,
      .btn-back,
      .btn-submit {
        padding: 8px 20px;
        font-size: 13px;
      }
    }

    .fee-breakdown {
      background-color: #f5f5f5;
      border: 2px solid #B99532;
      border-radius: 4px;
      padding: 20px;
      margin-top: 25px;
      margin-bottom: 20px;
    }

    .fee-breakdown-header {
      border-bottom: 2px solid #B99532;
      padding-bottom: 12px;
      margin-bottom: 15px;
    }

    .fee-breakdown-header h4 {
      color: #004A59;
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }

    .fee-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fee-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
      font-size: 14px;
    }

    .fee-label {
      font-weight: 600;
      color: #004A59;
      flex: 1;
    }

    .fee-amount {
      font-weight: 700;
      color: #B99532;
      min-width: 75px;
      text-align: right;
    }

    .fee-total {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      margin-top: 8px;
      border-top: 2px solid #B99532;
      font-size: 14px;
    }

    .total-amount {
      color: #B99532;
      font-size: 16px;
    }

    .fee-note {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      font-style: italic;
      margin-bottom: 0;
    }
  `]
})
export class ExpatriateFormComponent implements OnInit {
  @ViewChild('stepper') stepper: any;

  personalParticularsForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  apprenticesForm!: FormGroup;
  gradeForm!: FormGroup;
  companyLetterForm!: FormGroup;

  isLoading = false;
  currentYear = new Date().getFullYear();
  selectedCompanyLetterFile: File | null = null;
  feeBreakdown: any = null;

  membershipGrades = [
    {
      id: 'Technician',
      name: 'Engineering Technician',
      description: 'For technicians with 3+ years of relevant experience',
    },
    {
      id: 'Technologist',
      name: 'Engineering Technologist',
      description: 'For technologists with 5+ years of experience',
    },
    {
      id: 'Professional Member',
      name: 'Professional Member',
      description: 'For registered/chartered engineers with 5+ years of experience',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private docValidationService: DocumentValidationService
  ) {}

  ngOnInit(): void {
    // Verify user is expatriate applicant
    const currentUser = this.authService.getCurrentUser();
    console.log('🌍 Expatriate Form.ngOnInit - Current user:', currentUser);
    
    if (!currentUser) {
      console.warn('⚠ Expatriate Form - No user found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('🌍 Expatriate Form - User applicationType:', currentUser.applicationType);
    
    if (currentUser.applicationType !== 'expatriate') {
      console.warn('❌ Expatriate Form - Non-expatriate user detected, redirecting to M1 form');
      this.router.navigate(['/form-m1']);
      return;
    }
    
    console.log('✓ Expatriate Form - User is expatriate applicant, loading form');
    
    this.initializeForms();
    
    // Watch for user data changes - if user becomes local, redirect
    this.authService.currentUser$.subscribe((user: any) => {
      console.log('👁️ Expatriate Form - User data changed');
      
      // Check if applicationType changed to local (e.g., from server refresh or data migration)
      if (user && user.applicationType !== 'expatriate') {
        console.warn('❌ Expatriate Form - Applicant type is no longer expatriate, redirecting');
        this.router.navigate(['/form-m1']);
        return;
      }
    });
    
    this.populateCountryField();
  }

  initializeForms(): void {
    this.personalParticularsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, CustomValidators.phoneNumber]],
      dateOfBirth: ['', Validators.required],
      country: ['', Validators.required],
      nationality: ['', Validators.required],
      idNumber: ['', [Validators.required, CustomValidators.passportNumber]],
    });

    this.educationForm = this.fb.group({
      qualification: ['', Validators.required],
      fieldOfEngineering: ['', Validators.required],
      university: ['', Validators.required],
      yearOfGraduation: ['', Validators.required],
      licenseNumber: [''],
    });

    this.experienceForm = this.fb.group({
      currentJobTitle: ['', Validators.required],
      currentEmployer: ['', Validators.required],
      yearsOfExperience: ['', [Validators.required, Validators.min(0)]],
      experienceSummary: ['', [Validators.required, Validators.maxLength(250)]],
    });

    this.apprenticesForm = this.fb.group({
      apprenticeName: [''],
      workingPlace: [''],
      company: [''],
      apprenticeEmail: ['', [Validators.email]],
      apprenticePhone: [''],
    });

    this.gradeForm = this.fb.group({
      grade: ['', Validators.required],
    });

    this.companyLetterForm = this.fb.group({
      companyName: ['', Validators.required],
      contactPerson: ['', Validators.required],
      letterFile: ['', Validators.required],
      declaration: [false, Validators.requiredTrue],
    });
  }

  applyCountrySpecificValidators(country: string): void {
    const phoneControl = this.personalParticularsForm.get('phoneNumber');
    if (phoneControl) {
      phoneControl.setValidators([
        Validators.required,
        (control: AbstractControl): ValidationErrors | null => {
          if (!control.value) {
            return null;
          }
          const result = this.docValidationService.validatePhoneNumber(control.value, country);
          return result.valid ? null : { invalidPhone: { message: result.error } };
        }
      ]);
      phoneControl.updateValueAndValidity({ emitEvent: false });
    }

    const idControl = this.personalParticularsForm.get('idNumber');
    if (idControl) {
      idControl.setValidators([
        Validators.required,
        (control: AbstractControl): ValidationErrors | null => {
          if (!control.value) {
            return null;
          }
          const result = this.docValidationService.validateNationalId(control.value, country);
          return result.valid ? null : { invalidId: { message: result.error } };
        }
      ]);
      idControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  populateCountryField(): void {
    this.authService.getCurrentUserObservable().subscribe({
      next: (user: any) => {
        if (user && user.country) {
          this.personalParticularsForm.patchValue({
            country: user.country,
          });
          this.personalParticularsForm.get('country')?.disable();
          // Apply country-specific validators for phone and ID
          this.applyCountrySpecificValidators(user.country);
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  onCompanyLetterSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must not exceed 5MB');
        return;
      }

      this.selectedCompanyLetterFile = file;
      this.companyLetterForm.patchValue({
        letterFile: file.name,
      });
    }
  }

  onGradeSelected(gradeId: string): void {
    this.feeBreakdown = getFeeBreakdown(gradeId, 'expatriate');
  }

  onSubmit(stepper: any): void {
    if (
      !this.personalParticularsForm.valid ||
      !this.educationForm.valid ||
      !this.experienceForm.valid ||
      !this.gradeForm.valid ||
      !this.companyLetterForm.valid ||
      !this.selectedCompanyLetterFile
    ) {
      alert('Please complete all required fields');
      return;
    }

    this.isLoading = true;

    // Create FormData to handle file upload
    const formData = new FormData();

    // Add personal particulars
    const personalData = this.personalParticularsForm.getRawValue();
    Object.keys(personalData).forEach((key) => {
      formData.append(`personalParticulars[${key}]`, personalData[key]);
    });

    // Add education
    const educationData = this.educationForm.value;
    Object.keys(educationData).forEach((key) => {
      formData.append(`education[${key}]`, educationData[key]);
    });

    // Add experience
    const experienceData = this.experienceForm.value;
    Object.keys(experienceData).forEach((key) => {
      formData.append(`experience[${key}]`, experienceData[key]);
    });

    // Add apprentices (optional)
    const apprenticesData = this.apprenticesForm.value;
    if (apprenticesData.apprenticeName || apprenticesData.company) {
      Object.keys(apprenticesData).forEach((key) => {
        if (apprenticesData[key]) {
          formData.append(`apprentice[${key}]`, apprenticesData[key]);
        }
      });
    }

    // Add grade
    formData.append('membershipGrade', this.gradeForm.value.grade);

    // Add company letter details
    const companyData = this.companyLetterForm.value;
    formData.append('companyRecommendation[companyName]', companyData.companyName);
    formData.append('companyRecommendation[contactPerson]', companyData.contactPerson);

    // Add file
    if (this.selectedCompanyLetterFile) {
      formData.append('companyRecommendation[letterFile]', this.selectedCompanyLetterFile);
    }

    // Add applicationType
    formData.append('applicationType', 'expatriate');

    this.applicationService.submitExpatriateApplication(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✓ Expatriate application submitted successfully');
        console.log('  - Application ID:', response.id);
        
        this.dialog.open(SubmissionSuccessDialog, {
          width: '500px',
          disableClose: false,
          data: {
            applicantName: `${personalData.firstName} ${personalData.lastName}`,
            applicationId: response.id,
            grade: this.gradeForm.value.grade,
          },
        });

        // Redirect to payment page after 3 seconds
        setTimeout(() => {
          console.log('🔄 Redirecting to payment page');
          this.router.navigate(['/payment']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Application submission failed:', error);
        alert(error.error?.message || 'Application submission failed. Please try again.');
      },
    });
  }
}

@Component({
  selector: 'app-submission-success-dialog',
  template: `
    <div class="dialog-content">
      <div class="success-icon">✓</div>
      <h2>Application Submitted Successfully!</h2>
      <p class="message">
        Thank you <strong>{{ data?.applicantName }}</strong>, your membership application has been received.
      </p>
      <p class="submessage">
        Your application ID: <strong>{{ data?.applicationId }}</strong>
      </p>
      <div class="info-text">
        <p><strong>Membership Type:</strong> Expatriate</p>
        <p><strong>Membership Grade Applied For:</strong> {{ data?.grade }}</p>
        <p class="member-note">Upon approval, you will be recognized as a member of ZIE.</p>
      </div>
      <p class="next-steps">
        You will be redirected to the payment page to complete your membership application fee.
      </p>
      <button mat-button (click)="onClose()" class="close-btn">Proceed to Payment</button>
    </div>
  `,
  styles: [`
    .dialog-content {
      text-align: center;
      padding: 20px;
    }

    .success-icon {
      font-size: 48px;
      color: #4caf50;
      margin-bottom: 20px;
      font-weight: bold;
    }

    h2 {
      color: #004A59;
      margin-bottom: 15px;
      font-size: 22px;
    }

    .message {
      color: #333;
      font-size: 16px;
      margin: 10px 0;
      line-height: 1.5;
    }

    .submessage {
      color: #666;
      font-size: 14px;
      margin: 10px 0;
    }

    .info-text {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-size: 13px;
      color: #004A59;
      margin: 15px 0;
    }

    .info-text p {
      margin: 5px 0;
    }

    .member-note {
      color: #B99532;
      font-weight: 600;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
    }

    .next-steps {
      color: #666;
      font-size: 13px;
      margin: 10px 0;
      font-style: italic;
    }

    .close-btn {
      background-color: #004A59;
      color: white;
      padding: 10px 30px;
      margin-top: 20px;
      border-radius: 4px;
      font-weight: 600;
    }

    .close-btn:hover {
      background-color: darken(#004A59, 10%);
    }
  `]
})
export class SubmissionSuccessDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private router: Router) {}

  onClose(): void {
    this.router.navigate(['/payment']);
  }
}
