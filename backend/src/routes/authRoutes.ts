import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Custom validator for admin email
const adminEmailValidator = (value: string, { req }: any) => {
  if (req.body.role === 'Admin' && !value.includes('@admin')) {
    throw new Error('Admin email must contain @admin');
  }
  return true;
};

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .custom(adminEmailValidator),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['Applicant', 'Admin']),
];

const loginValidation = [body('email').isEmail().normalizeEmail(), body('password').notEmpty()];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
