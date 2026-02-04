import { Router } from 'express';
import { body } from 'express-validator';
import {
  createApplication,
  getApplicationByUser,
  getApplicationById,
  updateApplicationStatus,
  getAllApplications,
} from '../controllers/applicationController';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
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
router.post('/', authMiddleware, applicationValidation, createApplication);
router.get('/', authMiddleware, getApplicationByUser);
router.get('/:id', authMiddleware, getApplicationById);
router.put('/:id/status', authMiddleware, adminMiddleware, updateApplicationStatus);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllApplications);

export default router;
