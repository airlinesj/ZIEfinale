#!/bin/bash
# Quick Verification Script for Bug Fixes
# Tests logout and PDF upload functionality

echo "═══════════════════════════════════════════════════════════════"
echo "  ZIE Portal - Bug Fix Verification Script"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if header component has logout implementation
echo -e "${YELLOW}[1/4] Checking header component logout implementation...${NC}"
if grep -q "logout(): void {" /home/julius/Desktop/ZIE/frontend/src/app/components/header.component.ts; then
  if grep -q "this.router.navigate" /home/julius/Desktop/ZIE/frontend/src/app/components/header.component.ts; then
    echo -e "${GREEN}✓ Header component logout properly implemented${NC}"
  else
    echo -e "${RED}✗ Header component logout missing router.navigate${NC}"
  fi
else
  echo -e "${RED}✗ Header component logout not implemented${NC}"
fi
echo ""

# Test 2: Check if FormData is sending individual fields
echo -e "${YELLOW}[2/4] Checking FormData field structure...${NC}"
if grep -q "formData.append('personalParticulars'" /home/julius/Desktop/ZIE/frontend/src/app/pages/form-m1.component.ts; then
  echo -e "${GREEN}✓ FormData sending individual fields correctly${NC}"
else
  echo -e "${RED}✗ FormData not sending individual fields${NC}"
fi
echo ""

# Test 3: Check backend parseFormDataFields middleware
echo -e "${YELLOW}[3/4] Checking backend field parsing...${NC}"
if grep -q "JSON.parse(req.body.personalParticulars)" /home/julius/Desktop/ZIE/backend/src/middleware/parseFormDataFields.ts; then
  echo -e "${GREEN}✓ Backend field parsing middleware updated${NC}"
else
  echo -e "${RED}✗ Backend field parsing not updated${NC}"
fi
echo ""

# Test 4: Check controller handles FormData
echo -e "${YELLOW}[4/4] Checking controller FormData handling...${NC}"
if grep -q "typeof req.body.personalParticulars === 'string'" /home/julius/Desktop/ZIE/backend/src/controllers/applicationController.ts; then
  echo -e "${GREEN}✓ Controller handles FormData parsing${NC}"
else
  echo -e "${RED}✗ Controller FormData handling incomplete${NC}"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  Verification Complete"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Restart backend server: cd /backend && npm run dev"
echo "2. Clear browser cache: Ctrl+Shift+Delete"
echo "3. Test logout button"
echo "4. Test PDF upload"
echo ""
echo "For detailed information, see:"
echo "  /home/julius/Desktop/ZIE/BUG_FIXES_LOGOUT_AND_UPLOADS.md"
