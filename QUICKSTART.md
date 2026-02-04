# ZIE Membership Portal - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git
- Code editor (VS Code recommended)

### Step 1: Clone/Extract Project
```bash
cd /home/julius/Desktop
ls -la ZIE/
```

### Step 2: Setup Backend

```bash
cd ZIE/backend

# Install dependencies
npm install

# Create and configure .env
cp .env.example .env

# Edit .env with your settings (minimally):
# - MONGODB_URI=mongodb://localhost:27017/zie-db
# - JWT_SECRET=your-secret-key
# - SMTP credentials (optional for dev, check logs)
```

### Step 3: Start MongoDB
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env

# Verify connection
mongosh
> show databases
> exit
```

### Step 4: Start Backend Server
```bash
# From ZIE/backend
npm run dev

# Should see:
# Server running on port 5000
# MongoDB connected
# Default membership grades initialized
```

### Step 5: Setup Frontend

In a new terminal:
```bash
cd ZIE/frontend

# Install dependencies
npm install

# Start Angular dev server
ng serve
```

### Step 6: Access Application
Open browser and navigate to:
```
http://localhost:4200
```

## First-Time Usage

### 1. Register Account
- Click "Sign Up Here" on login page
- Choose "Applicant" role
- Email: `test@example.com`
- Password: `Test1234`

### 2. Login
- Email: `test@example.com`
- Password: `Test1234`

### 3. Complete Form M1
- Click "Form M1" after login
- Follow the 6-step stepper:
  1. Personal details (required)
  2. Education (add at least 1)
  3. Experience (add at least 1)
  4. Grade & Division (select "Graduate" and "Civil")
  5. Sponsors (add 3 test sponsors)
  6. Review & submit

### 4. Admin Access

**Create Admin Account**
```bash
# In MongoDB
mongosh

> use zie-db
> db.users.insertOne({
  email: "admin@zie.co.zw",
  password_hash: "hashed_password",
  role: "Admin"
})
```

Or register normally, then update role:
```bash
> db.users.updateOne(
  { email: "admin@zie.co.zw" },
  { $set: { role: "Admin" } }
)
```

**Login as Admin**
- Email: `admin@zie.co.zw`
- Password: (your password)
- Navigate to "Admin Dashboard"
- View all applications
- Update application status

## Test Sponsor Workflow

1. **Get Sponsor Token**
   - Check backend logs when form submitted
   - Look for sponsor email send logs
   - Extract token from database:
     ```bash
     mongosh
     > use zie-db
     > db.applications.findOne({})
     > // Find sponsors array and get token value
     ```

2. **Submit Sponsor Appraisal**
   - Go to: `http://localhost:4200/sponsor-review/{TOKEN}`
   - Replace {TOKEN} with actual token from database
   - Fill out 8 questions
   - Submit
   - Return to admin dashboard to verify

## Troubleshooting

### Backend Not Starting

**Error: "Cannot find module"**
```bash
cd backend
npm install
npm run dev
```

**Error: "MongoDB connection refused"**
```bash
# Check if MongoDB is running
mongosh

# If not running:
# macOS:
brew services start mongodb-community

# Ubuntu:
sudo systemctl start mongod
```

### Frontend Not Loading

**Error: "Cannot find @angular/..."**
```bash
cd frontend
npm install
ng serve
```

**Error: "localhost:4200 refused connection"**
```bash
# Kill process on port 4200
lsof -ti :4200 | xargs kill -9

# Restart
ng serve
```

### API Connection Issues

**Check backend is running**
```bash
curl http://localhost:5000/health
# Should return: {"status":"Server is running"}
```

**Check CORS** 
- Frontend: http://localhost:4200
- Backend: http://localhost:5000
- CORS should be enabled for localhost

## Development Workflow

### Code Changes

**Backend Changes**
```bash
cd backend
# Edit TypeScript files in src/
npm run dev  # Watches and restarts on changes
```

**Frontend Changes**
```bash
cd frontend
# Edit components
# Auto-reloads in browser via ng serve
```

### Database Inspection

```bash
# View database with MongoDB Compass
# Download from: https://www.mongodb.com/products/compass

# Or use command line
mongosh
> use zie-db
> db.users.find()
> db.applications.find()
> db.applications.findOne({}, {sponsors: 1})
```

## Common Tasks

### Reset Database
```bash
mongosh
> use zie-db
> db.users.deleteMany({})
> db.applications.deleteMany({})
> db.membershipgrades.deleteMany({})
# Restart backend to reinitialize grades
```

### View Email Logs
```bash
# Backend terminal shows email send attempts
# Look for "Appraisal email sent to..."
# For real email, configure SMTP in .env
```

### Test Application Submission
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "personalParticulars": {...},
    "education": [...],
    "experience": [...],
    "chosenGrade": "Graduate",
    "chosenSpecialistDivision": "Civil",
    "sponsors": [...]
  }'
```

## Performance Tips

- **Database indexing**: Large datasets benefit from MongoDB indexes
- **API caching**: Add caching headers to reduce requests
- **Frontend bundle**: Check size with `ng build --stats-json`
- **Images**: Optimize image sizes before upload

## Next Steps

1. **Customize Theme**
   - Edit colors in `frontend/src/styles.scss`
   - Update logo in `frontend/src/assets/zielogo.png`

2. **Configure Email**
   - Setup Gmail/Outlook SMTP
   - Update `backend/.env` with credentials
   - Test email sending

3. **Setup Database**
   - Use MongoDB Atlas for production
   - Configure backups

4. **Deploy**
   - Follow DEPLOYMENT.md for production setup
   - Use Heroku or VPS

5. **Customize Content**
   - Update form questions/options
   - Customize email templates
   - Modify membership grades

## Support Resources

- **Angular Docs**: https://angular.io/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Express Docs**: https://expressjs.com
- **Material Design**: https://material.angular.io

## Stopping Services

```bash
# Stop backend (Ctrl+C in backend terminal)
# Stop frontend (Ctrl+C in frontend terminal)

# Stop MongoDB
# macOS:
brew services stop mongodb-community

# Ubuntu:
sudo systemctl stop mongod
```

---

**Ready to start? Run these commands:**

```bash
cd ZIE/backend && npm install && npm run dev &
cd ZIE/frontend && npm install && ng serve
# Visit http://localhost:4200
```
