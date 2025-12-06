import 'dotenv/config';
import { db, apps } from '../db/index.js';
import { eq } from 'drizzle-orm';

// Installer data for free apps
const installerUpdates = [
  {
    id: 'vscode',
    installerSourceUrl: 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user',
    installerType: 'exe',
    silentArguments: '/VERYSILENT /NORESTART /MERGETASKS=!runcode',
    version: 'latest',
  },
  {
    id: 'git',
    installerSourceUrl: 'https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe',
    installerType: 'exe',
    silentArguments: '/VERYSILENT /NORESTART',
    version: '2.47.1',
  },
  {
    id: 'nodejs',
    installerSourceUrl: 'https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi',
    installerType: 'msi',
    silentArguments: '/qn',
    version: '22.12.0 LTS',
  },
  {
    id: 'python',
    installerSourceUrl: 'https://www.python.org/ftp/python/3.13.1/python-3.13.1-amd64.exe',
    installerType: 'exe',
    silentArguments: '/quiet InstallAllUsers=1 PrependPath=1',
    version: '3.13.1',
  },
  {
    id: '7zip',
    installerSourceUrl: 'https://www.7-zip.org/a/7z2408-x64.exe',
    installerType: 'exe',
    silentArguments: '/S',
    version: '24.08',
  },
  {
    id: 'notepadpp',
    installerSourceUrl: 'https://github.com/notepad-plus-plus/notepad-plus-plus/releases/download/v8.7.1/npp.8.7.1.Installer.x64.exe',
    installerType: 'exe',
    silentArguments: '/S',
    version: '8.7.1',
  },
  {
    id: 'bitwarden',
    installerSourceUrl: 'https://vault.bitwarden.com/download/?app=desktop&platform=windows',
    installerType: 'exe',
    silentArguments: '/S',
    version: 'latest',
  },
];

async function updateInstallers() {
  console.log('Updating installer URLs...\n');

  for (const update of installerUpdates) {
    try {
      const result = await db
        .update(apps)
        .set({
          installerSourceUrl: update.installerSourceUrl,
          installerType: update.installerType,
          silentArguments: update.silentArguments,
          version: update.version,
          updatedAt: new Date(),
        })
        .where(eq(apps.id, update.id))
        .returning({ id: apps.id, name: apps.name });

      if (result.length > 0) {
        console.log(`✅ Updated: ${result[0].name} (${update.id})`);
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
  const withInstaller = allApps.filter(a => a.installerSourceUrl);
  console.log(`\nStats: ${withInstaller.length}/${allApps.length} apps have installer URLs`);

  process.exit(0);
}

updateInstallers().catch(console.error);
