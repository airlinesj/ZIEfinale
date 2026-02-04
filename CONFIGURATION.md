# ZIE Membership Portal - Environment Configuration Guide

## Backend Configuration (.env)

### Database
```
MONGODB_URI=mongodb://localhost:27017/zie-db
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zie-db
```

### Server
```
NODE_ENV=development
PORT=5000
```

### JWT Authentication
```
JWT_SECRET=your_very_secure_random_secret_key_here_min_32_chars
```

### Email Configuration (Nodemailer)

#### Gmail Setup:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```
Generate App Password: https://myaccount.google.com/apppasswords

#### Outlook Setup:
```
SMTP_HOST=smtp.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Custom SMTP:
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

### Frontend & Exchange Rate
```
FRONTEND_URL=http://localhost:4200
EXCHANGE_RATE=0.015  # ZWL/ZiG to USD conversion (1 USD = 0.015 ZWL approximately)
```

## Generate Secure JWT Secret

```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## MongoDB Setup

### Local MongoDB
```bash
# On macOS (with Homebrew)
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Get connection string
5. Update MONGODB_URI in .env

## Email Testing

### For Development
You can use Mailtrap or similar services:

```
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
```

### Test Email Send
```bash
cd backend
npm run dev

# In another terminal
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "role": "Applicant"
  }'
```

## Exchange Rate Configuration

The EXCHANGE_RATE represents the ZWL/ZiG to USD conversion rate.

### Example Rates:
- 1 USD = 15 ZWL: EXCHANGE_RATE=0.0667
- 1 USD = 20 ZWL: EXCHANGE_RATE=0.05
- 1 USD = 30 ZWL: EXCHANGE_RATE=0.0333
- 1 USD = 50 ZWL: EXCHANGE_RATE=0.02

**Application Fees (before conversion):**
- Student: $45 USD
- Graduate: $50 USD
- Technician: $45 USD
- Technologist: $50 USD
- Member: $60 USD
- Fellow: $60 USD

**Example:** With EXCHANGE_RATE=0.02 (1 USD = 50 ZWL):
- $45 USD = 45 / 0.02 = 2,250 ZWL

## Frontend Configuration

Frontend accesses backend via:
```
http://localhost:5000/api
```

This is configured in the service files. For production, update:
- `frontend/src/app/services/auth.service.ts`
- `frontend/src/app/services/application.service.ts`
- `frontend/src/app/services/sponsor.service.ts`

Change `http://localhost:5000` to your production backend URL.

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters
- [ ] SMTP_PASS is not stored in version control
- [ ] MONGODB_URI uses secure connection
- [ ] FRONTEND_URL matches actual frontend domain
- [ ] NODE_ENV is set correctly (development/production)
- [ ] Helmet security headers enabled
- [ ] CORS configured for specific origins
- [ ] File upload limits configured
- [ ] Input validation enabled
- [ ] Password hashing enabled (bcrypt)

## Troubleshooting

### MongoDB Connection Refused
```bash
# Check if MongoDB is running
mongosh  # If this fails, MongoDB isn't running

# Start MongoDB service
# macOS:
brew services start mongodb-community

# Ubuntu:
sudo systemctl start mongod
```

### SMTP Connection Error
```bash
# Test SMTP credentials
telnet smtp.gmail.com 587

# If using Gmail, ensure:
# 1. 2-factor authentication is enabled
# 2. App password is generated
# 3. Less secure apps is NOT blocked
```

### JWT Token Errors
```bash
# Token missing or invalid
# Check Authorization header in requests:
Authorization: Bearer YOUR_TOKEN_HERE

# Token expired? Login again to get new token
```

### File Upload Issues
```bash
# Ensure uploads directory exists
mkdir -p backend/uploads

# Check permissions
chmod 755 backend/uploads

# Check file size limits in express
# Increase if needed in index.ts middleware
```
