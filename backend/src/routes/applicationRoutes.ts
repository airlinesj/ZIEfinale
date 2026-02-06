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
} from '../controllers/applicationController';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { multipleUploadPDF } from '../middleware/fileUpload';
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
router.post('/', authMiddleware, multipleUploadPDF, parseFormDataFields, applicationValidation, createApplication);
router.get('/', authMiddleware, getApplicationByUser);
router.get('/:id', authMiddleware, getApplicationById);
router.get('/:id/preview', authMiddleware, adminMiddleware, getApplicationPreview);
router.put('/:id/status', authMiddleware, adminMiddleware, updateApplicationStatus);
router.put('/:id/checklist', authMiddleware, adminMiddleware, updateApplicationChecklist);
router.get('/:id/verification-report', authMiddleware, adminMiddleware, getVerificationReport);
router.post('/:id/payment-proof', authMiddleware, multipleUploadPDF, uploadPaymentProof);
router.put('/:id/verify-payment', authMiddleware, adminMiddleware, verifyPayment);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllApplications);

export default router;
