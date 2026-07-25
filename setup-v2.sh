#!/bin/bash

# Setup script for Family Tree + AI Bot features

set -e

echo "🚀 Setting up Levanonet v2.0 (Family Tree + AI Bot)"
echo ""

# Step 1: Check Node version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ $NODE_VERSION -lt 20 ]; then
  echo "❌ Node.js 20+ required. You have: $(node -v)"
  exit 1
fi
echo "✓ Node.js $(node -v) OK"
echo ""

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Step 3: Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found!"
  echo "Create one from .env.example:"
  echo "  cp .env.example .env"
  echo ""
fi

# Step 4: Prisma generate
echo "🔧 Generating Prisma client..."
npm exec prisma generate
echo "✓ Prisma generated"
echo ""

# Step 5: Database migration
echo "🗄️  Setting up database..."
echo "Choose one:"
echo "  1) npm run db:push         (for dev/local)"
echo "  2) npm run prisma migrate dev --name add-family-tree-and-bot (for migrations)"
echo ""

# Step 6: AI Bot initialization
echo "🤖 AI Bot will be initialized on app startup"
echo "   Username: levanobot"
echo "   Display: לבנו הבוט 🤖"
echo ""

# Step 7: Start dev server
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Then visit:"
echo "  http://localhost:3000              (Feed)"
echo "  http://localhost:3000/family-tree (Family Tree) - NEW! 🌳"
echo ""
echo "Documentation:"
echo "  - QUICK_UPDATE.md                   (סיכום מהיר)"
echo "  - FAMILY_TREE_AND_AI_BOT_GUIDE.md  (תיעוד מלא)"
echo "  - IMPLEMENTATION_STEPS.md           (צעדי יישום)"
echo ""
echo "✅ All set! Enjoy! 🚀"
