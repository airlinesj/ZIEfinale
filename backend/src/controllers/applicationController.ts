import { Response } from 'express';
import { Application } from '../models/Application';
import { MembershipGrade } from '../models/MembershipGrade';
import { AuthRequest } from '../middleware/auth';
import { calculateApplicationFee } from '../middleware/feeCalculation';
import { sendSponsorAppraisalEmail, sendApplicationConfirmationEmail } from '../services/emailService';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import GradingService from '../services/GradingService';
import DivisionMappingService from '../services/DivisionMappingService';
import AdminVerificationService from '../services/AdminVerificationService';
import { deleteUploadedFile } from '../middleware/fileUpload';

export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Handle both JSON and FormData payloads
    let personalParticulars: any;
    let education: any;
    let experience: any;
    let chosenGrade: string;
    let chosenSpecialistDivision: string;
    let sponsors: any;

    // Parse FormData fields (they come as strings when sent via FormData)
    if (req.body.personalParticulars && typeof req.body.personalParticulars === 'string') {
      // FormData payload - fields are stringified JSON
      personalParticulars = JSON.parse(req.body.personalParticulars);
      education = req.body.education ? JSON.parse(req.body.education) : [];
      experience = req.body.experience ? JSON.parse(req.body.experience) : [];
      chosenGrade = req.body.chosenGrade;
      chosenSpecialistDivision = req.body.chosenSpecialistDivision;
      sponsors = req.body.sponsors ? JSON.parse(req.body.sponsors) : [];
    } else {
      // Regular JSON payload
      personalParticulars = req.body.personalParticulars;
      education = req.body.education;
      experience = req.body.experience;
      chosenGrade = req.body.chosenGrade;
      chosenSpecialistDivision = req.body.chosenSpecialistDivision;
      sponsors = req.body.sponsors;
    }

    // Get membership grade to verify requirements
    const grade = await MembershipGrade.findOne({ gradeName: chosenGrade });
    if (!grade) {
      return res.status(400).json({ message: 'Invalid membership grade' });
    }

    // Calculate application fee
    const exchangeRate = parseFloat(process.env.EXCHANGE_RATE || '0.015');
    const applicationFee = calculateApplicationFee(grade.baseFee, exchangeRate);

    // Create sponsors with tokens
    const processedSponsors = sponsors.map((sponsor: any) => ({
      ...sponsor,
      token: crypto.randomBytes(32).toString('hex'),
    }));

    // Create application
    const application = new Application({
      userId: req.userId,
      personalParticulars,
      education: education || [],
      experience: experience || [],
      chosenGrade,
      chosenSpecialistDivision,
      applicationFee,
      documents: {},
      sponsors: processedSponsors,
      uploadedFiles: {
        nationalIdPath: (req.files as any)?.nationalIdCopy?.[0]?.filename || '',
        certificatePaths: (req.files as any)?.certificateFiles?.map((f: any) => f.filename) || [],
      },
      userSummary: `Ready for Review: ${personalParticulars.firstName} ${personalParticulars.lastName} applied for ${chosenGrade}`,
    });

    // Auto-evaluate grade and division using services
    application.suggestedGrade = GradingService.evaluateGrade(application);
    application.suggestedDivision = DivisionMappingService.assignDivision(
      education && education[0]?.qualification ? education[0].qualification : chosenSpecialistDivision
    );

    await application.save();

    // Send confirmation email to applicant
    await sendApplicationConfirmationEmail(
      personalParticulars.email,
      `${personalParticulars.firstName} ${personalParticulars.lastName}`,
      application._id.toString()
    );

    // Send appraisal emails to sponsors
    for (const sponsor of processedSponsors) {
      await sendSponsorAppraisalEmail({
        applicantName: `${personalParticulars.firstName} ${personalParticulars.lastName}`,
        applicantEmail: personalParticulars.email,
        sponsorName: sponsor.name,
        sponsorEmail: sponsor.email,
        applicationId: application._id.toString(),
        sponsorToken: sponsor.token,
      });
    }

    // Update status to Submitted
    application.status = 'Submitted';
    await application.save();

    res.status(201).json({
      message: 'Application created successfully',
      application: {
        id: application._id,
        status: application.status,
        applicationFee,
      },
    });
  } catch (error) {
    console.error('Error creating application:', error);
    
    // Clean up uploaded files if application creation fails
    if ((req.files as any)?.nationalIdCopy?.[0]?.filename) {
      deleteUploadedFile((req.files as any).nationalIdCopy[0].filename);
    }
    if ((req.files as any)?.certificateFiles) {
      (req.files as any).certificateFiles.forEach((file: any) => {
        deleteUploadedFile(file.filename);
      });
    }
    
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getApplicationByUser = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find({ userId: req.userId });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the application or is admin
    if (application.userId.toString() !== req.userId && req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Hide sponsor responses from applicant view
    if (req.userRole !== 'Admin') {
      application.sponsors = application.sponsors.map((sponsor: any) => ({
        sponsorName: sponsor.sponsorName,
        sponsorEmail: sponsor.sponsorEmail,
        appraisalToken: sponsor.appraisalToken,
        isConfidential: sponsor.isConfidential,
      }));
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Validate status transition
    if (!AdminVerificationService.isValidStatusTransition(application.status, status, application)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${application.status} to ${status}`,
        reason: status === 'Approved' && !AdminVerificationService.canApprove(application) 
          ? 'All checklist items must be verified before approval'
          : 'Invalid status transition'
      });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find().populate('userId', 'email');
    
    // Enhance response with verification progress
    const applicationsWithProgress = applications.map(app => ({
      ...app.toObject(),
      verificationProgress: AdminVerificationService.getVerificationProgress(app),
      canApprove: AdminVerificationService.canApprove(app),
    }));

    res.json(applicationsWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Update admin checklist for an application
 * Only admins can update the checklist
 */
export const updateApplicationChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { photo, m1Form, signature, trainingReport, projectReport, organogram, sponsorships, certificates, adminNotes } = req.body;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update checklist items if provided
    if (photo !== undefined) application.adminChecklist.photo = photo;
    if (m1Form !== undefined) application.adminChecklist.m1Form = m1Form;
    if (signature !== undefined) application.adminChecklist.signature = signature;
    if (trainingReport !== undefined) application.adminChecklist.trainingReport = trainingReport;
    if (projectReport !== undefined) application.adminChecklist.projectReport = projectReport;
    if (organogram !== undefined) application.adminChecklist.organogram = organogram;
    if (sponsorships !== undefined) application.adminChecklist.sponsorships = sponsorships;
    if (certificates !== undefined) application.adminChecklist.certificates = certificates;
    if (adminNotes !== undefined) application.adminNotes = adminNotes;

    await application.save();

    const progress = AdminVerificationService.getVerificationProgress(application);
    const report = AdminVerificationService.generateVerificationReport(application);

    res.json({
      message: 'Checklist updated successfully',
      application,
      progress,
      report,
      canApprove: AdminVerificationService.canApprove(application),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Get detailed verification report for an application
 */
export const getVerificationReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const report = AdminVerificationService.generateVerificationReport(application);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Get application preview for admin with userSummary and PDF links
 */
export const getApplicationPreview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Build file URLs
    let nationalIdUrl = null;
    let certificateUrls: string[] = [];

    if (application.uploadedFiles?.nationalIdPath) {
      nationalIdUrl = `/api/uploads/${application.uploadedFiles.nationalIdPath}`;
    }

    if (application.uploadedFiles?.certificatePaths) {
      certificateUrls = application.uploadedFiles.certificatePaths.map(
        (path: string) => `/api/uploads/${path}`
      );
    }

    res.json({
      id: application._id,
      userSummary: application.userSummary || 'No summary available',
      personalInfo: {
        firstName: application.personalParticulars?.firstName,
        lastName: application.personalParticulars?.lastName,
        email: application.personalParticulars?.email,
      },
      grade: application.chosenGrade,
      division: application.chosenSpecialistDivision,
      applicationFee: application.applicationFee,
      status: application.status,
      uploadedDocuments: {
        nationalId: nationalIdUrl,
        certificates: certificateUrls,
      },
      adminChecklist: application.adminChecklist,
      adminNotes: application.adminNotes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
