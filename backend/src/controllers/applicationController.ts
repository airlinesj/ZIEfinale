import { Response } from 'express';
import { Application } from '../models/Application';
import { MembershipGrade } from '../models/MembershipGrade';
import { AuthRequest } from '../middleware/auth';
import { calculateApplicationFee } from '../middleware/feeCalculation';
import { sendSponsorAppraisalEmail, sendApplicationConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import GradingService from '../services/GradingService';
import DivisionMappingService from '../services/DivisionMappingService';
import AdminVerificationService from '../services/AdminVerificationService';
import { deleteUploadedFile } from '../middleware/fileUpload';

export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== Creating Application ===');
    console.log('User ID:', req.userId);
    console.log('Request Files:', (req.files as any)?.nationalIdCopy ? 'Yes' : 'No');
    
    // Verify user is authenticated
    if (!req.userId) {
      console.error('User ID is missing - authentication may have failed');
      return res.status(401).json({ message: 'User authentication required. Please log in again.' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
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
      console.log('Parsing FormData payload');
      personalParticulars = JSON.parse(req.body.personalParticulars);
      education = req.body.education ? JSON.parse(req.body.education) : [];
      experience = req.body.experience ? JSON.parse(req.body.experience) : [];
      chosenGrade = req.body.chosenGrade;
      chosenSpecialistDivision = req.body.chosenSpecialistDivision;
      sponsors = req.body.sponsors ? JSON.parse(req.body.sponsors) : [];
    } else {
      // Regular JSON payload
      console.log('Parsing JSON payload');
      personalParticulars = req.body.personalParticulars;
      education = req.body.education;
      experience = req.body.experience;
      chosenGrade = req.body.chosenGrade;
      chosenSpecialistDivision = req.body.chosenSpecialistDivision;
      sponsors = req.body.sponsors;
    }

    console.log('Parsed Data:', { personalParticulars, chosenGrade, sponsorsCount: sponsors?.length });

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
      sponsorName: sponsor.name || sponsor.sponsorName,
      sponsorEmail: sponsor.email || sponsor.sponsorEmail,
      appraisalToken: crypto.randomBytes(32).toString('hex'),
      isConfidential: true,
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
        technicalReportPath: (req.files as any)?.technicalReport?.[0]?.filename || '',
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
      try {
        await sendSponsorAppraisalEmail({
          applicantName: `${personalParticulars.firstName} ${personalParticulars.lastName}`,
          applicantEmail: personalParticulars.email,
          sponsorName: sponsor.sponsorName,
          sponsorEmail: sponsor.sponsorEmail,
          applicationId: application._id.toString(),
          sponsorToken: sponsor.appraisalToken,
        });
      } catch (error) {
        console.error(`Error sending sponsor email to ${sponsor.email}:`, error);
        // Don't fail the submission if sponsor email fails
      }
    }

    // Send admin notification email with attached PDFs
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zie.org.zw';
    try {
      await sendAdminNotificationEmail(
        adminEmail,
        `${personalParticulars.firstName} ${personalParticulars.lastName}`,
        application._id.toString(),
        application.uploadedFiles
      );
    } catch (error) {
      console.error('Error sending admin notification:', error);
      // Don't fail the submission if admin email fails
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
  } catch (error: any) {
    console.error('=== Error creating application ===');
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    
    // Clean up uploaded files if application creation fails
    if ((req.files as any)?.nationalIdCopy?.[0]?.filename) {
      deleteUploadedFile((req.files as any).nationalIdCopy[0].filename);
    }
    if ((req.files as any)?.certificateFiles) {
      (req.files as any).certificateFiles.forEach((file: any) => {
        deleteUploadedFile(file.filename);
      });
    }
    if ((req.files as any)?.technicalReport?.[0]?.filename) {
      deleteUploadedFile((req.files as any).technicalReport[0].filename);
    }
    
    // Return error response with safe, serializable data
    const errorResponse = {
      message: error?.message || 'Failed to create application',
      error: error?.message || 'Unknown error',
    };
    
    res.status(500).json(errorResponse);
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

/**
 * Upload payment proof for an application
 */
export const uploadPaymentProof = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the application
    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get the uploaded file
    const paymentProofFile = (req.files as any)?.nationalIdCopy?.[0];
    
    if (!paymentProofFile) {
      return res.status(400).json({ message: 'No payment proof file provided' });
    }

    // Update payment proof in application
    application.paymentProof = {
      filePath: paymentProofFile.filename,
      uploadedAt: new Date(),
      verificationStatus: 'pending',
    };

    await application.save();

    res.json({
      message: 'Payment proof uploaded successfully',
      paymentProof: {
        filePath: paymentProofFile.filename,
        uploadedAt: application.paymentProof.uploadedAt,
        verificationStatus: 'pending',
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Verify payment proof (admin only)
 */
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { verified, rejectionReason } = req.body;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!application.paymentProof) {
      return res.status(400).json({ message: 'No payment proof found for this application' });
    }

    // Update payment verification status
    application.paymentProof.verificationStatus = verified ? 'verified' : 'rejected';
    application.paymentProof.verifiedAt = new Date();
    application.paymentProof.verifiedBy = req.userId;
    
    if (!verified && rejectionReason) {
      application.paymentProof.rejectionReason = rejectionReason;
    }

    await application.save();

    // Send email notification to applicant
    if (verified) {
      await sendApplicationConfirmationEmail(
        application.personalParticulars.email,
        `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
        `Your payment of $${application.applicationFee} has been verified. Your application will now proceed to review.`
      );
    } else {
      await sendApplicationConfirmationEmail(
        application.personalParticulars.email,
        `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
        `Your payment proof was rejected. Reason: ${rejectionReason || 'Please contact admin for details.'} Please resubmit a valid payment proof.`
      );
    }

    res.json({
      message: verified ? 'Payment verified successfully' : 'Payment verification rejected',
      paymentProof: application.paymentProof
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
