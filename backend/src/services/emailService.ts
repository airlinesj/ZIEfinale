import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Check if SMTP is properly configured
const isSMTPConfigured = (): boolean => {
  const hasAllRequired = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const hasNoPlaceholders = !process.env.SMTP_USER?.includes('your_') && !process.env.SMTP_PASS?.includes('your_');
  return !!hasAllRequired && !!hasNoPlaceholders;
};

// Create transporter lazily - only when needed
let transporter: any = null;

const getTransporter = () => {
  if (!transporter) {
    console.log('🔧 [EMAIL SERVICE] Creating Nodemailer transporter...');
    console.log('   SMTP_HOST:', process.env.SMTP_HOST);
    console.log('   SMTP_PORT:', process.env.SMTP_PORT);
    console.log('   SMTP_USER:', process.env.SMTP_USER);
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export interface SponsorAppraisalRequest {
  applicantName: string;
  applicantEmail: string;
  sponsorName: string;
  sponsorEmail: string; 
  applicationId: string;
  sponsorToken: string;
}

export const sendSponsorAppraisalEmail = async (data: SponsorAppraisalRequest) => {
  console.log('📧 [EMAIL SERVICE] Attempting to send sponsor appraisal email...');
  console.log('   Sponsor Email:', data.sponsorEmail);
  console.log('   Sponsor Name:', data.sponsorName);
  console.log('   Applicant Name:', data.applicantName);
  
  // Validate SMTP configuration
  if (!isSMTPConfigured()) {
    console.error('⚠️ SMTP NOT CONFIGURED: Email credentials are placeholders. Check your .env file!');
    console.error('   Required: SMTP_HOST, SMTP_USER (real email), SMTP_PASS (real password)');
    console.error('   Current: SMTP_USER=' + process.env.SMTP_USER);
    return { success: false, error: 'SMTP not configured' };
  }

  // Validate sponsor email
  if (!isValidEmail(data.sponsorEmail)) {
    console.error(`⚠️ INVALID EMAIL FORMAT: "${data.sponsorEmail}" is not a valid email address`);
    return { success: false, error: 'Invalid email format' };
  }

  const reviewUrl = `${process.env.FRONTEND_URL}/sponsor-review/${data.sponsorToken}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: data.sponsorEmail,
    subject: `ZIE Member Appraisal - ${data.applicantName}`,
    html: `
      <h2>Zimbabwe Institution of Engineers - Sponsorship Appraisal</h2>
      <p>Dear ${data.sponsorName},</p>
      <p>${data.applicantName} has listed you as a sponsor for their membership application to the Zimbabwe Institution of Engineers.</p>
      <p>Please click the link below to provide your confidential appraisal:</p>
      <a href="${reviewUrl}" style="display: inline-block; padding: 10px 20px; background-color: #004A59; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        View Appraisal Form
      </a>
      <p style="color: #666; font-size: 12px;">Or copy this link: ${reviewUrl}</p>
      <p>This appraisal is confidential and will not be shared with the applicant.</p>
      <p>Best regards,<br/>Zimbabwe Institution of Engineers</p>
    `,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`✓ Sponsor appraisal email sent successfully to ${data.sponsorEmail}`);
    console.log(`  Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`✗ FAILED to send sponsor appraisal email to ${data.sponsorEmail}`);
    console.error(`  Error: ${error?.message || error}`);
    console.error('  Troubleshooting:');
    console.error('    1. Check SMTP credentials in .env file');
    console.error('    2. Verify email and password are correct (not placeholders)');
    console.error('    3. For Gmail: Use App Password, not regular password');
    console.error('    4. Check firewall/network allows SMTP connections');
    // Don't throw - email is non-critical
    return { success: false, error: error?.message };
  }
};

export const sendApplicationConfirmationEmail = async (
  applicantEmail: string,
  applicantName: string,
  applicationId: string
) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: applicantEmail,
    subject: 'ZIE Membership Application Received',
    html: `
      <h2>Application Received</h2>
      <p>Dear ${applicantName},</p>
      <p>Your membership application to the Zimbabwe Institution of Engineers has been received.</p>
      <p>Application ID: <strong>${applicationId}</strong></p>
      <p>We will send you updates on the status of your application. Your sponsors have been notified and will provide their appraisals shortly.</p>
      <p>Best regards,<br/>Zimbabwe Institution of Engineers</p>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log(`Confirmation email sent to ${applicantEmail}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Log error but don't throw - email is non-critical
  }
};

export const sendInterviewNotificationEmail = async (
  applicantEmail: string,
  applicantName: string,
  message: string,
  interviewDetails?: {
    date?: string;
    time?: string;
    location?: string;
    interviewerName?: string;
  }
) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: applicantEmail,
    subject: 'Interview Notification - ZIE Membership Application',
    html: `
      <h2>Interview Notification</h2>
      <p>Dear ${applicantName},</p>
      <p>We are pleased to inform you that you have been invited for an interview as part of your membership application process.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #004A59; margin: 20px 0;">
        <p><strong>${message}</strong></p>
        ${interviewDetails?.date ? `<p><strong>Date:</strong> ${interviewDetails.date}</p>` : ''}
        ${interviewDetails?.time ? `<p><strong>Time:</strong> ${interviewDetails.time}</p>` : ''}
        ${interviewDetails?.location ? `<p><strong>Location:</strong> ${interviewDetails.location}</p>` : ''}
        ${interviewDetails?.interviewerName ? `<p><strong>Interviewer:</strong> ${interviewDetails.interviewerName}</p>` : ''}
      </div>
      <p>Please confirm your availability by logging into your dashboard or replying to this email.</p>
      <p>Best regards,<br/>Zimbabwe Institution of Engineers</p>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log(`Interview notification sent to ${applicantEmail}`);
  } catch (error) {
    console.error('Error sending interview notification:', error);
  }
};

export const sendStatusUpdateEmail = async (
  applicantEmail: string,
  applicantName: string,
  newStatus: string,
  details?: string
) => {
  const statusMessages: { [key: string]: string } = {
    'Under Review': 'Your application is currently under review by our team.',
    'Interview Required': 'Your application has progressed and an interview has been scheduled.',
    'Approved': 'Congratulations! Your membership application has been approved.',
    'Passed': 'Congratulations! You have passed your interview and have been registered as a ZIE Professional Member.',
    'Rejected': 'Unfortunately, your application was not approved at this time.',
    'Approved with Conditions': 'Your application has been approved with certain conditions that need to be fulfilled.',
  };

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: applicantEmail,
    subject: `Application Status Update - ${newStatus}`,
    html: `
      <h2>Application Status Update</h2>
      <p>Dear ${applicantName},</p>
      <p>We wanted to inform you that the status of your membership application has been updated.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #B99532; margin: 20px 0;">
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p>${statusMessages[newStatus] || ''}</p>
        ${details ? `<p><strong>Details:</strong> ${details}</p>` : ''}
      </div>
      <p>You can log into your dashboard to view more details about your application.</p>
      <p>Best regards,<br/>Zimbabwe Institution of Engineers</p>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log(`Status update email sent to ${applicantEmail}`);
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
};
