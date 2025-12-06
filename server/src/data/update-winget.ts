import 'dotenv/config';
import { db, apps } from '../db/index.js';
import { eq } from 'drizzle-orm';

// Winget package IDs for popular apps
const wingetUpdates = [
  { id: 'chrome', wingetId: 'Google.Chrome' },
  { id: 'firefox', wingetId: 'Mozilla.Firefox' },
  { id: 'edge', wingetId: 'Microsoft.Edge' },
  { id: 'brave', wingetId: 'Brave.Brave' },
  { id: 'vscode', wingetId: 'Microsoft.VisualStudioCode' },
  { id: 'git', wingetId: 'Git.Git' },
  { id: 'nodejs', wingetId: 'OpenJS.NodeJS.LTS' },
  { id: 'python', wingetId: 'Python.Python.3.13' },
  { id: '7zip', wingetId: '7zip.7zip' },
  { id: 'notepadpp', wingetId: 'Notepad++.Notepad++' },
  { id: 'bitwarden', wingetId: 'Bitwarden.Bitwarden' },
  { id: 'vlc', wingetId: 'VideoLAN.VLC' },
  { id: 'spotify', wingetId: 'Spotify.Spotify' },
  { id: 'discord', wingetId: 'Discord.Discord' },
  { id: 'steam', wingetId: 'Valve.Steam' },
  { id: 'slack', wingetId: 'SlackTechnologies.Slack' },
  { id: 'zoom', wingetId: 'Zoom.Zoom' },
  { id: 'malwarebytes', wingetId: 'Malwarebytes.Malwarebytes' },
  { id: 'winrar', wingetId: 'RARLab.WinRAR' },
  { id: 'jetbrains-toolbox', wingetId: 'JetBrains.Toolbox' },
];

async function updateWingetIds() {
  console.log('Updating Winget IDs...\n');

  for (const update of wingetUpdates) {
    try {
      const result = await db
        .update(apps)
        .set({
          wingetId: update.wingetId,
          updatedAt: new Date(),
        })
        .where(eq(apps.id, update.id))
        .returning({ id: apps.id, name: apps.name });

      if (result.length > 0) {
        console.log(`✅ Updated: ${result[0].name} -> ${update.wingetId}`);
      } else {
        console.log(`⚠️ Not found: ${update.id}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.id}:`, error);
    }
  }

  console.log('\nUpdate complete!');

  // Show stats
  const allApps = await db.select().from(apps);
  const withWinget = allApps.filter(a => a.wingetId);
  console.log(`\nStats: ${withWinget.length}/${allApps.length} apps have Winget IDs`);

  process.exit(0);
}

updateWingetIds().catch(console.error);
