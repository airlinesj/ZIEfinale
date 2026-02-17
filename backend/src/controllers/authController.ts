import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest, generateToken } from '../middleware/auth';
import { validationResult } from 'express-validator';
import { UserClassificationService } from '../services/UserClassificationService';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    console.log('\n=== REGISTER ENDPOINT CALLED ===');
    console.log('Request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, country } = req.body;
    console.log('Extracted fields:');
    console.log('  - email:', email);
    console.log('  - role:', role);
    console.log('  - country:', country);
    console.log('  - password length:', password?.length);

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
    } else if (role === 'SuperAdmin') {
      // SuperAdmin registration only allowed with @superadmin email
      if (!email.includes('@superadmin')) {
        return res.status(400).json({ 
          message: 'Super Admin accounts must use an email address containing @superadmin (e.g., superadmin@superadmin.com)' 
        });
      }
      finalRole = 'SuperAdmin';
    } else if (role && role !== 'Applicant') {
      // Reject any other roles
      return res.status(403).json({ 
        message: 'Invalid account type. Only applicant, admin, and super admin accounts are supported.' 
      });
    }

    // Validate country for applicants only
    if (finalRole === 'Applicant' && !country) {
      console.warn('⚠ Country is required for applicant but not provided');
      return res.status(400).json({ message: 'Country is required for applicant registration' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('⚠ User already exists:', email);
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const userData: any = {
      email,
      password_hash: password,
      role: finalRole,
    };

    // Only set applicant-specific fields for applicants
    if (finalRole === 'Applicant') {
      const applicationType = country === 'Zimbabwe' ? 'local' : 'expatriate';
      userData.country = country;
      userData.applicationType = applicationType;
      console.log('✓ Setting applicant fields - country: ' + country + ', applicationType: ' + applicationType);
    }

    const user = new User(userData);

    console.log('User object before save:');
    console.log('  - email:', user.email);
    console.log('  - role:', user.role);
    console.log('  - country:', user.country);
    console.log('  - applicationType:', user.applicationType);

    // Set user classification
    if ('getClassification' in user) {
      user.userClassification = (user as any).getClassification();
      console.log('  - userClassification:', user.userClassification);
    }

    const savedUser = await user.save();
    console.log('✓ User saved to database');
    console.log('User object after save:');
    console.log('  - _id:', savedUser._id);
    console.log('  - email:', savedUser.email);
    console.log('  - role:', savedUser.role);
    console.log('  - country:', savedUser.country);
    console.log('  - applicationType:', savedUser.applicationType);
    console.log('  - userClassification:', savedUser.userClassification);

    const token = generateToken(user._id.toString(), user.role);
    const classification = UserClassificationService.classifyUser(user);
    const dashboardInfo = UserClassificationService.getDashboardInfo(classification, user);

    console.log('✓ Registration response prepared:');
    console.log('  - classification:', classification.classification);
    console.log('  - dashboard:', classification.dashboard);
    console.log('  - Response will include:');
    console.log('    - country:', savedUser.country);
    console.log('    - applicationType:', savedUser.applicationType);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        country: savedUser.country,
        applicationType: savedUser.applicationType,
        userClassification: savedUser.userClassification,
      },
      classification: classification,
      dashboard: classification.dashboard,
      dashboardInfo: dashboardInfo,
    });
    
    console.log('✓ Registration response sent\n');
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    console.log('\n=== BACKEND: login ===');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('📧 Login attempt for:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('⚠ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✓ User found:', email);
    console.log('  - Current applicationType:', user.applicationType);
    console.log('  - Current country:', user.country);

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.warn('⚠ Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✓ Password valid');

    // Ensure user has country and applicationType (migration for old accounts ONLY)
    let needsSave = false;
    
    // For Applicants: ensure country is set (only for old accounts without it)
    if (user.role === 'Applicant' && !user.country) {
      console.log('⚠ Old account migrated - no country found, setting to Zimbabwe');
      user.country = 'Zimbabwe';
      needsSave = true;
    }
    
    if (user.role === 'Applicant' && !user.applicationType) {
      const newType = user.country === 'Zimbabwe' ? 'local' : 'expatriate';
      console.log('⚠ Old account migrated - no applicationType found, calculating from country');
      console.log('  - Country:', user.country);
      console.log('  - Setting applicationType to:', newType);
      user.applicationType = newType;
      needsSave = true;
    }
    
    if (needsSave) {
      await user.save(); // Save the migration
      console.log('✓ Migrated old user on login:', email);
      console.log('  - applicationType now:', user.applicationType);
      console.log('  - country now:', user.country);
    }

    // Update userClassification if needed
    const calculatedClassification = ('getClassification' in user) ? (user as any).getClassification() : 'local_applicant';
    if (user.userClassification !== calculatedClassification) {
      console.log('📝 Updating userClassification:', calculatedClassification);
      user.userClassification = calculatedClassification;
      await user.save();
    }

    const token = generateToken(user._id.toString(), user.role);
    const classification = UserClassificationService.classifyUser(user);
    const dashboardInfo = UserClassificationService.getDashboardInfo(classification, user);

    console.log('✓ Login successful for:', email);
    console.log('  - applicationType:', user.applicationType);
    console.log('  - country:', user.country);
    console.log('  - classification:', classification.classification);
    console.log('  - dashboard:', classification.dashboard);

    const response = {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        country: user.country,
        applicationType: user.applicationType,
        userClassification: user.userClassification,
      },
      classification: classification,
      dashboard: classification.dashboard,
      dashboardInfo: dashboardInfo,
    };

    console.log('📤 Sending login response with:');
    console.log('  - country:', response.user.country);
    console.log('  - applicationType:', response.user.applicationType);
    console.log('  - classification:', response.classification?.classification);
    console.log('  - dashboard:', response.dashboard);
    console.log('=== END login ===\n');
    
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    console.log('\n=== BACKEND: getCurrentUser (/auth/me) ===');
    console.log('Fetching user for ID:', req.userId);
    
    const user = await User.findById(req.userId);
    if (!user) {
      console.warn('⚠ User not found for ID:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✓ User found:', user.email);
    console.log('  - Current applicationType:', user.applicationType);
    console.log('  - Current country:', user.country);

    // Migration: set default country and applicationType for old accounts
    let needsSave = false;
    
    if (user.role === 'Applicant') {
      if (!user.country) {
        console.log('⚠ No country found, setting to Zimbabwe');
        user.country = 'Zimbabwe';
        needsSave = true;
      }
      if (!user.applicationType) {
        console.log('⚠ No applicationType found, calculating from country:', user.country);
        user.applicationType = user.country === 'Zimbabwe' ? 'local' : 'expatriate';
        needsSave = true;
      }
    }

    // Save if we made any migrations
    if (needsSave) {
      await user.save();
      console.log('✓ Migrated user account:', user.email, 'with applicationType:', user.applicationType);
    }

    // Update userClassification if needed
    const calculatedClassification = ('getClassification' in user) ? (user as any).getClassification() : 'local_applicant';
    if (user.userClassification !== calculatedClassification) {
      console.log('📝 Updating userClassification:', calculatedClassification);
      user.userClassification = calculatedClassification;
      await user.save();
    }

    const classification = UserClassificationService.classifyUser(user);
    const dashboardInfo = UserClassificationService.getDashboardInfo(classification, user);

    console.log('✓ Preparing response with:');
    console.log('  - applicationType:', user.applicationType);
    console.log('  - classification:', classification);
    console.log('  - dashboard:', classification.dashboard);

    // Return user data (excluding password)
    const response = {
      id: user._id,
      email: user.email,
      role: user.role,
      country: user.country,
      applicationType: user.applicationType,
      userClassification: user.userClassification,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      classification: classification,
      dashboard: classification.dashboard,
      dashboardInfo: dashboardInfo,
    };
    
    console.log('📤 Sending response with country:', response.country, 'applicationType:', response.applicationType);
    console.log('=== END getCurrentUser ===\n');
    
    res.json(response);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
