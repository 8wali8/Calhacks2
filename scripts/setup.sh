#!/bin/bash

# Quick setup script for Tavus Interview Demo

echo "🚀 Tavus Interview Demo - Quick Setup"
echo "======================================"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
  echo "✓ .env.local already exists"
else
  echo "📝 Creating .env.local from template..."
  cp .env.local.example .env.local
  echo "✓ Created .env.local"
  echo ""
  echo "⚠️  IMPORTANT: Edit .env.local and add your Tavus API key:"
  echo "   NEXT_PUBLIC_TAVUS_API_KEY=your_actual_api_key_here"
  echo ""
fi

# Check if node_modules exists
if [ -d node_modules ]; then
  echo "✓ Dependencies already installed"
else
  echo "📦 Installing dependencies..."

  # Detect package manager
  if command -v pnpm &> /dev/null; then
    echo "Using pnpm..."
    pnpm install
  elif command -v yarn &> /dev/null; then
    echo "Using yarn..."
    yarn install
  else
    echo "Using npm..."
    npm install
  fi

  echo "✓ Dependencies installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get your API key from https://platform.tavus.io"
echo "2. Edit .env.local and set NEXT_PUBLIC_TAVUS_API_KEY"
echo "3. Run: npm run dev (or pnpm dev)"
echo "4. Open: http://localhost:3000"
echo ""
echo "📚 See README.md for full documentation"
echo ""
