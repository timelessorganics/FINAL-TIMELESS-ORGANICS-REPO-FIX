#!/bin/bash

# Environment Setup Checker
# Helps verify all required environment variables are set

set -e

echo "=================================================="
echo "🔍 Environment Variables Setup Checker"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_var() {
    local var_name=$1
    local required=$2
    local show_value=$3
    
    if [ -z "${!var_name}" ]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $var_name (REQUIRED)${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  $var_name (optional)${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}✅ $var_name${NC}"
        if [ "$show_value" = "true" ]; then
            echo "   Value: ${!var_name}"
        else
            # Show partial value for security
            local value="${!var_name}"
            local masked="${value:0:4}****"
            echo "   Value: $masked"
        fi
        return 0
    fi
}

# Track missing required vars
missing_count=0

echo -e "${BLUE}📊 Database Configuration${NC}"
echo "-----------------------------------"
check_var "DATABASE_URL" "true" "false" || ((missing_count++))
echo ""

echo -e "${BLUE}🔐 Session Configuration${NC}"
echo "-----------------------------------"
check_var "SESSION_SECRET" "true" "false" || ((missing_count++))
echo ""

echo -e "${BLUE}💳 PayFast Configuration${NC}"
echo "-----------------------------------"
check_var "PAYFAST_MERCHANT_ID" "true" "true" || ((missing_count++))
check_var "PAYFAST_MERCHANT_KEY" "true" "false" || ((missing_count++))
check_var "PAYFAST_PASSPHRASE" "true" "false" || ((missing_count++))
check_var "PAYFAST_MODE" "true" "true" || ((missing_count++))
echo ""

echo -e "${BLUE}🗄️  Supabase Configuration${NC}"
echo "-----------------------------------"
check_var "SUPABASE_URL" "false" "true"
check_var "SUPABASE_SERVICE_ROLE_KEY" "false" "false"
echo ""

echo -e "${BLUE}🌍 Runtime Configuration${NC}"
echo "-----------------------------------"
check_var "NODE_ENV" "false" "true"
check_var "PORT" "false" "true"
echo ""

# PayFast validation
echo "=================================================="
if [ -n "$PAYFAST_MODE" ] && [ -n "$PAYFAST_MERCHANT_ID" ]; then
    echo -e "${BLUE}💡 PayFast Configuration Analysis${NC}"
    echo "-----------------------------------"
    echo "Mode: $PAYFAST_MODE"
    echo "Merchant ID: $PAYFAST_MERCHANT_ID"
    echo ""
    
    if [ "$PAYFAST_MODE" = "sandbox" ]; then
        if [ "$PAYFAST_MERCHANT_ID" = "10000100" ]; then
            echo -e "${GREEN}✅ Sandbox mode with sandbox credentials (CORRECT)${NC}"
        else
            echo -e "${YELLOW}⚠️  Sandbox mode with non-sandbox merchant ID${NC}"
            echo -e "${YELLOW}   Expected merchant ID: 10000100${NC}"
            echo -e "${YELLOW}   This may cause 'Invalid merchant ID' errors${NC}"
        fi
    elif [ "$PAYFAST_MODE" = "production" ]; then
        if [ "$PAYFAST_MERCHANT_ID" = "10043126" ]; then
            echo -e "${GREEN}✅ Production mode with production credentials (CORRECT)${NC}"
        elif [ "$PAYFAST_MERCHANT_ID" = "10000100" ]; then
            echo -e "${RED}❌ Production mode with sandbox merchant ID (WILL FAIL)${NC}"
        else
            echo -e "${GREEN}✅ Production mode with custom merchant ID${NC}"
        fi
    else
        echo -e "${RED}❌ Invalid PAYFAST_MODE: $PAYFAST_MODE${NC}"
        echo -e "${RED}   Must be 'sandbox' or 'production'${NC}"
    fi
    echo ""
fi

# Database URL validation
if [ -n "$DATABASE_URL" ]; then
    echo -e "${BLUE}🗄️  Database Connection Analysis${NC}"
    echo "-----------------------------------"
    
    if [[ $DATABASE_URL == *"supabase"* ]]; then
        echo -e "${GREEN}✅ Supabase connection detected${NC}"
    fi
    
    if [[ $DATABASE_URL == *":6543"* ]]; then
        echo -e "${GREEN}✅ Using connection pooler (port 6543)${NC}"
    elif [[ $DATABASE_URL == *":5432"* ]]; then
        echo -e "${YELLOW}⚠️  Using direct connection (port 5432)${NC}"
        echo -e "${YELLOW}   Consider using port 6543 (connection pooler) for better performance${NC}"
    fi
    
    if [[ $DATABASE_URL == *"pgbouncer=true"* ]]; then
        echo -e "${GREEN}✅ PgBouncer parameter present${NC}"
    else
        echo -e "${YELLOW}⚠️  PgBouncer parameter missing${NC}"
        echo -e "${YELLOW}   Add ?pgbouncer=true to the connection string${NC}"
    fi
    echo ""
fi

# Summary
echo "=================================================="
echo -e "${BLUE}📋 Summary${NC}"
echo "-----------------------------------"

if [ $missing_count -eq 0 ]; then
    echo -e "${GREEN}✅ All required environment variables are set!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify the same variables are set in Railway"
    echo "2. Verify VITE_API_URL is set in Netlify"
    echo "3. Push to GitHub to trigger Railway deployment"
    echo "4. Test your deployment"
else
    echo -e "${RED}❌ Missing $missing_count required environment variable(s)${NC}"
    echo ""
    echo "To fix:"
    echo "1. In Replit: Add missing variables to the Secrets tab (🔒)"
    echo "2. In Railway: Add missing variables to Variables tab"
    echo "3. Restart your server after adding variables"
    echo ""
    echo "See QUICK_FIX_GUIDE.md for detailed instructions"
fi

echo "=================================================="
