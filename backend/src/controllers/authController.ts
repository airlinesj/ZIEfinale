import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest, generateToken } from '../middleware/auth';
import { validationResult } from 'express-validator';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Security: Validate role and email
    let finalRole = 'Applicant'; // Default role
    
    if (role === 'Admin') {
      // Admin registration only allowed with @admin email
      if (!email.includes('@admin')) {
        return res.status(400).json({ 
          message: 'Admin accounts must use an email address containing @admin (e.g., admin@admin.com)' 
        });
      }
      finalRole = 'Admin';
    } else if (role && role !== 'Applicant') {
      // Reject any other roles
      return res.status(403).json({ 
        message: 'Invalid account type. Only applicant and admin accounts are supported.' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password_hash: password,
      role: finalRole,
    });

    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
