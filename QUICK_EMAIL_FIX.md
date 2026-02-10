# Quick Email Fix Guide

## The Problem
Sponsor appraisal emails are NOT sending

## The Root Cause
Your `backend/.env` file has PLACEHOLDER SMTP credentials that don't work

## The Solution (3 Steps - 2 minutes)

### Step 1: Update `.env` with Real Credentials
```env
# Replace placeholder values
SMTP_USER=your-real-email@gmail.com
SMTP_PASS=your-real-app-password
```

### Step 2: Restart Backend Server
```bash
cd backend
npm run dev
```

### Step 3: Test
- Submit application with real sponsor email
- Check backend console: Should show ✓ "Sponsor appraisal email sent successfully"
- Verify sponsor receives email

---

## Provider Instructions

### Gmail (Easiest)
1. Go to https://myaccount.google.com/apppasswords
2. Copy 16-character password
3. Update SMTP_PASS in .env

### Outlook
```env
SMTP_HOST=smtp.office365.com
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Mailtrap
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_USER=your-username
SMTP_PASS=your-password
```

---

## If It Still Doesn't Work

**Problem**: "SMTP NOT CONFIGURED" error
→ Your .env still has placeholder values
→ Replace with real credentials

**Problem**: "Invalid login" error
→ Wrong email or password
→ Verify credentials match exactly

**Problem**: Email goes to spam
→ Check From address matches your email

---

## Success Indicator
```
✓ Sponsor appraisal email sent successfully to sponsor@example.com
  Message ID: <id>
```

That's it! Sponsor emails will now send.
