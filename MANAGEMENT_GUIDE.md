# 🗂️ Data Management Guide

## Managing YouTubers and Transcripts

Your app now has a powerful **Manage** page where you can view and delete YouTubers and their associated transcripts.

---

## 📍 Access the Manage Page

Navigate to: **`http://localhost:8080/manage`**

Or click on **"إدارة"** or **"Manage"** in the navigation menu.

---

## 🎯 Features

### 1. **Statistics Overview**

At the top of the page, you'll see three cards showing:
- 📊 **Total YouTubers** - Number of YouTubers in your database
- 📝 **Total Transcripts** - Number of video transcripts
- 🎥 **Total Videos** - Same as transcripts (each transcript = 1 video)

### 2. **Search YouTubers**

- Use the search bar to filter YouTubers by name (Arabic or English)
- Search updates in real-time as you type

### 3. **YouTuber List**

Each YouTuber card shows:
- ✅ **Avatar** - Profile picture or first letter
- ✅ **Arabic Name** - Primary name
- ✅ **English Name** - Secondary name
- ✅ **Category Badge** - Category tag (if available)
- ✅ **Video Count** - Number of transcripts for this YouTuber
- ✅ **Subscriber Count** - Number of subscribers (if available)
- ✅ **Copy ID Button** - Copy YouTuber ID to clipboard
- ✅ **Delete Button** - Remove YouTuber and all their videos

---

## 🗑️ How to Delete a YouTuber

### Step-by-Step:

1. **Go to Manage page**: `http://localhost:8080/manage`

2. **Find the YouTuber** you want to delete (use search if needed)

3. **Click the "حذف" (Delete) button** on the right side of the YouTuber card

4. **Confirmation Dialog appears** showing:
   - YouTuber name
   - Number of videos that will be deleted
   - Warning that this action cannot be undone

5. **Click "حذف نهائياً" (Delete Permanently)** to confirm
   - Or click "إلغاء" (Cancel) to abort

6. **Done!** The YouTuber and all their transcripts are removed

---

## ⚠️ Important Notes

### **Cascade Delete**
When you delete a YouTuber, **ALL their transcripts are also deleted automatically**. This is intentional to keep your data clean.

### **No Undo**
Deletion is permanent! The data is removed from localStorage and cannot be recovered unless you have a backup.

### **Backup Before Deleting**
To be safe, export your data before deleting:
```javascript
// In browser console
import { exportData } from '@/lib/local-storage';
exportData();
```

---

## 📋 Management Tasks

### **Copy YouTuber ID**
Click "نسخ ID" to copy the YouTuber's unique identifier. Use this when:
- Adding new transcripts
- Debugging
- Referencing in JSON files

### **View Details**
Each card shows:
- Number of videos (transcripts) for that YouTuber
- Subscriber count
- Category
- Full names in both languages

### **Search and Filter**
- Type in the search box to filter by name
- Works with both Arabic and English names
- Real-time filtering

---

## 🔄 Managing Transcripts

### **Indirect Management**
Transcripts are managed through their YouTubers:
- Delete a YouTuber → All their transcripts are deleted
- Add transcripts → Use the Dashboard upload feature

### **View Transcript Count**
Each YouTuber card shows how many videos/transcripts they have.

### **Future Enhancement**
Currently, you can only delete transcripts by deleting the YouTuber. If you need to delete individual transcripts, you would need to:
1. Export your data
2. Edit the JSON file
3. Clear localStorage
4. Re-import the edited data

---

## 💡 Tips

1. **Use Search** - Quickly find YouTubers by typing their name
2. **Check Video Count** - Before deleting, see how many videos will be removed
3. **Copy IDs** - Keep YouTuber IDs handy for adding new transcripts
4. **Regular Backups** - Export your data regularly to avoid data loss

---

## 🎨 UI Features

- **Hover Effects** - Cards highlight when you hover
- **Color-Coded** - Delete button is red to indicate danger
- **Responsive** - Works on all screen sizes
- **RTL Support** - Proper right-to-left layout for Arabic
- **Confirmation Dialog** - Prevents accidental deletions

---

## 📊 Example Workflow

### Cleaning Up Your Database:

1. Go to **Manage** page
2. **Search** for outdated YouTubers
3. **Review** their video count
4. **Delete** YouTubers you no longer need
5. **Verify** on the home page that they're gone

### Before Adding New Data:

1. Go to **Manage** page
2. **Copy** the YouTuber ID you want to add videos for
3. Go to **Dashboard**
4. **Paste** the ID in your JSON file
5. **Upload** the transcripts

---

## 🚀 Quick Access

- **Home**: `/` - View all YouTubers
- **Search**: `/search/:youtuberId` - Search within a YouTuber's content
- **Dashboard**: `/dashboard` - Upload new data
- **Manage**: `/manage` - Delete and manage data
- **Creators**: `/creators` - View creators (if implemented)

---

Enjoy managing your YouTube Arabic Search data! 🎉
