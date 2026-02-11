import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import sponsorRoutes from './routes/sponsorRoutes';
import { initializeDefaultGrades } from './models/MembershipGrade';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zie-db';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    // Initialize default membership grades
    await initializeDefaultGrades();
    console.log('Default membership grades initialized');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/sponsors', sponsorRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

// Multer error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    console.error('File size limit exceeded:', err);
    return res.status(400).json({ message: 'File size exceeds 5MB limit' });
  }
  if (err.code === 'LIMIT_PART_COUNT') {
    console.error('Too many file parts:', err);
    return res.status(400).json({ message: 'Too many file parts' });
  }
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  // Pass to general error handler
  next(err);
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('=== Server Error ===');
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
