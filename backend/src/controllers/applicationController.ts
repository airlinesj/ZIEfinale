import { Response } from 'express';
import { Application } from '../models/Application';
import { MembershipGrade } from '../models/MembershipGrade';
import { AuthRequest } from '../middleware/auth';
import { calculateApplicationFee } from '../middleware/feeCalculation';
import { sendSponsorAppraisalEmail, sendApplicationConfirmationEmail } from '../services/emailService';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      personalParticulars,
      education,
      experience,
      chosenGrade,
      chosenSpecialistDivision,
      sponsors,
    } = req.body;

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
    });

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
        name: sponsor.name,
        email: sponsor.email,
        responseFlags: sponsor.responseFlags,
        appraisalResponse: undefined,
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

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find().populate('userId', 'email');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
