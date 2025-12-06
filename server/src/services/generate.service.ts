import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { App, GenerateResponse, ErrorResponse } from '../types/index.js';
import { appsService } from './apps.service.js';

const execFileAsync = promisify(execFile);

export interface GenerateResult {
  success: true;
  data: GenerateResponse;
}

export interface GenerateError {
  success: false;
  error: ErrorResponse;
  status: number;
}

export type GenerateOutcome = GenerateResult | GenerateError;

// Configuration constants
const MAX_APPS_PER_BUILD = 50;
const APP_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

// Store for generated builds
const buildsDir = path.join(process.cwd(), 'builds');
const assetsDir = path.join(process.cwd(), 'assets');

// Helper to validate buildId format (UUID)
export function isValidBuildId(buildId: string): boolean {
  return uuidValidate(buildId);
}

// Helper to validate app ID format
function isValidAppId(appId: string): boolean {
  return typeof appId === 'string' &&
         appId.length > 0 &&
         appId.length <= 100 &&
         APP_ID_PATTERN.test(appId);
}

export class GenerateService {
  constructor() {
    // Ensure builds directory exists
    if (!fs.existsSync(buildsDir)) {
      fs.mkdirSync(buildsDir, { recursive: true });
    }
  }

  async generateInstallerAsync(appIds: string[]): Promise<GenerateOutcome> {
    // Validate empty request
    if (!appIds || appIds.length === 0) {
      return {
        success: false,
        error: { error: 'ต้องเลือกอย่างน้อย 1 แอปพลิเคชัน' },
        status: 400,
      };
    }

    // Validate appIds is an array
    if (!Array.isArray(appIds)) {
      return {
        success: false,
        error: { error: 'รูปแบบข้อมูลไม่ถูกต้อง' },
        status: 400,
      };
    }

    // Validate max apps limit
    if (appIds.length > MAX_APPS_PER_BUILD) {
      return {
        success: false,
        error: { error: `เลือกได้สูงสุด ${MAX_APPS_PER_BUILD} แอปพลิเคชัน` },
        status: 400,
      };
    }

    // Validate each app ID format
    const invalidIds = appIds.filter(id => !isValidAppId(id));
    if (invalidIds.length > 0) {
      return {
        success: false,
        error: { error: 'รหัสแอปพลิเคชันไม่ถูกต้อง' },
        status: 400,
      };
    }

    // Find requested apps (async)
    const apps = await appsService.getAppsByIds(appIds);
    const foundIds = apps.map((app) => app.id);
    const missingIds = appIds.filter((id) => !foundIds.includes(id));

    // Validate all apps exist
    if (missingIds.length > 0) {
      return {
        success: false,
        error: {
          error: 'ไม่พบบางแอปพลิเคชันที่เลือก',
          missing: missingIds,
        },
        status: 400,
      };
    }

    // Generate real PowerShell installer script
    const buildId = uuidv4();
    const script = this.generatePowerShellScript(apps);

    // Save the script to file
    const buildDir = path.join(buildsDir, buildId);
    fs.mkdirSync(buildDir, { recursive: true });

    const scriptPath = path.join(buildDir, 'KodLaewLong-Installer.ps1');
    fs.writeFileSync(scriptPath, script, 'utf-8');

    // Try to compile to EXE
    const exePath = path.join(buildDir, 'KodLaewLong-Installer.exe');
    const iconPath = path.join(assetsDir, 'installer.ico');
    const ps2exePath = path.join(assetsDir, 'ps2exe.ps1');

    try {
      // Use execFile with array arguments to prevent command injection
      const ps2exeScript = `. '${ps2exePath}'; Invoke-ps2exe -inputFile '${scriptPath}' -outputFile '${exePath}' -iconFile '${iconPath}' -title 'KodLaewLong Installer' -company 'KodLaewLong' -product 'Software Installer' -version '1.0.0.0' -noConsole -requireAdmin`;

      await execFileAsync('powershell', [
        '-ExecutionPolicy', 'Bypass',
        '-NoProfile',
        '-NonInteractive',
        '-Command', ps2exeScript
      ], {
        timeout: 60000,
        windowsHide: true,
        cwd: process.cwd()
      });

      if (fs.existsSync(exePath)) {
        // Remove ps1 if exe was generated successfully
        fs.unlinkSync(scriptPath);
        console.log('EXE generated successfully:', exePath);
      }
    } catch (error) {
      console.log('EXE compilation failed, falling back to BAT:', error);
      // Fallback: create BAT launcher
      const batContent = this.generateBatLauncher();
      const batPath = path.join(buildDir, 'Install.bat');
      fs.writeFileSync(batPath, batContent, 'utf-8');
    }

    const downloadUrl = `/api/downloads/${buildId}`;

    return {
      success: true,
      data: {
        selectedApps: apps,
        generatedScript: script,
        downloadUrl,
        generatedAt: new Date().toISOString(),
        buildId,
      },
    };
  }

  getBuildPath(buildId: string): string | null {
    const buildDir = path.join(buildsDir, buildId);
    if (fs.existsSync(buildDir)) {
      return buildDir;
    }
    return null;
  }

  getExePath(buildId: string): string | null {
    const buildDir = path.join(buildsDir, buildId);
    const exePath = path.join(buildDir, 'KodLaewLong-Installer.exe');
    if (fs.existsSync(exePath)) {
      return exePath;
    }
    return null;
  }

  private generatePowerShellScript(apps: App[]): string {
    const timestamp = new Date().toISOString();

    // Filter apps that have installerSourceUrl for auto-install
    const autoInstallApps = apps.filter(app => app.installerSourceUrl || app.wingetId);
    const manualApps = apps.filter(app => !app.installerSourceUrl && !app.wingetId);

    // Generate install commands for each app with Winget fallback support
    const installCommands = autoInstallApps.map((app, index) => {
      const extension = app.installerType === 'msi' ? 'msi' : 'exe';
      const silentArgs = app.silentArguments || '';
      const hasDirectDownload = !!app.installerSourceUrl;
      const hasWinget = !!app.wingetId;

      // MSI vs EXE install command
      const msiInstallCmd = `Start-Process "msiexec.exe" -ArgumentList "/i \`"$installerPath\`" ${silentArgs}" -Wait -NoNewWindow`;
      const exeInstallCmd = `Start-Process -FilePath $installerPath -ArgumentList "${silentArgs}" -Wait -NoNewWindow`;
      const installCmd = app.installerType === 'msi' ? msiInstallCmd : exeInstallCmd;

      if (hasDirectDownload && hasWinget) {
        // Has both: try direct download first, then Winget as fallback
        return `
        # ${app.name} (Direct + Winget fallback)
        Update-Progress -Current ${index + 1} -Total $totalApps -AppName "${app.name}" -Status "กำลังดาวน์โหลด..."
        $installed = $false
        $installerPath = "$tempDir\\${app.id}.${extension}"
        for ($retry = 1; $retry -le 3; $retry++) {
            try {
                Invoke-WebRequest -Uri "${app.installerSourceUrl}" -OutFile $installerPath -UseBasicParsing -TimeoutSec 120
                if (Test-Path $installerPath) {
                    Update-Progress -Current ${index + 1} -Total $totalApps -AppName "${app.name}" -Status "กำลังติดตั้ง..."
                    ${installCmd}
                    $installed = $true
                    $script:successCount++
                    break
                }
            } catch { if ($retry -lt 3) { Start-Sleep -Seconds 2 } }
        }
        if (-not $installed) {
            Update-Progress -Current ${index + 1} -Total $totalApps -AppName "${app.name}" -Status "ใช้ Winget..."
            try {
                $null = winget install --id "${app.wingetId}" --silent --accept-package-agreements --accept-source-agreements 2>&1
                if ($LASTEXITCODE -eq 0) { $installed = $true; $script:successCount++ }
            } catch {}
        }
        if (-not $installed) { $script:failedApps += "${app.name}" }`;
      } else if (hasDirectDownload) {
        // Direct download only with retry
        return `
        # ${app.name} (Direct download)
        Update-Progress -Current ${index + 1} -Total $totalApps -AppName "${app.name}" -Status "กำลังดาวน์โหลด..."
        $installed = $false
        $installerPath = "$tempDir\\${app.id}.${extension}"
        for ($retry = 1; $retry -le 3; $retry++) {
            try {
                Invoke-WebRequest -Uri "${app.installerSourceUrl}" -OutFile $installerPath -UseBasicParsing -TimeoutSec 120
                if (Test-Path $installerPath) {
                    Update-Progress -Current ${index + 1} -Total $totalApps -AppName "${app.name}" -Status "กำลังติดตั้ง..."
                    ${installCmd}
                    $installed = $true
                    $script:successCount++
                    break
                }
            } catch { if ($retry -lt 3) { Start-Sleep -Seconds 2 } }
        }
        if (-not $installed) { $script:failedApps += "${app.name}" }`;
      } else {
        // Winget only
        return `
        # ${app.name} (Winget)
        Update-Progress -Current ${index + 1} -Total $totalApps -AppName "${app.name}" -Status "ติดตั้งผ่าน Winget..."
        $installed = $false
        try {
            $null = winget install --id "${app.wingetId}" --silent --accept-package-agreements --accept-source-agreements 2>&1
            if ($LASTEXITCODE -eq 0) { $installed = $true; $script:successCount++ }
        } catch {}
        if (-not $installed) { $script:failedApps += "${app.name}" }`;
      }
    }).join("\n");

    // Commands for apps without direct download
    const manualCommands = manualApps.map(app => {
      return `Start-Process "${app.officialDownloadUrl || app.officialWebsiteUrl}"`;
    }).join("\n        ");

    return `#Requires -Version 5.1
<#
.SYNOPSIS
    KodLaewLong Installer Script
.DESCRIPTION
    สคริปต์ติดตั้งซอฟต์แวร์อัตโนมัติ สร้างโดย KodLaewLong
    รองรับ Direct Download และ Windows Package Manager (Winget)
.NOTES
    Generated: ${timestamp}
    Apps: ${apps.length} | Auto: ${autoInstallApps.length} | Manual: ${manualApps.length}
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Global variables
$script:successCount = 0
$script:failedApps = @()
$totalApps = ${autoInstallApps.length}

# Check Winget availability
$script:wingetAvailable = $false
try { $null = Get-Command winget -ErrorAction Stop; $script:wingetAvailable = $true } catch {}

# Create main form
$form = New-Object System.Windows.Forms.Form
$form.Text = "KodLaewLong Installer"
$form.Size = New-Object System.Drawing.Size(500, 280)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(30, 41, 59)
$form.ForeColor = [System.Drawing.Color]::White

# Title label
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "KodLaewLong Installer"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(96, 165, 250)
$titleLabel.AutoSize = $true
$titleLabel.Location = New-Object System.Drawing.Point(20, 20)
$form.Controls.Add($titleLabel)

# Status label
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "เตรียมพร้อมติดตั้ง..."
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$statusLabel.ForeColor = [System.Drawing.Color]::White
$statusLabel.Size = New-Object System.Drawing.Size(450, 25)
$statusLabel.Location = New-Object System.Drawing.Point(20, 70)
$form.Controls.Add($statusLabel)

# App name label
$appLabel = New-Object System.Windows.Forms.Label
$appLabel.Text = ""
$appLabel.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$appLabel.ForeColor = [System.Drawing.Color]::FromArgb(74, 222, 128)
$appLabel.Size = New-Object System.Drawing.Size(450, 25)
$appLabel.Location = New-Object System.Drawing.Point(20, 100)
$form.Controls.Add($appLabel)

# Progress bar
$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(20, 140)
$progressBar.Size = New-Object System.Drawing.Size(445, 30)
$progressBar.Style = "Continuous"
$progressBar.Value = 0
$form.Controls.Add($progressBar)

# Progress text
$progressText = New-Object System.Windows.Forms.Label
$progressText.Text = "0 / $totalApps"
$progressText.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$progressText.ForeColor = [System.Drawing.Color]::FromArgb(148, 163, 184)
$progressText.AutoSize = $true
$progressText.Location = New-Object System.Drawing.Point(20, 180)
$form.Controls.Add($progressText)

# Close button (hidden initially)
$closeButton = New-Object System.Windows.Forms.Button
$closeButton.Text = "ปิด"
$closeButton.Size = New-Object System.Drawing.Size(100, 35)
$closeButton.Location = New-Object System.Drawing.Point(365, 195)
$closeButton.BackColor = [System.Drawing.Color]::FromArgb(59, 130, 246)
$closeButton.ForeColor = [System.Drawing.Color]::White
$closeButton.FlatStyle = "Flat"
$closeButton.Visible = $false
$closeButton.Add_Click({ $form.Close() })
$form.Controls.Add($closeButton)

# Update progress function
function Update-Progress {
    param(
        [int]$Current,
        [int]$Total,
        [string]$AppName,
        [string]$Status
    )
    $percent = [math]::Round(($Current / $Total) * 100)
    $progressBar.Value = $percent
    $statusLabel.Text = $Status
    $appLabel.Text = $AppName
    $progressText.Text = "$Current / $Total"
    $form.Refresh()
    [System.Windows.Forms.Application]::DoEvents()
}

# Show complete function
function Show-Complete {
    $statusLabel.Text = "การติดตั้งเสร็จสิ้น!"
    $appLabel.Text = "สำเร็จ: $script:successCount รายการ"
    if ($script:failedApps.Count -gt 0) {
        $appLabel.Text += " | ล้มเหลว: $($script:failedApps.Count) รายการ"
        $appLabel.ForeColor = [System.Drawing.Color]::FromArgb(251, 191, 36)
    }
    $progressBar.Value = 100
    $closeButton.Visible = $true
    $form.Refresh()
}

# Create temp directory
$tempDir = "$env:TEMP\\KodLaewLong_" + (Get-Date -Format "yyyyMMddHHmmss")
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Start installation in background
$form.Add_Shown({
    # Run installation
    ${installCommands}

    # Open manual download pages if any
    ${manualApps.length > 0 ? `
    if ($true) {
        ${manualCommands}
    }` : ''}

    # Cleanup temp files
    try {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    } catch {}

    # Show completion
    Show-Complete
})

# Run form
[System.Windows.Forms.Application]::Run($form)
`;
  }

  private generateBatLauncher(): string {
    return `@echo off
chcp 65001 >nul
echo Starting KodLaewLong Installer...
powershell -ExecutionPolicy Bypass -File "%~dp0KodLaewLong-Installer.ps1"
pause
`;
  }
}

// Singleton instance
export const generateService = new GenerateService();
