#!/bin/bash

# Comprehensive Feature Testing Script
# Tests all interactive features on the live site

BASE_URL="${PLAYWRIGHT_BASE_URL:-https://carolinagrowth.co}"
TEST_EMAIL="${E2E_TEST_EMAIL:-qa@carolinagrowth.co}"

echo "=========================================="
echo "Comprehensive Feature Testing"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_feature() {
    local name=$1
    local url=$2
    local description=$3
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Page loads${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed (HTTP $response)${NC}"
        return 1
    fi
}

test_api_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    local data=${4:-""}
    
    echo -n "Testing API: $name... "
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    fi
    
    # Accept 200, 400 (validation errors), 401 (auth required), but not 404, 500, 502
    if [ "$response" = "200" ] || [ "$response" = "400" ] || [ "$response" = "401" ]; then
        echo -e "${GREEN}✓ Endpoint exists (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed (HTTP $response)${NC}"
        return 1
    fi
}

echo "=== Testing Page Loads ==="
test_feature "Home Page" "$BASE_URL/"
test_feature "SEO Auditor" "$BASE_URL/seo-audit"
test_feature "Competitor Comparison" "$BASE_URL/competitor-comparison"
test_feature "Marketing Readiness" "$BASE_URL/marketing-readiness"
test_feature "Competitive Intelligence" "$BASE_URL/competitive-intelligence"
test_feature "Lead Potential Calculator" "$BASE_URL/lead-potential"
test_feature "Content Generator" "$BASE_URL/content-generator"
test_feature "Free Consultation" "$BASE_URL/free-consultation"
test_feature "Client Portal" "$BASE_URL/portal"
test_feature "Pricing" "$BASE_URL/pricing"
test_feature "Services" "$BASE_URL/services"
test_feature "Contact" "$BASE_URL/contact"
test_feature "Tools" "$BASE_URL/tools"
test_feature "Legal" "$BASE_URL/legal"

echo ""
echo "=== Testing API Endpoints ==="
test_api_endpoint "Health Check" "/api/health"
test_api_endpoint "SEO Audit API" "/api/seo/audit" "POST" '{"url":"https://example.com","turnstileToken":"test"}'
test_api_endpoint "Competitor Compare API" "/api/competitor/compare" "POST" '{"url":"https://example.com","competitors":["https://competitor.com"],"turnstileToken":"test"}'
test_api_endpoint "Readiness Assess API" "/api/readiness/assess" "POST" '{"answers":{},"turnstileToken":"test"}'
test_api_endpoint "Intelligence Report API" "/api/intelligence/report" "POST" "{\"url\":\"https://example.com\",\"email\":\"$TEST_EMAIL\",\"turnstileToken\":\"test\"}"
test_api_endpoint "Lead Potential API" "/api/lead-potential/calculate" "POST" "{\"answers\":{},\"email\":\"$TEST_EMAIL\",\"turnstileToken\":\"test\"}"
test_api_endpoint "Content Generate API" "/api/content/generate" "POST" "{\"type\":\"blog\",\"topic\":\"test\",\"email\":\"$TEST_EMAIL\",\"turnstileToken\":\"test\"}"
test_api_endpoint "Consultation Book API" "/api/consultation/book" "POST" "{\"name\":\"Test\",\"email\":\"$TEST_EMAIL\",\"turnstileToken\":\"test\"}"
test_api_endpoint "Chat API" "/api/chat" "POST" "{\"name\":\"Test\",\"message\":\"test\",\"turnstileToken\":\"test\"}"
test_api_endpoint "Chat AI API" "/api/chat/ai" "POST" "{\"message\":\"test\",\"turnstileToken\":\"test\"}"
test_api_endpoint "Newsletter API" "/api/newsletter" "POST" "{\"email\":\"$TEST_EMAIL\",\"turnstileToken\":\"test\"}"
test_api_endpoint "Leads API" "/api/leads" "POST" "{\"name\":\"Test\",\"email\":\"$TEST_EMAIL\",\"turnstileToken\":\"test\"}"

echo ""
echo "=== Testing Stripe Endpoints ==="
test_api_endpoint "Stripe Payment Intent" "/api/stripe/payment-intent" "POST" "{\"planKey\":\"test\",\"name\":\"Test\",\"email\":\"$TEST_EMAIL\"}"
test_api_endpoint "Stripe Subscription" "/api/stripe/subscription" "POST" "{\"planKey\":\"marketing_launch_monthly\",\"name\":\"Test\",\"email\":\"$TEST_EMAIL\"}"

echo ""
echo "=========================================="
echo "Testing Complete"
echo "=========================================="
echo ""
echo -e "${YELLOW}Note:${NC} Some API endpoints may return 400 (validation errors) which is expected."
echo "The important thing is that endpoints exist and are reachable (not 404/500/502)."
echo ""
echo "For full E2E testing with Turnstile bypass, run:"
echo "  npm run test:e2e"
echo ""
