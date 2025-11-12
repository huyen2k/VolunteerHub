#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080/api/v1"

echo -e "${YELLOW}=== Testing VolunteerHub API ===${NC}\n"

# Test 1: Login
echo -e "${YELLOW}1. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('result', {}).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE" | python3 -m json.tool
  exit 1
else
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "Token: ${TOKEN:0:50}..."
fi

echo ""

# Test 2: Get User Info
echo -e "${YELLOW}2. Testing Get User Info...${NC}"
USER_INFO=$(curl -s -X GET "$BASE_URL/users/info" \
  -H "Authorization: Bearer $TOKEN")

if echo "$USER_INFO" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if data.get('code') == 1000 else 1)" 2>/dev/null; then
  echo -e "${GREEN}✓ Get user info successful${NC}"
  echo "$USER_INFO" | python3 -m json.tool | head -15
else
  echo -e "${RED}✗ Get user info failed${NC}"
  echo "$USER_INFO" | python3 -m json.tool
fi

echo ""

# Test 3: Get All Events
echo -e "${YELLOW}3. Testing Get All Events...${NC}"
EVENTS=$(curl -s -X GET "$BASE_URL/events" \
  -H "Authorization: Bearer $TOKEN")

if echo "$EVENTS" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if data.get('code') == 1000 else 1)" 2>/dev/null; then
  echo -e "${GREEN}✓ Get events successful${NC}"
  EVENT_COUNT=$(echo "$EVENTS" | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('result', [])))")
  echo "Found $EVENT_COUNT events"
else
  echo -e "${RED}✗ Get events failed${NC}"
  echo "$EVENTS" | python3 -m json.tool
fi

echo ""

# Test 4: Create Event
echo -e "${YELLOW}4. Testing Create Event...${NC}"
CREATE_EVENT=$(curl -s -X POST "$BASE_URL/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Event",
    "description": "This is a test event created via API",
    "date": "2025-12-31",
    "location": "Test Location"
  }')

if echo "$CREATE_EVENT" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if data.get('code') == 1000 else 1)" 2>/dev/null; then
  echo -e "${GREEN}✓ Create event successful${NC}"
  EVENT_ID=$(echo "$CREATE_EVENT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('result', {}).get('id', ''))" 2>/dev/null)
  echo "Event created with ID: $EVENT_ID"
else
  echo -e "${RED}✗ Create event failed${NC}"
  echo "$CREATE_EVENT" | python3 -m json.tool
fi

echo ""

# Test 5: Create User (Register)
echo -e "${YELLOW}5. Testing Create User (Register)...${NC}"
CREATE_USER=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser'$(date +%s)'@example.com",
    "password": "test123456",
    "full_name": "Test User",
    "phone": "0123456789",
    "address": "Test Address"
  }')

if echo "$CREATE_USER" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if data.get('code') == 1000 else 1)" 2>/dev/null; then
  echo -e "${GREEN}✓ Create user successful${NC}"
  USER_ID=$(echo "$CREATE_USER" | python3 -c "import sys, json; print(json.load(sys.stdin).get('result', {}).get('id', ''))" 2>/dev/null)
  echo "User created with ID: $USER_ID"
else
  echo -e "${RED}✗ Create user failed${NC}"
  echo "$CREATE_USER" | python3 -m json.tool
fi

echo ""

# Test 6: Introspect Token
echo -e "${YELLOW}6. Testing Token Introspect...${NC}"
INTROSPECT=$(curl -s -X POST "$BASE_URL/auth/introspect" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\"}")

if echo "$INTROSPECT" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if data.get('result', {}).get('valid', False) else 1)" 2>/dev/null; then
  echo -e "${GREEN}✓ Token is valid${NC}"
else
  echo -e "${RED}✗ Token validation failed${NC}"
  echo "$INTROSPECT" | python3 -m json.tool
fi

echo ""
echo -e "${GREEN}=== API Testing Complete ===${NC}"

