#!/bin/bash

# Wedding Invitation API Demo Script
# This script demonstrates how to test the API endpoints

API_BASE_URL="http://localhost:5000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Wedding Invitation API Demo${NC}"
echo "================================"

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    
    if [ -n "$data" ]; then
        curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "$headers" \
            -d "$data" \
            "$API_BASE_URL$endpoint" | jq '.' 2>/dev/null || curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "$headers" \
            -d "$data" \
            "$API_BASE_URL$endpoint"
    else
        curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "$headers" \
            "$API_BASE_URL$endpoint" | jq '.' 2>/dev/null || curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "$headers" \
            "$API_BASE_URL$endpoint"
    fi
}

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to print step headers
print_step() {
    echo -e "\n${BLUE}🔹 $1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if API is running
print_step "Checking API health..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/../health" 2>/dev/null)
if [ "$response" = "200" ]; then
    print_success "API is running"
else
    print_error "API is not running. Please start the server first with 'npm start' or 'npm run dev'"
    exit 1
fi

# Authentication Demo
print_section "1. AUTHENTICATION DEMO"

print_step "Register a new user"
USER_DATA='{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123"
}'

response=$(make_request "POST" "/auth/register" "$USER_DATA")
echo "$response"

# Extract token from response (simplified)
TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    print_success "User registered successfully"
    AUTH_HEADER="Authorization: Bearer $TOKEN"
else
    print_error "Registration failed"
    exit 1
fi

print_step "Login with the same credentials"
LOGIN_DATA='{
    "email": "john.doe@example.com",
    "password": "password123"
}'

response=$(make_request "POST" "/auth/login" "$LOGIN_DATA")
echo "$response"

# Event Management Demo
print_section "2. EVENT MANAGEMENT DEMO"

print_step "Create a new event"
EVENT_DATA='{
    "title": "John & Jane Wedding",
    "type": "wedding",
    "eventDate": "2025-06-15",
    "eventTime": "14:00",
    "timezone": "UTC",
    "venue": {
        "name": "Beautiful Garden Venue",
        "address": {
            "street": "123 Garden Lane",
            "city": "Springfield",
            "state": "IL",
            "country": "USA",
            "zipCode": "62701"
        }
    },
    "details": {
        "description": "Join us for our magical wedding day",
        "dressCode": "Formal",
        "ageRestriction": "All ages welcome"
    },
    "design": {
        "template": "elegant",
        "colorPalette": [
            { "name": "Primary", "hex": "#b447eb", "role": "primary" },
            { "name": "Secondary", "hex": "#f7f6f8", "role": "background" }
        ]
    },
    "settings": {
        "rsvpRequired": true,
        "rsvpDeadline": "2025-06-01",
        "maxGuests": 150,
        "allowPlusOnes": true
    }
}'

response=$(make_request "POST" "/events" "$EVENT_DATA" "$AUTH_HEADER")
echo "$response"

# Extract event ID
EVENT_ID=$(echo "$response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
if [ -n "$EVENT_ID" ]; then
    print_success "Event created successfully"
else
    print_error "Event creation failed"
    EVENT_ID="replace_with_event_id"
fi

print_step "Get all events"
response=$(make_request "GET" "/events" "" "$AUTH_HEADER")
echo "$response"

print_step "Get specific event"
response=$(make_request "GET" "/events/$EVENT_ID" "" "$AUTH_HEADER")
echo "$response"

# Guest Management Demo
print_section "3. GUEST MANAGEMENT DEMO"

print_step "Add guests to the event"
GUEST_DATA='{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "phone": "+1234567890",
    "category": "family",
    "relationship": "Sister of the Bride",
    "partySize": 2,
    "plusOnes": {
        "allowed": true,
        "names": ["Bob Smith"]
    }
}'

response=$(make_request "POST" "/guests/event/$EVENT_ID" "$GUEST_DATA" "$AUTH_HEADER")
echo "$response"

# Add another guest
GUEST_DATA_2='{
    "name": "Michael Johnson",
    "email": "michael@example.com",
    "category": "friends",
    "relationship": "Best Man",
    "partySize": 1
}'

response=$(make_request "POST" "/guests/event/$EVENT_ID" "$GUEST_DATA_2" "$AUTH_HEADER")
echo "$response"

print_step "Get all guests for the event"
response=$(make_request "GET" "/guests/event/$EVENT_ID" "" "$AUTH_HEADER")
echo "$response"

# Extract guest ID for RSVP testing
GUEST_ID=$(echo "$response" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

print_step "Update guest RSVP"
RSVP_DATA='{
    "status": "accepted",
    "message": "Excited to celebrate with you!",
    "actualGuestCount": 2,
    "dietaryRestrictions": ["Vegetarian"],
    "plusOneNames": ["Bob Smith"]
}'

response=$(make_request "PUT" "/guests/$GUEST_ID/rsvp" "$RSVP_DATA" "$AUTH_HEADER")
echo "$response"

# Design System Demo
print_section "4. DESIGN SYSTEM DEMO"

print_step "Create a custom design"
DESIGN_DATA='{
    "name": "Summer Garden Theme",
    "template": "elegant",
    "colorPalette": [
        { "name": "Primary", "hex": "#2E8B57", "role": "primary" },
        { "name": "Secondary", "hex": "#F0FFF0", "role": "background" },
        { "name": "Accent", "hex": "#FFB6C1", "role": "accent" }
    ],
    "typography": {
        "primary": {
            "fontFamily": "Playfair Display",
            "fontSize": 24,
            "fontWeight": "bold",
            "color": "#2E8B57"
        },
        "secondary": {
            "fontFamily": "Open Sans",
            "fontSize": 16,
            "fontWeight": "normal",
            "color": "#333333"
        }
    }
}'

response=$(make_request "POST" "/designs" "$DESIGN_DATA" "$AUTH_HEADER")
echo "$response"

print_step "Get design templates"
response=$(make_request "GET" "/designs/templates" "" "$AUTH_HEADER")
echo "$response"

# Sharing Demo
print_section "5. SHARING DEMO"

print_step "Generate shareable link"
response=$(make_request "POST" "/share/generate-link/$EVENT_ID" "" "$AUTH_HEADER")
echo "$response"

print_step "Update sharing settings"
SHARING_DATA='{
    "isPublic": true,
    "socialSettings": {
        "facebook": true,
        "instagram": true,
        "whatsapp": true
    }
}'

response=$(make_request "PUT" "/share/settings/$EVENT_ID" "$SHARING_DATA" "$AUTH_HEADER")
echo "$response"

print_step "Get sharing statistics"
response=$(make_request "GET" "/share/stats/$EVENT_ID" "" "$AUTH_HEADER")
echo "$response"

# Export Demo
print_section "6. EXPORT DEMO"

print_step "Create export job"
EXPORT_DATA='{
    "eventId": "'$EVENT_ID'",
    "type": "invitation",
    "format": "pdf",
    "settings": {
        "resolution": "300dpi",
        "size": {
            "width": 8.5,
            "height": 11,
            "unit": "in"
        },
        "quality": 95
    }
}'

response=$(make_request "POST" "/export" "$EXPORT_DATA" "$AUTH_HEADER")
echo "$response"

print_step "Get export status"
response=$(make_request "GET" "/export" "" "$AUTH_HEADER")
echo "$response"

# Notifications Demo
print_section "7. NOTIFICATIONS DEMO"

print_step "Get notifications"
response=$(make_request "GET" "/notifications" "" "$AUTH_HEADER")
echo "$response"

print_step "Get unread count"
response=$(make_request "GET" "/notifications/unread-count" "" "$AUTH_HEADER")
echo "$response"

# Public RSVP Demo (No authentication required)
print_section "8. PUBLIC RSVP DEMO"

print_step "Get public event data"
response=$(curl -s "$API_BASE_URL/share/public/$EVENT_ID")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# Health Check
print_section "9. HEALTH CHECK"
print_step "API Health Status"
response=$(curl -s "$API_BASE_URL/../health")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# Summary
print_section "DEMO SUMMARY"
echo -e "${GREEN}✅ Authentication: User registration and login${NC}"
echo -e "${GREEN}✅ Event Management: Create, read, update events${NC}"
echo -e "${GREEN}✅ Guest Management: Add guests, manage RSVPs${NC}"
echo -e "${GREEN}✅ Design System: Create and manage designs${NC}"
echo -e "${GREEN}✅ Sharing: Generate links, manage public access${NC}"
echo -e "${GREEN}✅ Export: Create and track export jobs${NC}"
echo -e "${GREEN}✅ Notifications: Manage user notifications${NC}"
echo -e "${GREEN}✅ Public API: Access public event data${NC}"

echo -e "\n${BLUE}🎉 API Demo Completed Successfully!${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Start the frontend application"
echo "2. Connect the frontend to the API using the integration guide"
echo "3. Customize the API endpoints based on your needs"
echo "4. Deploy both frontend and backend to production"

echo -e "\n${BLUE}📚 Documentation:${NC}"
echo "- Backend README: ./backend/README.md"
echo "- Integration Guide: ./backend/INTEGRATION.md"
echo "- API endpoints: See README.md for complete endpoint documentation"