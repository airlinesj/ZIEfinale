# ZIE Membership Portal - Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet / Browser                        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
   ┌────▼──────┐                            ┌────▼──────┐
   │  Angular  │                            │  Nginx    │
   │ Frontend  │◄───────Load Balance───────►│  Proxy    │
   │ (4200)    │                            │  (80/443) │
   └──────────┬┘                            └──────────┘
              │ HTTP (localhost)
              │
        ┌─────▼──────────────┐
        │  Express.js API    │
        │  Backend (5000)    │
        └─────┬──────────────┘
              │
        ┌─────▼──────────────────┐
        │   MongoDB Database     │
        │   (Local/Atlas)        │
        └───────────────────────┘
```

## Request Flow

### Authentication Flow
```
User Input
    ↓
Angular Form
    ↓
AuthService.login()
    ↓
POST /api/auth/login
    ↓
Backend Validation
    ↓
Compare Password (bcrypt)
    ↓
Generate JWT Token
    ↓
Return Token + User Info
    ↓
Store in localStorage
    ↓
Set Authorization Header
    ↓
Redirect to Dashboard
```

### Application Submission Flow
```
Form M1 Completion
    ↓
Validation Check
    ↓
POST /api/applications
    ↓
Backend Validation
    ↓
Create Application Document
    ↓
Generate Sponsor Tokens
    ↓
Send Confirmation Email (Applicant)
    ↓
Send Appraisal Emails (3 Sponsors)
    ↓
Update Status to "Submitted"
    ↓
Return Application ID
    ↓
Show Success Message
```

### Sponsor Appraisal Flow
```
Email with Unique Link
    ↓
GET /api/sponsors/:token
    ↓
Verify Token Exists
    ↓
Load Appraisal Form
    ↓
Sponsor Fills 8 Questions
    ↓
POST /api/sponsors/:token/submit
    ↓
Save Response as Confidential
    ↓
Flag as Confidential
    ↓
Show Confirmation
```

## Data Models

### User Model
```typescript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String (bcrypted),
  role: "Applicant" | "Admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  personalParticulars: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    nationalId: String,
    dateOfBirth: Date,
    nationality: String,
    professionalNumber?: String
  },
  education: [{
    institution: String,
    qualification: String,
    year: Number,
    major?: String
  }],
  experience: [{
    company: String,
    position: String,
    startYear: Number,
    endYear: Number,
    description: String
  }],
  chosenGrade: "Student" | "Graduate" | "Technician" | "Technologist" | "Member" | "Fellow",
  chosenSpecialistDivision: String,
  applicationFee: Number,
  status: "Draft" | "Submitted" | "Under Review" | "Approved" | "Pending" | "Interview Required" | "Rejected",
  documents: {
    nationalIdCopy: String,
    certificates: String[],
    technicalReport?: String,
    organogram?: String
  },
  sponsors: [{
    name: String,
    email: String,
    token: String,
    appraisalResponse?: {
      question1: String,
      question2: String,
      question3: String,
      question4: String,
      question5: String,
      question6: String,
      question7: String,
      question8: String,
      submittedAt: Date
    },
    responseFlags: ["Confidential"]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### MembershipGrade Model
```typescript
{
  _id: ObjectId,
  gradeName: "Student" | "Graduate" | "Technician" | "Technologist" | "Member" | "Fellow",
  minYearsExperience: Number,
  requiresDiploma: Boolean,
  requiresTechnicalReport: Boolean,
  description: String,
  baseFee: Number (USD)
}
```

## Component Hierarchy

### Frontend Components
```
AppComponent
├── HeaderComponent
│   ├── Navigation Links
│   └── Logout Button
└── Router
    ├── LoginComponent
    ├── RegisterComponent
    ├── FormM1Component
    │   ├── PersonalParticularsStep
    │   ├── EducationStep
    │   ├── ExperienceStep
    │   ├── GradeSelectionStep
    │   ├── SponsorStep
    │   └── ReviewStep
    ├── SponsorReviewComponent
    │   └── AppraisalFormStep
    └── AdminDashboardComponent
        ├── StatsSection
        ├── ApplicationsTable
        └── ApplicationModal
            ├── DetailsSection
            ├── ChecklistSection
            ├── SponsorSection
            └── ActionSection
```

## Service Architecture

### Backend Services

#### AuthService
- User registration with validation
- Login with JWT token generation
- Password hashing with bcrypt
- Token verification middleware

#### ApplicationService
- Create application from form data
- Retrieve applications by user
- Update application status
- Calculate application fees
- Validate membership grade requirements

#### SponsorService
- Generate unique sponsor tokens
- Validate sponsor tokens
- Save sponsor appraisals
- Flag responses as confidential
- Hide appraisals from applicants

#### EmailService
- Send sponsor appraisal invitations
- Send application confirmations
- Send admin notifications
- Template-based email generation

### Frontend Services

#### AuthService (Angular)
- HTTP login/register requests
- Token storage in localStorage
- Current user observable
- Logout functionality

#### ApplicationService (Angular)
- HTTP application submission
- Retrieve user applications
- Update application status
- Get all applications (admin)

#### SponsorService (Angular)
- Retrieve appraisal form
- Submit sponsor responses

## Authentication & Security

### JWT Flow
```
1. User Login
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT token: jwt.sign({userId, role}, secret, {expiresIn: '24h'})
   ↓
4. Return token to frontend
   ↓
5. Frontend stores in localStorage
   ↓
6. Add to Authorization header: "Bearer TOKEN"
   ↓
7. Backend verifies token on each request
   ↓
8. Token expires after 24 hours → User must re-login
```

### Password Security
```
User Input: "MyPassword123"
    ↓
bcrypt.hash(password, salt=10)
    ↓
Stored: "$2b$10$..."
    ↓
On Login: bcrypt.compare(input, stored)
    ↓
Returns true/false
```

### Sponsor Token Security
```
Generate: crypto.randomBytes(32).toString('hex')
    ↓
Result: "abc123def456..."
    ↓
Send in email: /sponsor-review/{token}
    ↓
Backend validates token exists in database
    ↓
If valid: Load appraisal form
    ↓
If invalid/expired: Show error
```

## Fee Calculation Logic

```typescript
// Base fees in USD
const baseFees = {
  "Student": 45,
  "Graduate": 50,
  "Technician": 45,
  "Technologist": 50,
  "Member": 60,
  "Fellow": 60
};

// Exchange rate: 1 USD = X ZWL
const exchangeRate = 0.02; // 1 USD = 50 ZWL

// Calculation
const baseFeeUSD = baseFees[grade];
const feeInZWL = baseFeeUSD / exchangeRate;

// Example: Graduate Member with EXCHANGE_RATE=0.02
// 50 USD / 0.02 = 2,500 ZWL
```

## Dynamic Requirements

### Grade-Based Logic

#### Student Grade
- No requirements
- Base fee: $45

#### Graduate Grade
- No requirements
- Base fee: $50

#### Technician Grade
- **Requires**: Diploma (form validation)
- **Requires**: 3+ years experience (calculated from form)
- **Documents**: National ID, Certificates
- Base fee: $45

#### Technologist Grade
- **Requires**: Diploma
- **Requires**: 3+ years experience
- **Documents**: National ID, Certificates
- Base fee: $50

#### Member Grade
- **Requires**: 5+ years experience
- **Requires**: Technical Project Report (file upload)
- **Documents**: National ID, Certificates, Technical Report
- Base fee: $60

#### Fellow Grade
- **Requires**: 10+ years experience
- **Requires**: Technical Project Report
- **Documents**: National ID, Certificates, Technical Report
- Base fee: $60

## API Endpoint Structure

```
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Login
GET    /api/auth/me                - Current user (protected)

POST   /api/applications           - Submit application (protected)
GET    /api/applications           - Get user's applications (protected)
GET    /api/applications/:id       - Get application details (protected)
PUT    /api/applications/:id/status - Update status (admin)
GET    /api/applications/admin/all - All applications (admin)

GET    /api/sponsors/:token        - Appraisal form (public)
POST   /api/sponsors/:token/submit - Submit appraisal (public)
```

## State Management

### Frontend State
```
AuthService (Subject)
├── currentUser$
├── isLoggedIn$
└── Token in localStorage

FormM1Component
├── personalParticularsForm (FormGroup)
├── educationForm (FormGroup)
├── experienceForm (FormGroup)
├── gradeForm (FormGroup)
├── sponsorsForm (FormGroup)
└── selectedGradeRequirements

AdminDashboardComponent
├── applications (Array)
├── filteredApplications (Array)
├── selectedApplication (Object)
└── Filter state
```

### Backend State
```
Express Server
├── Running on PORT
├── Connected to MongoDB
└── Middleware stack

Database (MongoDB)
├── users collection
├── applications collection
└── membershipgrades collection
```

## Error Handling

### Backend Validation
```
Incoming Request
    ↓
Check authentication (JWT)
    ↓
Validate input schema (express-validator)
    ↓
Check business logic
    ↓
Execute operation
    ↓
Handle errors:
  - 400: Bad Request (validation failed)
  - 401: Unauthorized (no token)
  - 403: Forbidden (insufficient permissions)
  - 404: Not Found (resource doesn't exist)
  - 500: Server Error (unexpected error)
```

### Frontend Error Handling
```
User Action
    ↓
Call Service
    ↓
HTTP Request
    ↓
Response received
    ↓
Handle success: Update UI, show message
    ↓
Handle error: Display error message
    ↓
Allow user to retry
```

## Scalability Considerations

### Database Optimization
- Index on user email for login queries
- Index on applicationStatus for admin filtering
- Index on sponsors.token for appraisal lookup
- Pagination for large application lists

### Backend Optimization
- Connection pooling for database
- Caching for membership grades
- Rate limiting on API endpoints
- Load balancing with multiple server instances

### Frontend Optimization
- Lazy loading of routes
- Component change detection optimization
- RxJS unsubscribe patterns
- Minification and tree-shaking in production build

## Disaster Recovery

### Data Backup
- Daily MongoDB backups to S3
- Git version control for code
- Environment configuration backup
- Database replication (if using MongoDB Atlas)

### Recovery Process
1. Restore latest MongoDB backup
2. Redeploy code from git
3. Restart services
4. Verify data integrity
5. Check email notification system
6. Run sanity tests

## Monitoring & Logging

### Backend Logging
```javascript
console.log('Application submitted:', applicationId);
console.error('Database error:', error);
console.warn('Invalid authentication attempt:', email);
```

### Frontend Logging
```typescript
console.log('Form submitted:', formData);
console.error('API error:', error.status);
this.errorMessage = error.error?.message;
```

### Key Metrics
- API response time < 500ms
- Database query time < 100ms
- Email send success rate > 95%
- Application submission success rate > 99%
- System uptime > 99.5%

---

This architecture provides scalability, security, and maintainability for the ZIE Membership Portal system.
