import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-form-m1',
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
  ],
  template: `
    <div class="form-container">
      <h1>Form M1 - ZIE Membership Application</h1>

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
                  formControlName="phone"
                  placeholder="Enter phone number"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>National ID Number</label>
                <input
                  type="text"
                  formControlName="nationalId"
                  placeholder="Enter national ID"
                  class="form-input"
                />
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
                <label>Nationality</label>
                <input
                  type="text"
                  formControlName="nationality"
                  placeholder="Enter nationality"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Professional Registration Number (if any)</label>
                <input
                  type="text"
                  formControlName="professionalNumber"
                  placeholder="Enter professional number"
                  class="form-input"
                />
              </div>
            </div>
            <div class="step-buttons">
              <button matStepperNext type="button" class="btn-primary" [disabled]="!personalParticularsForm.valid">
                Next
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Education -->
        <mat-step [stepControl]="educationForm" label="Education">
          <form [formGroup]="educationForm">
            <div class="step-content">
              <div formArrayName="education">
                <div *ngFor="let edu of educationArray.controls; let i = index" class="education-item">
                  <h4>Qualification {{ i + 1 }}</h4>
                  <div [formGroupName]="i">
                    <div class="form-group">
                      <label>Institution</label>
                      <input
                        type="text"
                        formControlName="institution"
                        placeholder="University/Institution name"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label>Qualification</label>
                      <input
                        type="text"
                        formControlName="qualification"
                        placeholder="e.g., Bachelor of Engineering"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label>Year Obtained</label>
                      <input type="number" formControlName="year" placeholder="YYYY" class="form-input" />
                    </div>

                    <div class="form-group">
                      <label>Major/Specialization</label>
                      <input
                        type="text"
                        formControlName="major"
                        placeholder="e.g., Civil Engineering"
                        class="form-input"
                      />
                    </div>

                    <button
                      type="button"
                      (click)="removeEducation(i)"
                      class="btn-secondary"
                      *ngIf="educationArray.length > 1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <button type="button" (click)="addEducation()" class="btn-secondary">
                + Add Another Qualification
              </button>
            </div>

            <div class="step-buttons">
              <button matStepperPrevious type="button" class="btn-secondary">Back</button>
              <button matStepperNext type="button" class="btn-primary">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Experience -->
        <mat-step [stepControl]="experienceForm" label="Engineering Experience">
          <form [formGroup]="experienceForm">
            <div class="step-content">
              <div formArrayName="experience">
                <div *ngFor="let exp of experienceArray.controls; let i = index" class="experience-item">
                  <h4>Position {{ i + 1 }}</h4>
                  <div [formGroupName]="i">
                    <div class="form-group">
                      <label>Company/Organization</label>
                      <input
                        type="text"
                        formControlName="company"
                        placeholder="Company name"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label>Job Title/Position</label>
                      <input
                        type="text"
                        formControlName="position"
                        placeholder="Your position"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label>Start Year</label>
                      <input type="number" formControlName="startYear" placeholder="YYYY" class="form-input" />
                    </div>

                    <div class="form-group">
                      <label>End Year</label>
                      <input type="number" formControlName="endYear" placeholder="YYYY or 'Present'" class="form-input" />
                    </div>

                    <div class="form-group">
                      <label>Description of Duties</label>
                      <textarea formControlName="description" placeholder="Describe your responsibilities" class="form-input"></textarea>
                    </div>

                    <button
                      type="button"
                      (click)="removeExperience(i)"
                      class="btn-secondary"
                      *ngIf="experienceArray.length > 1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <button type="button" (click)="addExperience()" class="btn-secondary">
                + Add Another Position
              </button>
            </div>

            <div class="step-buttons">
              <button matStepperPrevious type="button" class="btn-secondary">Back</button>
              <button matStepperNext type="button" class="btn-primary">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 4: Membership Grade & Division -->
        <mat-step [stepControl]="gradeForm" label="Membership Grade & Division">
          <form [formGroup]="gradeForm">
            <div class="step-content">
              <div class="form-group">
                <label>Membership Grade</label>
                <select formControlName="chosenGrade" (change)="onGradeChange()" class="form-input">
                  <option value="">Select a Grade</option>
                  <option value="Student">Student Member</option>
                  <option value="Graduate">Graduate Member</option>
                  <option value="Technician">Technician</option>
                  <option value="Technologist">Technologist</option>
                  <option value="Member">Full Member</option>
                  <option value="Fellow">Fellow</option>
                </select>
              </div>

              <div class="grade-info" *ngIf="gradeForm.get('chosenGrade')?.value">
                <p>
                  <strong>Requirements for {{ gradeForm.get('chosenGrade')?.value }}:</strong>
                </p>
                <ul *ngIf="selectedGradeRequirements">
                  <li *ngIf="selectedGradeRequirements.requiresDiploma">Diploma or higher qualification required</li>
                  <li *ngIf="selectedGradeRequirements.requiresTechnicalReport">Technical Project Report required</li>
                  <li>Minimum {{ selectedGradeRequirements.minYearsExperience }} years experience</li>
                  <li>Application Fee: {{ selectedGradeRequirements.baseFee }} USD</li>
                </ul>
              </div>

              <div class="form-group">
                <label>Specialist Division</label>
                <select formControlName="chosenSpecialistDivision" class="form-input">
                  <option value="">Select Division</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Electrical">Electrical Engineering</option>
                  <option value="Chemical">Chemical Engineering</option>
                  <option value="Mining">Mining Engineering</option>
                  <option value="Water">Water Resources Engineering</option>
                </select>
              </div>

              <!-- File uploads based on grade -->
              <div class="uploads-section" *ngIf="gradeForm.get('chosenGrade')?.value">
                <h4>Required Documents</h4>

                <div class="upload-group">
                  <label>National ID Copy (PDF)</label>
                  <div class="upload-zone">
                    <input type="file" accept=".pdf" (change)="onFileSelected($event, 'nationalIdCopy')" />
                    <p>Drag and drop or click to upload</p>
                  </div>
                </div>

                <div class="upload-group">
                  <label>Certified Certificates (PDF)</label>
                  <div class="upload-zone">
                    <input type="file" accept=".pdf" multiple (change)="onFileSelected($event, 'certificates')" />
                    <p>Drag and drop or click to upload</p>
                  </div>
                </div>

                <div class="upload-group" *ngIf="selectedGradeRequirements?.requiresTechnicalReport">
                  <label>Technical Project Report (PDF)</label>
                  <div class="upload-zone">
                    <input type="file" accept=".pdf" (change)="onFileSelected($event, 'technicalReport')" />
                    <p>Drag and drop or click to upload</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-buttons">
              <button matStepperPrevious type="button" class="btn-secondary">Back</button>
              <button matStepperNext type="button" class="btn-primary" [disabled]="!gradeForm.valid">Next</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 5: Sponsors -->
        <mat-step [stepControl]="sponsorsForm" label="Sponsors">
          <form [formGroup]="sponsorsForm">
            <div class="step-content">
              <p class="info-text">
                Please list three professional sponsors who can provide appraisals for your application.
                These should be qualified professionals in your field with knowledge of your work.
              </p>

              <div formArrayName="sponsors">
                <div *ngFor="let sponsor of sponsorsArray.controls; let i = index" class="sponsor-item">
                  <h4>Sponsor {{ i + 1 }}</h4>
                  <div [formGroupName]="i">
                    <div class="form-group">
                      <label>Sponsor Name</label>
                      <input
                        type="text"
                        formControlName="name"
                        placeholder="Full name"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label>Sponsor Email</label>
                      <input
                        type="email"
                        formControlName="email"
                        placeholder="Email address"
                        class="form-input"
                      />
                    </div>

                    <button
                      type="button"
                      (click)="removeSponsor(i)"
                      class="btn-secondary"
                      *ngIf="sponsorsArray.length > 1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <button type="button" (click)="addSponsor()" class="btn-secondary" *ngIf="sponsorsArray.length < 3">
                + Add Sponsor
              </button>
            </div>

            <div class="step-buttons">
              <button matStepperPrevious type="button" class="btn-secondary">Back</button>
              <button
                matStepperNext
                type="button"
                class="btn-primary"
                [disabled]="!sponsorsForm.valid || sponsorsArray.length < 3"
              >
                Review & Submit
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 6: Review & Submit -->
        <mat-step label="Review & Submit">
          <div class="review-content">
            <h3>Application Summary</h3>

            <div class="review-section">
              <h4>Personal Particulars</h4>
              <p><strong>Name:</strong> {{ personalParticularsForm.get('firstName')?.value }} {{ personalParticularsForm.get('lastName')?.value }}</p>
              <p><strong>Email:</strong> {{ personalParticularsForm.get('email')?.value }}</p>
              <p><strong>Phone:</strong> {{ personalParticularsForm.get('phone')?.value }}</p>
            </div>

            <div class="review-section">
              <h4>Membership Grade</h4>
              <p><strong>Grade:</strong> {{ gradeForm.get('chosenGrade')?.value }}</p>
              <p><strong>Specialist Division:</strong> {{ gradeForm.get('chosenSpecialistDivision')?.value }}</p>
              <p><strong>Application Fee:</strong> {{ estimatedFee }} USD</p>
            </div>

            <div class="review-section">
              <h4>Sponsors</h4>
              <ul>
                <li *ngFor="let sponsor of sponsorsArray.controls">
                  {{ sponsor.get('name')?.value }} ({{ sponsor.get('email')?.value }})
                </li>
              </ul>
            </div>

            <div class="review-section terms">
              <form [formGroup]="gradeForm">
                <label>
                  <input type="checkbox" formControlName="agreeTerms" />
                  <span>I certify that the information provided is accurate and complete</span>
                </label>
              </form>
            </div>

            <div class="step-buttons">
              <button matStepperPrevious type="button" class="btn-secondary">Back</button>
              <button (click)="submitApplication()" type="button" class="btn-primary" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
              </button>
            </div>

            <div class="success-message" *ngIf="successMessage">{{ successMessage }}</div>
            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 100%;
      width: 100%;
      margin: 20px 0 40px 0;
      padding: 30px;
    }

    h1 {
      color: #004A59;
      text-align: center;
      margin-bottom: 30px;
      font-weight: 700;
      font-size: 28px;
    }

    .step-content {
      padding: 20px 0;
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

    textarea.form-input {
      min-height: 100px;
      resize: vertical;
    }

    .education-item, .experience-item, .sponsor-item {
      border: 2.5px solid #004A59;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;

      h4 {
        color: #004A59;
        margin-top: 0;
      }
    }

    .upload-zone {
      border: 2.5px dashed #004A59;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      background-color: #f5f5f5;

      input[type="file"] {
        display: none;
      }

      p {
        margin: 0;
        color: #666;
      }
    }

    .grade-info {
      border: 2.5px solid #B99532;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      background-color: #fafaf5;

      p {
        margin: 0 0 10px 0;
        color: #004A59;
        font-weight: 600;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 5px;
        }
      }
    }

    .review-content {
      padding: 20px 0;
    }

    .review-section {
      border: 2.5px solid #004A59;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;

      h4 {
        color: #004A59;
        margin-top: 0;
      }

      p {
        margin: 5px 0;
      }

      ul {
        margin: 10px 0;
        padding-left: 20px;
      }
    }

    .terms {
      label {
        display: flex;
        align-items: center;
        font-weight: normal;

        input {
          margin-right: 10px;
        }
      }
    }

    .step-buttons {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 8px;
      border: 2.5px solid;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-primary {
      background-color: #004A59;
      color: white;
      border-color: #004A59;

      &:hover:not(:disabled) {
        background-color: darken(#004A59, 10%);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background-color: #FFFFFF;
      color: #004A59;
      border-color: #004A59;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .error-message {
      color: #d32f2f;
      margin-top: 15px;
      padding: 10px;
      background-color: #ffebee;
      border: 1px solid #d32f2f;
      border-radius: 4px;
    }

    .success-message {
      color: #388e3c;
      margin-top: 15px;
      padding: 10px;
      background-color: #e8f5e9;
      border: 1px solid #388e3c;
      border-radius: 4px;
    }

    .info-text {
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }
  `]
})
export class FormM1Component implements OnInit {
  personalParticularsForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  gradeForm!: FormGroup;
  sponsorsForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  estimatedFee = 0;
  selectedGradeRequirements: any = null;
  
  // File handling properties
  uploadedFiles: {
    nationalIdCopy?: File;
    certificates: File[];
    technicalReport?: File;
  } = {
    certificates: [],
  };
  uploadedFileNames: {
    nationalIdCopy?: string;
    certificates: string[];
    technicalReport?: string;
  } = {
    certificates: [],
  };

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    this.personalParticularsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      nationalId: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      professionalNumber: [''],
    });

    this.educationForm = this.fb.group({
      education: this.fb.array([this.createEducationGroup()]),
    });

    this.experienceForm = this.fb.group({
      experience: this.fb.array([this.createExperienceGroup()]),
    });

    this.gradeForm = this.fb.group({
      chosenGrade: ['', Validators.required],
      chosenSpecialistDivision: ['', Validators.required],
    });

    this.sponsorsForm = this.fb.group({
      sponsors: this.fb.array([this.createSponsorGroup(), this.createSponsorGroup(), this.createSponsorGroup()]),
      agreeTerms: [false, Validators.requiredTrue],
    });
  }

  createEducationGroup(): FormGroup {
    return this.fb.group({
      institution: ['', Validators.required],
      qualification: ['', Validators.required],
      year: ['', Validators.required],
      major: [''],
    });
  }

  createExperienceGroup(): FormGroup {
    return this.fb.group({
      company: ['', Validators.required],
      position: ['', Validators.required],
      startYear: ['', Validators.required],
      endYear: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  createSponsorGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get educationArray(): FormArray {
    return this.educationForm.get('education') as FormArray;
  }

  get experienceArray(): FormArray {
    return this.experienceForm.get('experience') as FormArray;
  }

  get sponsorsArray(): FormArray {
    return this.sponsorsForm.get('sponsors') as FormArray;
  }

  addEducation(): void {
    this.educationArray.push(this.createEducationGroup());
  }

  removeEducation(index: number): void {
    this.educationArray.removeAt(index);
  }

  addExperience(): void {
    this.experienceArray.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    this.experienceArray.removeAt(index);
  }

  addSponsor(): void {
    if (this.sponsorsArray.length < 3) {
      this.sponsorsArray.push(this.createSponsorGroup());
    }
  }

  removeSponsor(index: number): void {
    this.sponsorsArray.removeAt(index);
  }

  onGradeChange(): void {
    const grade = this.gradeForm.get('chosenGrade')?.value;
    this.estimatedFee = this.getFeByGrade(grade);
    this.selectedGradeRequirements = this.getGradeRequirements(grade);
  }

  /**
   * Calculate auto-grade based on education level and years of experience
   */
  calculateAutoGrade(): void {
    const educationArray = this.educationForm.get('education') as FormArray;
    const experienceArray = this.experienceForm.get('experience') as FormArray;

    if (educationArray.length === 0 || experienceArray.length === 0) {
      return;
    }

    // Get highest education level
    const qualifications = educationArray.controls.map(edu => edu.get('qualification')?.value || '');
    const highestQualification = this.getHighestEducationLevel(qualifications);

    // Calculate years of experience
    const yearsOfExperience = this.calculateYearsOfExperience();

    // Determine grade based on education and experience
    let suggestedGrade = 'Student';

    if (highestQualification.includes('Honours') && yearsOfExperience >= 3) {
      suggestedGrade = 'Member';
    } else if (highestQualification.includes('Diploma') && yearsOfExperience >= 3) {
      suggestedGrade = 'Technician';
    } else if (highestQualification.includes('Degree') && yearsOfExperience >= 5) {
      suggestedGrade = 'Technologist';
    } else if (yearsOfExperience >= 10) {
      suggestedGrade = 'Fellow';
    } else if (yearsOfExperience >= 2) {
      suggestedGrade = 'Graduate Member';
    }

    // Auto-set the grade if not already set
    if (!this.gradeForm.get('chosenGrade')?.value) {
      this.gradeForm.patchValue({ chosenGrade: suggestedGrade });
      this.onGradeChange();
    }

    console.log(`Auto-calculated grade: ${suggestedGrade} (Education: ${highestQualification}, Experience: ${yearsOfExperience} years)`);
  }

  /**
   * Get the highest education level from qualifications
   */
  private getHighestEducationLevel(qualifications: string[]): string {
    const levels = {
      'Honours': 4,
      'Degree': 3,
      'Diploma': 2,
      'Certificate': 1,
    };

    let highest = 'Certificate';
    let highestScore = 0;

    qualifications.forEach(qual => {
      Object.entries(levels).forEach(([level, score]) => {
        if (qual.toLowerCase().includes(level.toLowerCase()) && score > highestScore) {
          highest = level;
          highestScore = score;
        }
      });
    });

    return highest;
  }

  /**
   * Calculate total years of experience
   */
  private calculateYearsOfExperience(): number {
    const experienceArray = this.experienceForm.get('experience') as FormArray;
    let totalYears = 0;

    experienceArray.controls.forEach(exp => {
      const startYear = parseInt(exp.get('startYear')?.value || '0', 10);
      const endYearStr = exp.get('endYear')?.value || new Date().getFullYear().toString();
      const endYear = endYearStr.toLowerCase() === 'present' ? new Date().getFullYear() : parseInt(endYearStr, 10);

      if (startYear > 0 && endYear >= startYear) {
        totalYears += endYear - startYear;
      }
    });

    return totalYears;
  }

  getFeByGrade(grade: string): number {
    const fees: { [key: string]: number } = {
      'Student': 45,
      'Graduate': 50,
      'Technician': 45,
      'Technologist': 50,
      'Member': 60,
      'Fellow': 60,
    };
    return fees[grade] || 45;
  }

  getGradeRequirements(grade: string): any {
    const requirements: { [key: string]: any } = {
      'Student': { minYearsExperience: 0, requiresDiploma: false, requiresTechnicalReport: false, baseFee: 45 },
      'Graduate': { minYearsExperience: 0, requiresDiploma: false, requiresTechnicalReport: false, baseFee: 50 },
      'Technician': { minYearsExperience: 3, requiresDiploma: true, requiresTechnicalReport: false, baseFee: 45 },
      'Technologist': { minYearsExperience: 3, requiresDiploma: true, requiresTechnicalReport: false, baseFee: 50 },
      'Member': { minYearsExperience: 5, requiresDiploma: false, requiresTechnicalReport: true, baseFee: 60 },
      'Fellow': { minYearsExperience: 10, requiresDiploma: false, requiresTechnicalReport: true, baseFee: 60 },
    };
    return requirements[grade];
  }

  onFileSelected(event: any, fieldName: string): void {
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }

    // Validate PDF files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (file.type !== 'application/pdf') {
        this.errorMessage = `${file.name} is not a PDF file. Please upload PDF files only.`;
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = `${file.name} is larger than 5MB. Please upload smaller files.`;
        return;
      }
    }

    // Store files based on field name
    if (fieldName === 'nationalIdCopy') {
      this.uploadedFiles.nationalIdCopy = files[0];
      this.uploadedFileNames.nationalIdCopy = files[0].name;
    } else if (fieldName === 'certificates') {
      this.uploadedFiles.certificates = Array.from(files);
      this.uploadedFileNames.certificates = Array.from(files).map(f => (f as File).name);
    } else if (fieldName === 'technicalReport') {
      this.uploadedFiles.technicalReport = files[0];
      this.uploadedFileNames.technicalReport = files[0].name;
    }

    this.errorMessage = '';
  }

  submitApplication(): void {
    if (!this.personalParticularsForm.valid || !this.gradeForm.valid || !this.sponsorsForm.valid) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const applicationData = {
      personalParticulars: this.personalParticularsForm.value,
      education: this.educationForm.get('education')?.value,
      experience: this.experienceForm.get('experience')?.value,
      chosenGrade: this.gradeForm.get('chosenGrade')?.value,
      chosenSpecialistDivision: this.gradeForm.get('chosenSpecialistDivision')?.value,
      sponsors: this.sponsorsForm.get('sponsors')?.value,
    };

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add individual form fields to FormData (multer processes files, fields are passed separately)
    formData.append('personalParticulars', JSON.stringify(applicationData.personalParticulars));
    formData.append('education', JSON.stringify(applicationData.education));
    formData.append('experience', JSON.stringify(applicationData.experience));
    formData.append('chosenGrade', applicationData.chosenGrade);
    formData.append('chosenSpecialistDivision', applicationData.chosenSpecialistDivision);
    formData.append('sponsors', JSON.stringify(applicationData.sponsors));
    
    // Add files
    if (this.uploadedFiles.nationalIdCopy) {
      formData.append('nationalIdCopy', this.uploadedFiles.nationalIdCopy);
    }
    
    if (this.uploadedFiles.certificates && this.uploadedFiles.certificates.length > 0) {
      this.uploadedFiles.certificates.forEach(cert => {
        formData.append('certificateFiles', cert);
      });
    }
    
    if (this.uploadedFiles.technicalReport) {
      formData.append('technicalReport', this.uploadedFiles.technicalReport);
    }

    this.applicationService.submitApplicationWithFiles(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage =
          'Application submitted successfully! You will receive confirmation emails shortly.';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to submit application. Please try again.';
      },
    });
  }
}
