import mongoose, { Schema, Document } from 'mongoose';

export interface AdminChecklist {
  photo: boolean;
  m1Form: boolean;
  signature: boolean;
  trainingReport: boolean;
  projectReport: boolean;
  organogram: boolean;
  sponsorships: boolean;
  certificates: boolean;
}

export interface SponsorAppraisal {
  sponsorEmail: string;
  sponsorName: string;
  appraisalToken: string;
  responses?: {
    question1: string;
    question2: string;
    question3: string;
    question4: string;
    question5: string;
    question6: string;
    question7: string;
    question8: string;
  };
  submittedAt?: Date;
  isConfidential: boolean;
}

export interface IEducation {
  institution: string;
  qualification: string;
  year: number;
  major?: string;
}

export interface IExperience {
  company: string;
  position: string;
  startYear: number;
  endYear: number;
  description: string;
}

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  userSummary: string;
  personalParticulars: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationalId: string;
    dateOfBirth: Date;
    nationality: string;
    professionalNumber?: string;
  };
  education: IEducation[];
  experience: IExperience[];
  chosenGrade: 'Student' | 'Graduate' | 'Technician' | 'Technologist' | 'Member' | 'Fellow';
  suggestedGrade: 'Student' | 'Graduate' | 'Technician' | 'Technologist' | 'Member' | 'Fellow';
  chosenSpecialistDivision: string;
  suggestedDivision: string;
  applicationFee: number;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Pending' | 'Interview Required' | 'Rejected' | 'Approved with Conditions';
  documents: {
    nationalIdCopy: string;
    certificates: string[];
    technicalReport?: string;
    organogram?: string;
  };
  uploadedFiles: {
    nationalIdPath?: string;         // Path to uploaded National ID PDF
    certificatePaths: string[];      // Paths to uploaded Certificate PDFs
  };
  sponsors: SponsorAppraisal[];
  adminChecklist: AdminChecklist;
  adminNotes: string;
  confidentialFlag: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userSummary: {
      type: String,
      default: '',
    },
    personalParticulars: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      nationalId: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      nationality: { type: String, required: true },
      professionalNumber: { type: String },
    },
    education: [
      {
        institution: String,
        qualification: String,
        year: Number,
        major: String,
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        startYear: Number,
        endYear: Number,
        description: String,
      },
    ],
    chosenGrade: {
      type: String,
      enum: ['Student', 'Graduate', 'Technician', 'Technologist', 'Member', 'Fellow'],
      required: true,
    },
    suggestedGrade: {
      type: String,
      enum: ['Student', 'Graduate', 'Technician', 'Technologist', 'Member', 'Fellow'],
      default: 'Graduate',
    },
    chosenSpecialistDivision: {
      type: String,
      required: true,
    },
    suggestedDivision: {
      type: String,
      default: '',
    },
    applicationFee: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Pending', 'Interview Required', 'Rejected', 'Approved with Conditions'],
      default: 'Draft',
    },
    documents: {
      nationalIdCopy: String,
      certificates: [String],
      technicalReport: String,
      organogram: String,
    },
    uploadedFiles: {
      nationalIdPath: { type: String },
      certificatePaths: { type: [String], default: [] },
    },
    sponsors: [
      {
        sponsorEmail: String,
        sponsorName: String,
        appraisalToken: String,
        responses: {
          question1: String,
          question2: String,
          question3: String,
          question4: String,
          question5: String,
          question6: String,
          question7: String,
          question8: String,
        },
        submittedAt: Date,
        isConfidential: { type: Boolean, default: true },
      },
    ],
    adminChecklist: {
      photo: { type: Boolean, default: false },
      m1Form: { type: Boolean, default: false },
      signature: { type: Boolean, default: false },
      trainingReport: { type: Boolean, default: false },
      projectReport: { type: Boolean, default: false },
      organogram: { type: Boolean, default: false },
      sponsorships: { type: Boolean, default: false },
      certificates: { type: Boolean, default: false },
    },
    adminNotes: { type: String, default: '' },
    confidentialFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save middleware to generate user summary
applicationSchema.pre('save', function (next) {
  if (this.personalParticulars && this.chosenGrade && this.chosenSpecialistDivision) {
    const { firstName, lastName } = this.personalParticulars;
    this.userSummary = `${firstName} ${lastName} - Applicant for ${this.chosenGrade} Grade in ${this.chosenSpecialistDivision} Division`;
  }
  next();
});

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
