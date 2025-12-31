#!/bin/bash

# Remove Supabase - Keep Only Local Storage
# This script removes all supabase-related files since you're using local storage only

set -e  # Exit on error

PROJECT_DIR=~/Desktop/myapp/youtube-arabic-search-main
BACKUP_DIR=~/Desktop/myapp/supabase-removal-backup-$(date +%Y%m%d-%H%M%S)

echo "============================================"
echo "Remove Supabase - Keep Local Storage Only"
echo "============================================"
echo ""
echo "This will:"
echo "  1. Remove src/lib/supabase.js"
echo "  2. Remove src/lib/supabase-hooks.ts"
echo "  3. Update imports in all files to use local-hooks"
echo "  4. Remove @supabase/supabase-js from package.json"
echo ""
echo "Backup will be created at: $BACKUP_DIR"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Create backup
echo ""
echo "Creating backup..."
mkdir -p "$BACKUP_DIR"
cd "$PROJECT_DIR"

# Backup supabase files
if [ -f "src/lib/supabase.js" ]; then
    cp "src/lib/supabase.js" "$BACKUP_DIR/"
    echo "  ✓ Backed up supabase.js"
fi

if [ -f "src/lib/supabase-hooks.ts" ]; then
    cp "src/lib/supabase-hooks.ts" "$BACKUP_DIR/"
    echo "  ✓ Backed up supabase-hooks.ts"
fi

cp package.json "$BACKUP_DIR/"
echo "  ✓ Backed up package.json"

# Find and backup files that import from supabase
echo "  ✓ Backing up files that use supabase imports..."
grep -rl "from.*supabase" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | while read file; do
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"
done

echo ""
echo "Removing supabase files..."

# Remove supabase library files
if [ -f "src/lib/supabase.js" ]; then
    rm "src/lib/supabase.js"
    echo "  ✓ Deleted src/lib/supabase.js"
fi

if [ -f "src/lib/supabase-hooks.ts" ]; then
    rm "src/lib/supabase-hooks.ts"
    echo "  ✓ Deleted src/lib/supabase-hooks.ts"
fi

echo ""
echo "Updating imports in source files..."

# Replace supabase-hooks imports with local-hooks
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|from "@/lib/supabase-hooks"|from "@/lib/local-hooks"|g' {} \;
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|from.*@/integrations/supabase/client.*|// Removed supabase import - using local storage|g' {} \;

echo "  ✓ Updated imports to use local-hooks"

# Remove supabase imports (but keep the comment)
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '/import.*supabase.*from.*@\/lib\/supabase/d' {} \;

echo "  ✓ Removed supabase.js imports"

echo ""
echo "Updating package.json..."

# Remove @supabase/supabase-js from package.json
sed -i '/"@supabase\/supabase-js":/d' package.json

echo "  ✓ Removed @supabase/supabase-js from dependencies"

echo ""
echo "============================================"
echo "✅ Supabase Removal Complete!"
echo "============================================"
echo ""
echo "Changes made:"
echo "  ✓ Removed src/lib/supabase.js"
echo "  ✓ Removed src/lib/supabase-hooks.ts"
echo "  ✓ Updated all imports to use local-hooks"
echo "  ✓ Removed @supabase/supabase-js from package.json"
echo ""
echo "Backup saved to: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT - Next Steps:"
echo "  1. Reinstall dependencies: npm install"
echo "  2. Test your app: npm run dev"
echo "  3. Verify all pages work (Search, Creators, Dashboard)"
echo ""
echo "If you see any errors about missing imports:"
echo "  - Check that local-hooks.ts has all needed functions"
echo "  - Restore from backup if needed: $BACKUP_DIR"
echo ""
