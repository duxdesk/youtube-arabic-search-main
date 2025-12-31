# Supabase Removal - Verification Checklist

## After Running remove-supabase.sh

### Step 1: Run the Script
```bash
cd ~/Desktop/myapp/youtube-arabic-search-main
chmod +x remove-supabase.sh
./remove-supabase.sh
```

### Step 2: Reinstall Dependencies
```bash
npm install
```

### Step 3: Check for Import Errors
Look for any remaining supabase imports:
```bash
# Should return nothing or only comments
grep -r "supabase" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "// Removed"
```

### Step 4: Verify Local Hooks are Complete
Check that local-hooks.ts has all these functions:
```bash
cat src/lib/local-hooks.ts | grep "export"
```

Expected functions:
- [ ] useYoutubers
- [ ] useAddYoutuber
- [ ] useUpdateYoutuber
- [ ] useDeleteYoutuber
- [ ] useTranscripts
- [ ] useAddTranscript
- [ ] useUpdateTranscript
- [ ] useDeleteTranscript

### Step 5: Test the Application
```bash
npm run dev
```

#### Pages to Test:
- [ ] Home page (/) - loads without errors
- [ ] Search page (/search) - can search transcripts
- [ ] Creators page (/creators) - shows YouTubers list
- [ ] Dashboard page (/dashboard) - bulk import works
- [ ] Manage page (/manage) - can add/edit/delete

#### Features to Test:
- [ ] Add new YouTuber
- [ ] Add new transcript
- [ ] Search functionality
- [ ] Bulk import JSON
- [ ] Edit existing data
- [ ] Delete data
- [ ] Local storage persists after refresh

### Step 6: Check Browser Console
Open Developer Tools (F12) and check for:
- [ ] No import errors
- [ ] No "supabase is not defined" errors
- [ ] Data loads correctly

### Step 7: Verify Data Storage
```bash
# Check that data is being saved to localStorage
# In browser console:
localStorage.getItem('youtubers')
localStorage.getItem('transcripts')
```

## If Something Breaks

### Quick Restore
```bash
# Find your backup folder
ls -la ~/Desktop/myapp/supabase-removal-backup-*

# Restore specific file
cp ~/Desktop/myapp/supabase-removal-backup-*/src/lib/supabase.js src/lib/
cp ~/Desktop/myapp/supabase-removal-backup-*/package.json .
npm install
```

### Common Issues

**Issue: "Cannot find module '@/lib/local-hooks'"**
- Solution: Make sure src/lib/local-hooks.ts exists and exports all needed functions

**Issue: "useYoutubers is not defined"**
- Solution: Check that local-hooks.ts exports this function
- Verify the import statement in the file using it

**Issue: Data not persisting**
- Solution: Check local-storage.ts has proper save/load functions
- Verify localStorage is not disabled in browser

**Issue: Bulk import fails**
- Solution: Check Dashboard.tsx is using local-hooks instead of supabase-hooks

## Files Modified by the Script

### Deleted:
- src/lib/supabase.js
- src/lib/supabase-hooks.ts

### Modified (imports updated):
- src/pages/Creators.tsx
- src/pages/Dashboard.tsx
- src/pages/Manage.tsx
- src/components/SearchResult.tsx
- src/components/YoutuberCard.tsx
- Any other files importing from supabase

### Modified:
- package.json (removed @supabase/supabase-js)

## Clean Up After Success

Once everything works for 24-48 hours:
```bash
# Delete the backup folder
rm -rf ~/Desktop/myapp/supabase-removal-backup-*

# Commit your changes
git add .
git commit -m "Removed Supabase, using local storage only"
```

## Need Help?

If you encounter issues, you can:
1. Check the backup folder for original files
2. Review the changes made by the script
3. Restore individual files as needed
