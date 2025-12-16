// Upload Transcript.csv to Supabase
// 
// HOW TO USE:
// 1. Save this as: upload-transcripts.js
// 2. Make sure csv-parser and dotenv are installed
// 3. Put Transcript.csv in the same folder
// 4. Run: node upload-transcripts.js

import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const transcripts = [];

console.log('📖 Reading Transcript.csv...');

// Read CSV file
fs.createReadStream('Transcript.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Parse timestamps if they're in JSON format
    let timestamps = [];
    let fullText = '';
    
    try {
      // Try to parse timestamps JSON
      if (row.timestamps) {
        timestamps = JSON.parse(row.timestamps);
        // Extract all text from timestamps
        fullText = timestamps.map(t => t.text || '').join(' ');
      }
    } catch (e) {
      console.warn('Warning: Could not parse timestamps for video:', row.video_id);
      timestamps = [];
    }
    
    transcripts.push({
      youtuber_id: row.youtuber_id || row['youtuber_id'] || '',
      video_title: row.video_title || row['video_title'] || '',
      video_url: row.video_url || row['video_url'] || '',
      video_id: row.video_id || row['video_id'] || '',
      publish_date: row.publish_date || row['publish_date'] || null,
      duration: row.duration || row['duration'] || '',
      timestamps: timestamps,
      full_text: fullText
    });
  })
  .on('end', async () => {
    console.log(`📊 Loaded ${transcripts.length} transcripts from CSV`);
    
    if (transcripts.length === 0) {
      console.error('❌ No data found in CSV file.');
      process.exit(1);
    }
    
    console.log('\n📝 Sample data (first transcript):');
    console.log(JSON.stringify(transcripts[0], null, 2));
    console.log('\n');
    
    await uploadToSupabase(transcripts);
  })
  .on('error', (error) => {
    console.error('❌ Error reading CSV file:', error.message);
    process.exit(1);
  });

async function uploadToSupabase(data) {
  console.log('🚀 Starting upload to Supabase...');
  console.log(`📦 Total transcripts: ${data.length}`);
  console.log(`📦 Uploading in batches of 25 (transcripts can be large)...`);
  
  // Use smaller batch size for transcripts (they can be large)
  const batchSize = 25;
  let uploaded = 0;
  let failed = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(data.length / batchSize);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/transcripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(batch)
      });
      
      if (response.ok) {
        uploaded += batch.length;
        console.log(`✅ Batch ${batchNum}/${totalBatches}: ${uploaded}/${data.length} transcripts uploaded`);
      } else {
        const error = await response.text();
        failed += batch.length;
        console.error(`❌ Batch ${batchNum} failed:`, error);
      }
    } catch (error) {
      failed += batch.length;
      console.error(`❌ Network error in batch ${batchNum}:`, error.message);
    }
    
    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 UPLOAD SUMMARY:');
  console.log(`✅ Successfully uploaded: ${uploaded} transcripts`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} transcripts`);
  }
  console.log('='.repeat(50) + '\n');
  
  if (uploaded > 0) {
    console.log('🎉 Upload complete!');
  }
}
