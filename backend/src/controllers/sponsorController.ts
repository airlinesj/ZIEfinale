import { Response } from 'express';
import { Application } from '../models/Application';
import { AuthRequest } from '../middleware/auth';

export const submitSponsorAppraisal = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    const { question1, question2, question3, question4, question5, question6, question7, question8 } =
      req.body;

    // Find application by sponsor token
    const application = await Application.findOne({ 'sponsors.token': token });

    if (!application) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    // Find the sponsor and update response
    const sponsor = application.sponsors.find((s: any) => s.token === token);
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    sponsor.appraisalResponse = {
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      question7,
      question8,
      submittedAt: new Date(),
    };

    sponsor.responseFlags = ['Confidential'];

    await application.save();

    res.json({
      message: 'Appraisal submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting appraisal:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSponsorAppraisal = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;

    const application = await Application.findOne({ 'sponsors.token': token }).select(
      'personalParticulars chosenGrade sponsors'
    );

    if (!application) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    const sponsor = application.sponsors.find((s: any) => s.token === token);
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    res.json({
      applicantName: `${application.personalParticulars.firstName} ${application.personalParticulars.lastName}`,
      grade: application.chosenGrade,
      hasResponded: !!sponsor.appraisalResponse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
