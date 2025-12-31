#!/bin/bash

# Safe Cleanup Script for YouTube Arabic Search App
# This script removes duplicate and unused files with a backup option

set -e  # Exit on error

PROJECT_DIR=~/Desktop/myapp/youtube-arabic-search-main
BACKUP_DIR=~/Desktop/myapp/cleanup-backup-$(date +%Y%m%d-%H%M%S)

echo "=================================="
echo "YouTube Arabic Search - Cleanup"
echo "=================================="
echo ""
echo "This will remove:"
echo "  - src/App.js (unused)"
echo "  - src/App.jsx (uses old Layout.js)"
echo "  - src/components/Layout.js (only used by App.jsx)"
echo "  - src/pages.backup/ (old backup folder)"
echo ""
echo "Backup will be created at: $BACKUP_DIR"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

# Create backup directory
echo ""
echo "Creating backup..."
mkdir -p "$BACKUP_DIR"

# Navigate to project
cd "$PROJECT_DIR"

# Backup files before deletion
echo "Backing up files..."
if [ -f "src/App.js" ]; then
    cp "src/App.js" "$BACKUP_DIR/"
    echo "  ✓ Backed up App.js"
fi

if [ -f "src/App.jsx" ]; then
    cp "src/App.jsx" "$BACKUP_DIR/"
    echo "  ✓ Backed up App.jsx"
fi

if [ -f "src/components/Layout.js" ]; then
    cp "src/components/Layout.js" "$BACKUP_DIR/"
    echo "  ✓ Backed up Layout.js"
fi

if [ -d "src/pages.backup" ]; then
    cp -r "src/pages.backup" "$BACKUP_DIR/"
    echo "  ✓ Backed up pages.backup/"
fi

# Delete files
echo ""
echo "Removing duplicate files..."

if [ -f "src/App.js" ]; then
    rm "src/App.js"
    echo "  ✓ Deleted src/App.js"
fi

if [ -f "src/App.jsx" ]; then
    rm "src/App.jsx"
    echo "  ✓ Deleted src/App.jsx"
fi

if [ -f "src/components/Layout.js" ]; then
    rm "src/components/Layout.js"
    echo "  ✓ Deleted src/components/Layout.js"
fi

if [ -d "src/pages.backup" ]; then
    rm -rf "src/pages.backup"
    echo "  ✓ Deleted src/pages.backup/"
fi

echo ""
echo "=================================="
echo "✅ Cleanup Complete!"
echo "=================================="
echo ""
echo "Files removed:"
echo "  - src/App.js"
echo "  - src/App.jsx"
echo "  - src/components/Layout.js"
echo "  - src/pages.backup/"
echo ""
echo "Backup saved to: $BACKUP_DIR"
echo ""
echo "Your app should still work normally with:"
echo "  - src/App.tsx (main app file)"
echo "  - src/main.tsx (entry point)"
echo ""
echo "Next steps:"
echo "  1. Test your app: npm run dev"
echo "  2. If everything works, you can delete the backup folder"
echo "  3. If there are issues, restore from: $BACKUP_DIR"
echo ""
