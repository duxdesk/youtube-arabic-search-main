import Dexie, { type Table } from 'dexie';

export class MyDatabase extends Dexie {
  youtubers!: Table<any>;
  transcripts!: Table<any>;

  constructor() {
    super('YoutubeDatabase');
    this.version(1).stores({
      youtubers: 'id, arabic_name, english_name, rank',
      transcripts: 'id, youtuber_id, video_id'
    });

    // Seed data from JSON files on the server
    this.on('populate', async () => {
      try {
        const ytResponse = await fetch('/src/data/youtubers.json');
        const tsResponse = await fetch('/src/data/transcripts.json');
        
        if (ytResponse.ok && tsResponse.ok) {
          const youtubers = await ytResponse.json();
          const transcripts = await tsResponse.json();
          
          await this.youtubers.bulkAdd(youtubers);
          await this.transcripts.bulkAdd(transcripts);
          console.log("Database seeded successfully from server files");
        }
      } catch (err) {
        console.error("Could not find seed files, starting with empty DB", err);
      }
    });
  }
}

export const db = new MyDatabase();
