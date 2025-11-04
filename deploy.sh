#!/bin/bash
# Chuma Comply - Deployment Script
# This script helps deploy all components of the application

set -e  # Exit on error

echo "🚀 Chuma Comply Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Install with: npm install -g firebase-tools${NC}"
    exit 1
fi

# Check if logged in (simplified - just try to get current project)
# If this fails, deployment commands will fail with better error messages
if ! firebase use 2>&1 | grep -q -E "(Using|chumacomply|already using|No project)"; then
    echo -e "${YELLOW}⚠️  Warning: Could not verify Firebase login. Continuing anyway...${NC}"
    echo -e "${YELLOW}   If deployment fails, run: firebase login${NC}"
    echo ""
fi

# Check .firebaserc exists
if [ ! -f ".firebaserc" ]; then
    echo -e "${RED}❌ .firebaserc not found. Please create it first.${NC}"
    exit 1
fi

PROJECT_ID=$(cat .firebaserc | grep -o '"default": "[^"]*"' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "YOUR_PROJECT_ID" ]; then
    echo -e "${RED}❌ Please update .firebaserc with your actual project ID${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Project ID: $PROJECT_ID"
echo ""

# Parse command line arguments
DEPLOY_FIRESTORE=false
DEPLOY_FUNCTIONS=false
DEPLOY_HOSTING=false
DEPLOY_ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --firestore)
            DEPLOY_FIRESTORE=true
            shift
            ;;
        --functions)
            DEPLOY_FUNCTIONS=true
            shift
            ;;
        --hosting)
            DEPLOY_HOSTING=true
            shift
            ;;
        --all)
            DEPLOY_ALL=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./deploy.sh [--firestore] [--functions] [--hosting] [--all]"
            exit 1
            ;;
    esac
done

# If no flags provided, ask what to deploy
if [ "$DEPLOY_FIRESTORE" = false ] && [ "$DEPLOY_FUNCTIONS" = false ] && [ "$DEPLOY_HOSTING" = false ] && [ "$DEPLOY_ALL" = false ]; then
    echo "What would you like to deploy?"
    echo "1) All (Firestore + Functions + Hosting)"
    echo "2) Firestore only (rules and indexes)"
    echo "3) Functions only"
    echo "4) Hosting only"
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1) DEPLOY_ALL=true ;;
        2) DEPLOY_FIRESTORE=true ;;
        3) DEPLOY_FUNCTIONS=true ;;
        4) DEPLOY_HOSTING=true ;;
        *) echo "Invalid choice"; exit 1 ;;
    esac
fi

if [ "$DEPLOY_ALL" = true ]; then
    DEPLOY_FIRESTORE=true
    DEPLOY_FUNCTIONS=true
    DEPLOY_HOSTING=true
fi

# Deploy Firestore
if [ "$DEPLOY_FIRESTORE" = true ]; then
    echo -e "${YELLOW}📝 Deploying Firestore rules and indexes...${NC}"
    firebase deploy --only firestore
    echo -e "${GREEN}✓${NC} Firestore deployed"
    echo ""
fi

# Build and deploy Functions
if [ "$DEPLOY_FUNCTIONS" = true ]; then
    echo -e "${YELLOW}⚙️  Building workspace dependencies...${NC}"
    # Build api-trpc package first
    cd packages/api-trpc
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        pnpm install
    fi
    pnpm build
    cd ../..
    
    echo -e "${YELLOW}⚙️  Building TypeScript functions...${NC}"
    cd services/functions
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        pnpm install
    fi
    pnpm build
    cd ../..
    echo -e "${GREEN}✓${NC} TypeScript functions built"
    echo ""
    
    echo -e "${YELLOW}📦 Deploying functions...${NC}"
    firebase deploy --only functions
    echo -e "${GREEN}✓${NC} Functions deployed"
    echo ""
fi

# Build and deploy Hosting
if [ "$DEPLOY_HOSTING" = true ]; then
    echo -e "${YELLOW}🌐 Building web app...${NC}"
    cd apps/web
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        pnpm install
    fi
    pnpm build
    cd ../..
    echo -e "${GREEN}✓${NC} Web app built"
    echo ""
    
    echo -e "${YELLOW}🚀 Deploying to Firebase Hosting...${NC}"
    firebase deploy --only hosting
    echo -e "${GREEN}✓${NC} Hosting deployed"
    echo ""
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test your deployment at: https://$PROJECT_ID.web.app"
echo "2. Ingest PDFs using the ingestion function"
echo "3. Check Firestore for vectorChunks after ingestion"

