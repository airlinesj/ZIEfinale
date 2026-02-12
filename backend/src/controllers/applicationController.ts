import { Response } from 'express';
import { Application } from '../models/Application';
import { MembershipGrade } from '../models/MembershipGrade';
import { AuthRequest } from '../middleware/auth';
import { calculateApplicationFee } from '../middleware/feeCalculation';
import { sendSponsorAppraisalEmail, sendApplicationConfirmationEmail, sendInterviewNotificationEmail, sendStatusUpdateEmail } from '../services/emailService';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import GradingService from '../services/GradingService';
import DivisionMappingService from '../services/DivisionMappingService';
import AdminVerificationService from '../services/AdminVerificationService';
import RegistrationNumberService from '../services/RegistrationNumberService';
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
    console.log('📧 [SPONSOR DATA] Received sponsors from request:');
    console.log('   Raw sponsors:', JSON.stringify(sponsors));
    
    const processedSponsors = sponsors.map((sponsor: any) => ({
      sponsorName: sponsor.name || sponsor.sponsorName,
      sponsorEmail: sponsor.email || sponsor.sponsorEmail,
      appraisalToken: crypto.randomBytes(32).toString('hex'),
      isConfidential: true,
    }));

    console.log('📧 [SPONSOR DATA] Processed sponsors:');
    processedSponsors.forEach((s: any, i: number) => {
      console.log(`   Sponsor ${i + 1}: "${s.sponsorName}" <${s.sponsorEmail}>`);
    });

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
    console.log('📧 [EMAIL SENDING] Starting sponsor email send process...');
    console.log('   Total sponsors to email:', processedSponsors.length);
    
    const emailResults = [];
    for (const sponsor of processedSponsors) {
      try {
        console.log(`📧 [EMAIL SENDING] Sending to: "${sponsor.sponsorName}" <${sponsor.sponsorEmail}>`);
        const result = await sendSponsorAppraisalEmail({
          applicantName: `${personalParticulars.firstName} ${personalParticulars.lastName}`,
          applicantEmail: personalParticulars.email,
          sponsorName: sponsor.sponsorName,
          sponsorEmail: sponsor.sponsorEmail,
          applicationId: application._id.toString(),
          sponsorToken: sponsor.appraisalToken,
        });
        emailResults.push({
          sponsorEmail: sponsor.sponsorEmail,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
        console.log(`📧 [EMAIL SENDING] Result for ${sponsor.sponsorEmail}:`, result.success ? '✓ SUCCESS' : '✗ FAILED', result.error || result.messageId);
      } catch (error) {
        console.error(`❌ [EMAIL SENDING] Exception sending to ${sponsor.sponsorEmail}:`, error);
        emailResults.push({
          sponsorEmail: sponsor.sponsorEmail,
          success: false,
          error: String(error)
        });
      }
    }
    console.log('📧 [EMAIL SENDING] Completed. Summary:', emailResults);

    // Send admin notification email with attached PDFs
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zie.org.zw';
    try {
      // Admin notification for new application submitted
      await sendApplicationConfirmationEmail(
        adminEmail,
        'Admin',
        application._id.toString()
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
      emailStatus: {
        sponsorEmailsSent: emailResults,
        totalSent: emailResults.filter((r: any) => r.success).length,
        totalFailed: emailResults.filter((r: any) => !r.success).length,
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
    const { status, rejectionReason } = req.body;

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
          : application.status === 'Rejected' && status === 'Submitted'
          ? 'The 24-hour editing window for this application has expired'
          : 'Invalid status transition'
      });
    }

    const oldStatus = application.status;
    application.status = status;

    // If rejecting, set rejection info with 24-hour edit window
    if (status === 'Rejected') {
      const now = new Date();
      const allowEditUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      // Get admin info from auth
      const admin = await (await require('mongoose').model('User')).findById(req.userId);
      
      application.rejectionInfo = {
        rejectionTimestamp: now,
        rejectionReason: rejectionReason || 'Application not meeting requirements',
        rejectedBy: req.userId as any,
        rejectedByEmail: admin?.email || '',
        rejectedByName: admin?.username || 'Admin',
        allowEditUntil: allowEditUntil,
      };
    }

    // If re-submitting after rejection, clear rejection info
    if (oldStatus === 'Rejected' && status === 'Submitted') {
      application.rejectionInfo = undefined;
    }

    await application.save();

    // Send status update email to applicant
    try {
      let customMessage;
      if (status === 'Rejected') {
        customMessage = `Your application has been rejected. Reason: ${application.rejectionInfo?.rejectionReason}. You have 24 hours to make corrections and re-submit your application.`;
      } else if (oldStatus === 'Rejected' && status === 'Submitted') {
        customMessage = 'Your updated application has been received and will be reviewed by the admin team.';
      }
      
      await sendStatusUpdateEmail(
        application.personalParticulars.email,
        `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
        status,
        customMessage
      );
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the request if email fails
    }

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
    console.log('📤 [PAYMENT PROOF] File upload attempt');
    console.log('   Files received:', req.file ? 'Yes' : 'No');
    console.log('   File details:', req.file ? { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size } : 'None');
    
    const { id } = req.params;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the application
    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get the uploaded file from req.file (single file upload)
    const paymentProofFile = req.file;
    
    if (!paymentProofFile) {
      console.error('❌ [PAYMENT PROOF] No file provided in request');
      return res.status(400).json({ message: 'No payment proof file provided' });
    }

    // Update payment proof in application
    application.paymentProof = {
      filePath: paymentProofFile.filename,
      uploadedAt: new Date(),
      verificationStatus: 'pending',
    };

    await application.save();
    console.log('✓ [PAYMENT PROOF] Upload successful:', paymentProofFile.filename);

    res.json({
      message: 'Payment proof uploaded successfully',
      paymentProof: {
        filePath: paymentProofFile.filename,
        uploadedAt: application.paymentProof.uploadedAt,
        verificationStatus: 'pending',
      }
    });
  } catch (error: any) {
    console.error('❌ [PAYMENT PROOF] Upload error:', error?.message || error);
    res.status(500).json({ message: 'Server error', error: error?.message });
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
        application._id.toString()
      );
    } else {
      await sendApplicationConfirmationEmail(
        application.personalParticulars.email,
        `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
        application._id.toString()
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

// Process payment (dummy payment)
export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body; // dummy payment method

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify applicant is the owner
    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Process dummy payment (always succeeds)
    application.paymentStatus = 'completed';
    application.paymentDate = new Date();
    application.status = 'Submitted'; // Move to Submitted status after payment
    await application.save();

    res.json({
      message: 'Payment processed successfully',
      paymentStatus: application.paymentStatus,
      paymentDate: application.paymentDate,
      applicationId: application._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Set manual grade and division by admin
export const setManualGrade = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { grade, division, notes } = req.body;

    console.log('setManualGrade called with ID:', id);
    console.log('User role:', req.userRole);

    // Verify admin user
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can set manual grades' });
    }

    // Get admin info
    const { User } = require('../models/User');
    const admin = await User.findById(req.userId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const application = await Application.findById(id);
    console.log('Application found:', !!application);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Set manual grade
    application.manualGrade = {
      grade,
      division,
      setBy: req.userId as any,
      setByEmail: admin.email,
      setByName: admin.username,
      setAt: new Date(),
      notes,
    };

    await application.save();

    res.json({
      message: 'Manual grade set successfully',
      manualGrade: application.manualGrade,
    });
  } catch (error) {
    console.error('Error in setManualGrade:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add admin approval for interview
export const addAdminApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify admin user
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can approve interviews' });
    }

    // Get admin info
    const { User } = require('../models/User');
    const admin = await User.findById(req.userId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if admin already approved
    const alreadyApproved = application.adminApprovals.some(
      (approval: any) => approval.adminId.toString() === req.userId
    );

    if (alreadyApproved) {
      return res.status(400).json({ message: 'Admin has already approved this application' });
    }

    // Add approval
    application.adminApprovals.push({
      adminId: req.userId as any,
      adminEmail: admin.email,
      adminName: admin.username,
      approvedAt: new Date(),
    });

    // If 3 approvals reached, set status to Interview Required and send email
    if (application.adminApprovals.length >= 3) {
      application.status = 'Interview Required';
      
      // Send interview invitation email
      await sendApplicationConfirmationEmail(
        application.personalParticulars.email,
        `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
        application._id.toString()
      );
    }

    await application.save();

    res.json({
      message: 'Approval added successfully',
      approvalsCount: application.adminApprovals.length,
      status: application.status,
      adminApprovals: application.adminApprovals,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Send interview notification to applicant
export const sendInterviewNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message: notificationMessage } = req.body;

    // Verify admin user
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can send interview notifications' });
    }

    // Get admin info
    const { User } = require('../models/User');
    const admin = await User.findById(req.userId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Set interview notification
    application.interviewNotification = {
      sentAt: new Date(),
      sentBy: req.userId as any,
      sentByEmail: admin.email,
      sentByName: admin.username,
      message: notificationMessage,
    };

    await application.save();

    // Send email to applicant with proper interview notification template
    try {
      await sendInterviewNotificationEmail(
        application.personalParticulars.email,
        `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
        notificationMessage
      );
    } catch (emailError) {
      console.error('Failed to send interview notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Interview notification sent successfully',
      interviewNotification: application.interviewNotification,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update sponsors and send emails
export const updateSponsors = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sponsors } = req.body;

    if (!sponsors || !Array.isArray(sponsors)) {
      return res.status(400).json({ message: 'Sponsors must be an array' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the user owns this application
    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You do not have permission to update this application' });
    }

    // Create sponsors with tokens
    const processedSponsors = sponsors.map((sponsor: any) => ({
      sponsorName: sponsor.name || sponsor.sponsorName,
      sponsorEmail: sponsor.email || sponsor.sponsorEmail,
      appraisalToken: crypto.randomBytes(32).toString('hex'),
      isConfidential: true,
    }));

    // Update sponsors
    application.sponsors = processedSponsors;
    await application.save();

    // Send appraisal emails to new sponsors
    for (const sponsor of processedSponsors) {
      try {
        await sendSponsorAppraisalEmail({
          applicantName: `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
          applicantEmail: application.personalParticulars.email,
          sponsorName: sponsor.sponsorName,
          sponsorEmail: sponsor.sponsorEmail,
          applicationId: application._id.toString(),
          sponsorToken: sponsor.appraisalToken,
        });
      } catch (error) {
        console.error(`Error sending sponsor email to ${sponsor.sponsorEmail}:`, error);
        // Don't fail the update if sponsor email fails
      }
    }

    res.json({
      message: 'Sponsors updated and notifications sent successfully',
      sponsors: processedSponsors,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get certificate data for passed interview applicant
export const getCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify user owns this application or is admin
    if (application.userId.toString() !== req.userId && req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if interview has been passed and registration number exists
    if (application.status !== 'Passed' || !application.registrationNumber) {
      return res.status(400).json({ 
        message: 'Certificate is only available after passing the interview' 
      });
    }

    const certificateData = {
      name: `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
      registrationNumber: application.registrationNumber,
      grade: application.chosenGrade,
      division: application.chosenSpecialistDivision,
      interviewPassedDate: application.interviewPassedDate,
      issuedDate: new Date(),
    };

    res.json(certificateData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update status to "Passed" and generate registration number
export const passInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('=== Pass Interview Request ===');
    console.log('Application ID:', id);
    console.log('User Role:', req.userRole);
    console.log('User ID:', req.userId);

    // Verify admin user
    if (req.userRole !== 'Admin') {
      console.error('Non-admin user attempted to pass interview:', req.userRole);
      return res.status(403).json({ message: 'Only admins can mark interviews as passed' });
    }

    const application = await Application.findById(id);
    if (!application) {
      console.error('Application not found:', id);
      return res.status(404).json({ message: 'Application not found' });
    }

    console.log('Current status:', application.status);
    console.log('Current registration number:', application.registrationNumber);

    // Check if not already passed
    if (application.status === 'Passed') {
      console.warn('Interview already marked as passed');
      return res.status(400).json({ message: 'Interview already marked as passed' });
    }

    // Generate registration number if not already generated
    if (!application.registrationNumber) {
      console.log('Generating registration number...');
      const newRegNumber = await RegistrationNumberService.generateZIERegistrationNumber();
      console.log('Generated registration number:', newRegNumber);
      application.registrationNumber = newRegNumber;
    }

    application.status = 'Passed';
    application.interviewPassedDate = new Date();

    console.log('Saving application with status=Passed and registrationNumber=' + application.registrationNumber);
    await application.save();
    console.log('Application saved successfully');

    // Send email to applicant about passing interview
    try {
      console.log('Sending email to:', application.personalParticulars.email);
      await sendStatusUpdateEmail(
        application.personalParticulars.email,
        `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
        'Passed',
        `Congratulations! You have been registered as ZIE Professional Member with Registration Number: ${application.registrationNumber}`
      );
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Failed to send interview pass email:', emailError);
    }

    console.log('Returning response with:', {
      status: application.status,
      registrationNumber: application.registrationNumber,
      interviewPassedDate: application.interviewPassedDate,
    });

    res.json({
      message: 'Interview marked as passed successfully',
      application: {
        _id: application._id,
        status: application.status,
        registrationNumber: application.registrationNumber,
        interviewPassedDate: application.interviewPassedDate,
      },
    });
  } catch (error) {
    console.error('Error in passInterview:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
