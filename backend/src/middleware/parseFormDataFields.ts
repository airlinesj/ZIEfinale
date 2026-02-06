import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to parse FormData fields for validation
 * When FormData is submitted with files, string fields need to be parsed
 * This middleware handles both FormData and JSON payloads
 */
export const parseFormDataFields = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== parseFormDataFields middleware ===');
    console.log('Raw body keys:', Object.keys(req.body));
    
    // Parse stringified JSON fields that come from FormData
    if (req.body.personalParticulars && typeof req.body.personalParticulars === 'string') {
      req.body.personalParticulars = JSON.parse(req.body.personalParticulars);
      console.log('Parsed personalParticulars');
    }
    if (req.body.education && typeof req.body.education === 'string') {
      req.body.education = JSON.parse(req.body.education);
      console.log('Parsed education');
    }
    if (req.body.experience && typeof req.body.experience === 'string') {
      req.body.experience = JSON.parse(req.body.experience);
      console.log('Parsed experience');
    }
    if (req.body.sponsors && typeof req.body.sponsors === 'string') {
      req.body.sponsors = JSON.parse(req.body.sponsors);
      console.log('Parsed sponsors:', req.body.sponsors);
    }
    next();
  } catch (error) {
    console.error('Error parsing FormData fields:', error);
    next(error);
  }
};
