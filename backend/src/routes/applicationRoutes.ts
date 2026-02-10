import { Router } from 'express';
import { body } from 'express-validator';
import {
  createApplication,
  getApplicationByUser,
  getApplicationById,
  updateApplicationStatus,
  getAllApplications,
  updateApplicationChecklist,
  getVerificationReport,
  getApplicationPreview,
  uploadPaymentProof,
  verifyPayment,
  processPayment,
  setManualGrade,
  addAdminApproval,
  sendInterviewNotification,
  updateSponsors,
  getCertificate,
  passInterview,
} from '../controllers/applicationController';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { multipleUploadPDF, uploadPaymentProofPDF } from '../middleware/fileUpload';
import { parseFormDataFields } from '../middleware/parseFormDataFields';
import { Response } from 'express';

const router = Router();

// Validation rules
const applicationValidation = [
  body('personalParticulars').notEmpty(),
  body('chosenGrade').isIn(['Student', 'Graduate', 'Technician', 'Technologist', 'Member', 'Fellow']),
  body('chosenSpecialistDivision').notEmpty(),
  body('sponsors').isArray(),
];

// Routes
// Specific routes first
router.get('/admin/all', authMiddleware, adminMiddleware, getAllApplications);

// POST routes with IDs
router.post('/:id/payment-proof', authMiddleware, uploadPaymentProofPDF, uploadPaymentProof);
router.post('/:id/process-payment', authMiddleware, processPayment);
router.post('/:id/manual-grade', authMiddleware, adminMiddleware, setManualGrade);
router.post('/:id/approve-interview', authMiddleware, adminMiddleware, addAdminApproval);
router.post('/:id/send-interview-notification', authMiddleware, adminMiddleware, sendInterviewNotification);
router.post('/:id/pass-interview', authMiddleware, adminMiddleware, passInterview);

// PUT routes with IDs
router.put('/:id/status', authMiddleware, adminMiddleware, updateApplicationStatus);
router.put('/:id/checklist', authMiddleware, adminMiddleware, updateApplicationChecklist);
router.put('/:id/sponsors', authMiddleware, updateSponsors);
router.put('/:id/verify-payment', authMiddleware, adminMiddleware, verifyPayment);

// GET routes with IDs
router.get('/:id/preview', authMiddleware, adminMiddleware, getApplicationPreview);
router.get('/:id/verification-report', authMiddleware, adminMiddleware, getVerificationReport);
router.get('/:id/certificate', authMiddleware, getCertificate);

// Root routes (must be last to avoid catching ID routes)
router.post('/', authMiddleware, multipleUploadPDF, parseFormDataFields, applicationValidation, createApplication);
router.get('/', authMiddleware, getApplicationByUser);
router.get('/:id', authMiddleware, getApplicationById);

export default router;
