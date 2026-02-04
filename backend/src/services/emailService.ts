import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SponsorAppraisalRequest {
  applicantName: string;
  applicantEmail: string;
  sponsorName: string;
  sponsorEmail: string;
  applicationId: string;
  sponsorToken: string;
}

export const sendSponsorAppraisalEmail = async (data: SponsorAppraisalRequest) => {
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
      <a href="${reviewUrl}" style="display: inline-block; padding: 10px 20px; background-color: #004A59; color: white; text-decoration: none; border-radius: 5px;">
        View Appraisal Form
      </a>
      <p>This appraisal is confidential and will not be shared with the applicant.</p>
      <p>Best regards,<br/>Zimbabwe Institution of Engineers</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appraisal email sent to ${data.sponsorEmail}`);
  } catch (error) {
    console.error('Error sending sponsor appraisal email:', error);
    throw error;
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
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${applicantEmail}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

export const sendAdminNotificationEmail = async (
  adminEmail: string,
  applicantName: string,
  applicationId: string
) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: `New ZIE Membership Application - ${applicantName}`,
    html: `
      <h2>New Membership Application</h2>
      <p>A new membership application has been submitted.</p>
      <p><strong>Applicant:</strong> ${applicantName}</p>
      <p><strong>Application ID:</strong> ${applicationId}</p>
      <p>Please log in to the admin dashboard to review this application.</p>
      <p>Best regards,<br/>Zimbabwe Institution of Engineers</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw error;
  }
};
