import mongoose, { Schema, Document } from 'mongoose';

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
  chosenSpecialistDivision: string;
  applicationFee: number;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Pending' | 'Interview Required' | 'Rejected';
  documents: {
    nationalIdCopy: string;
    certificates: string[];
    technicalReport?: string;
    organogram?: string;
  };
  sponsors: Array<{
    name: string;
    email: string;
    token?: string;
    appraisalResponse?: {
      question1: string;
      question2: string;
      question3: string;
      question4: string;
      question5: string;
      question6: string;
      question7: string;
      question8: string;
      submittedAt: Date;
    };
    responseFlags: string[];
  }>;
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
    chosenSpecialistDivision: {
      type: String,
      required: true,
    },
    applicationFee: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Pending', 'Interview Required', 'Rejected'],
      default: 'Draft',
    },
    documents: {
      nationalIdCopy: String,
      certificates: [String],
      technicalReport: String,
      organogram: String,
    },
    sponsors: [
      {
        name: String,
        email: String,
        token: String,
        appraisalResponse: {
          question1: String,
          question2: String,
          question3: String,
          question4: String,
          question5: String,
          question6: String,
          question7: String,
          question8: String,
          submittedAt: Date,
        },
        responseFlags: {
          type: [String],
          default: ['Confidential'],
        },
      },
    ],
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
