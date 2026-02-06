import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store in 'uploads' folder
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - only accept PDF files
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Check file type
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Create multer instance with limits
export const uploadPDF = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Middleware for handling multiple PDF uploads
 * Accepts: nationalIdCopy, certificateFiles, technicalReport
 */
export const multipleUploadPDF = uploadPDF.fields([
  { name: 'nationalIdCopy', maxCount: 1 },
  { name: 'certificateFiles', maxCount: 5 }, // Allow up to 5 certificate files
  { name: 'technicalReport', maxCount: 1 },
]);

/**
 * Get file download URL from stored path
 */
export const getFileUrl = (filename: string): string => {
  return `/api/uploads/${filename}`;
};

/**
 * Delete uploaded file
 */
export const deleteUploadedFile = (filename: string): boolean => {
  try {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};
