import { Router } from 'express';
import { body } from 'express-validator';
import { submitSponsorAppraisal, getSponsorAppraisal } from '../controllers/sponsorController';

const router = Router();

// Validation rules
const appraisalValidation = [
  body('question1').notEmpty(),
  body('question2').notEmpty(),
  body('question3').notEmpty(),
  body('question4').notEmpty(),
  body('question5').notEmpty(),
  body('question6').notEmpty(),
  body('question7').notEmpty(),
  body('question8').notEmpty(),
];

// Routes
router.get('/:token', getSponsorAppraisal);
router.post('/:token/submit', appraisalValidation, submitSponsorAppraisal);

export default router;
