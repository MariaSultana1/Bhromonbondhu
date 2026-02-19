#!/bin/bash

# Messages API Testing Script
# Run this to verify the backend endpoints are working correctly

API_URL="http://localhost:5000/api"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Messages API Testing Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 1. Check if server is running
echo -e "${YELLOW}1. Checking if server is running...${NC}"
if curl -s "$API_URL/messages/conversations" -H "Authorization: Bearer test" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not responding. Start it with: npm start (in server directory)${NC}"
    exit 1
fi
echo ""

# 2. Get valid token for testing
echo -e "${YELLOW}2. Getting authentication token...${NC}"
echo "Please provide your API token (from localStorage in browser):"
read -p "Token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ No token provided. Cannot continue without authentication.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Using token: ${TOKEN:0:20}...${NC}"
echo ""

# 3. Test GET /api/messages/conversations
echo -e "${YELLOW}3. Testing GET /api/messages/conversations${NC}"
RESPONSE=$(curl -s "$API_URL/messages/conversations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Endpoint works${NC}"
    echo -e "Response: ${BLUE}$(echo $RESPONSE | jq -r '.conversations | length') conversations found${NC}"
    
    # Extract first conversation ID for next test
    CONV_ID=$(echo "$RESPONSE" | jq -r '.conversations[0]._id' 2>/dev/null)
    if [ ! -z "$CONV_ID" ] && [ "$CONV_ID" != "null" ]; then
        echo -e "${GREEN}✓ First conversation ID: ${BLUE}$CONV_ID${NC}"
    fi
else
    echo -e "${RED}✗ Endpoint failed or returned error${NC}"
    echo -e "Response: ${BLUE}$RESPONSE${NC}"
fi
echo ""

# 4. Test GET /api/messages/conversations/{id}
if [ ! -z "$CONV_ID" ] && [ "$CONV_ID" != "null" ]; then
    echo -e "${YELLOW}4. Testing GET /api/messages/conversations/$CONV_ID${NC}"
    RESPONSE=$(curl -s "$API_URL/messages/conversations/$CONV_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    if echo "$RESPONSE" | grep -q "messages"; then
        echo -e "${GREEN}✓ Endpoint works${NC}"
        MSG_COUNT=$(echo "$RESPONSE" | jq -r '.messages | length')
        echo -e "Response: ${BLUE}$MSG_COUNT messages found${NC}"
        
        # Check message structure
        FIRST_MSG=$(echo "$RESPONSE" | jq -r '.messages[0]' 2>/dev/null)
        if [ ! -z "$FIRST_MSG" ]; then
            echo -e "${GREEN}✓ First message sender: ${BLUE}$(echo $FIRST_MSG | jq -r '.sender')${NC}"
            echo -e "  Message type: ${BLUE}$(echo $FIRST_MSG | jq -r '.type')${NC}"
        fi
    else
        echo -e "${RED}✗ Endpoint failed${NC}"
        echo -e "Response: ${BLUE}$RESPONSE${NC}"
    fi
    echo ""
fi

# 5. Test POST /api/messages/send (dry run - just check endpoint exists)
echo -e "${YELLOW}5. Testing POST /api/messages/send (structure check)${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/messages/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test","content":"test"}' \
  -w "\n%{http_code}")

# Separate HTTP status from body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Endpoint exists (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Endpoint not found (HTTP $HTTP_CODE)${NC}"
fi
echo ""

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Testing Complete!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Summary:"
echo "- If all tests passed (✓), the backend is ready for the frontend"
echo "- Check browser console (F12) for additional debugging info"
echo "- Variables to check in browser console:"
echo "  - localStorage.getItem('token') - should return your token"
echo "  - localStorage.getItem('user') - should return user object"
echo ""
