using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace KodLaewLong.Installer;

public class MainForm : Form
{
    private readonly List<AppInfo> _apps = new();
    private readonly HttpClient _httpClient = new();
    private readonly Panel _headerPanel;
    private readonly ListView _appListView;
    private readonly ProgressBar _progressBar;
    private readonly Label _statusLabel;
    private readonly Button _installButton;
    private readonly Button _cancelButton;
    private readonly RichTextBox _logTextBox;
    private bool _isInstalling = false;
    private bool _cancelRequested = false;

    public MainForm()
    {
        // Form settings
        Text = "KodLaewLong Installer";
        Size = new Size(700, 600);
        MinimumSize = new Size(600, 500);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(249, 250, 251);
        Font = new Font("Segoe UI", 9F);

        // Header Panel with gradient
        _headerPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 80,
            BackColor = Color.FromArgb(79, 70, 229) // Indigo
        };
        _headerPanel.Paint += HeaderPanel_Paint;

        var titleLabel = new Label
        {
            Text = "KodLaewLong",
            Font = new Font("Segoe UI", 20F, FontStyle.Bold),
            ForeColor = Color.White,
            AutoSize = true,
            Location = new Point(20, 15),
            BackColor = Color.Transparent
        };

        var subtitleLabel = new Label
        {
            Text = "Software Installer",
            Font = new Font("Segoe UI", 10F),
            ForeColor = Color.FromArgb(200, 200, 255),
            AutoSize = true,
            Location = new Point(22, 48),
            BackColor = Color.Transparent
        };

        _headerPanel.Controls.AddRange(new Control[] { titleLabel, subtitleLabel });

        // Main content panel
        var contentPanel = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(20)
        };

        // Apps label
        var appsLabel = new Label
        {
            Text = "Apps to Install:",
            Font = new Font("Segoe UI", 11F, FontStyle.Bold),
            ForeColor = Color.FromArgb(31, 41, 55),
            AutoSize = true,
            Location = new Point(20, 10)
        };

        // App ListView
        _appListView = new ListView
        {
            View = View.Details,
            FullRowSelect = true,
            GridLines = false,
            BorderStyle = BorderStyle.FixedSingle,
            Location = new Point(20, 35),
            Size = new Size(640, 200),
            Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right,
            Font = new Font("Segoe UI", 9F),
            CheckBoxes = true
        };
        _appListView.Columns.Add("App Name", 200);
        _appListView.Columns.Add("Status", 150);
        _appListView.Columns.Add("Install Method", 150);

        // Progress section
        _statusLabel = new Label
        {
            Text = "Ready to install",
            Font = new Font("Segoe UI", 9F),
            ForeColor = Color.FromArgb(107, 114, 128),
            Location = new Point(20, 250),
            Size = new Size(640, 20),
            Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right
        };

        _progressBar = new ProgressBar
        {
            Location = new Point(20, 275),
            Size = new Size(640, 25),
            Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right,
            Style = ProgressBarStyle.Continuous
        };

        // Log textbox
        _logTextBox = new RichTextBox
        {
            Location = new Point(20, 310),
            Size = new Size(640, 150),
            Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Bottom,
            ReadOnly = true,
            Font = new Font("Consolas", 9F),
            BackColor = Color.FromArgb(31, 41, 55),
            ForeColor = Color.FromArgb(156, 163, 175),
            BorderStyle = BorderStyle.None
        };

        // Buttons panel
        var buttonPanel = new Panel
        {
            Dock = DockStyle.Bottom,
            Height = 60,
            Padding = new Padding(20, 10, 20, 10)
        };

        _installButton = new Button
        {
            Text = "Install Selected Apps",
            Size = new Size(180, 40),
            Location = new Point(20, 10),
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.FromArgb(16, 185, 129), // Emerald
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 10F, FontStyle.Bold),
            Cursor = Cursors.Hand
        };
        _installButton.FlatAppearance.BorderSize = 0;
        _installButton.Click += InstallButton_Click;

        _cancelButton = new Button
        {
            Text = "Cancel",
            Size = new Size(100, 40),
            Location = new Point(210, 10),
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.FromArgb(239, 68, 68), // Red
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 10F),
            Cursor = Cursors.Hand,
            Enabled = false
        };
        _cancelButton.FlatAppearance.BorderSize = 0;
        _cancelButton.Click += CancelButton_Click;

        buttonPanel.Controls.AddRange(new Control[] { _installButton, _cancelButton });
        contentPanel.Controls.AddRange(new Control[] { appsLabel, _appListView, _statusLabel, _progressBar, _logTextBox });

        Controls.AddRange(new Control[] { contentPanel, buttonPanel, _headerPanel });

        // Load config
        LoadConfig();
    }

    private void HeaderPanel_Paint(object? sender, PaintEventArgs e)
    {
        using var brush = new LinearGradientBrush(
            _headerPanel.ClientRectangle,
            Color.FromArgb(79, 70, 229),  // Indigo
            Color.FromArgb(147, 51, 234), // Purple
            LinearGradientMode.Horizontal);
        e.Graphics.FillRectangle(brush, _headerPanel.ClientRectangle);
    }

    private void LoadConfig()
    {
        try
        {
            // Try to load from external config file first
            var configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json");
            string jsonContent;

            if (File.Exists(configPath))
            {
                jsonContent = File.ReadAllText(configPath);
            }
            else
            {
                // Try embedded resource
                var assembly = System.Reflection.Assembly.GetExecutingAssembly();
                using var stream = assembly.GetManifestResourceStream("KodLaewLong.Installer.config.json");
                if (stream == null)
                {
                    Log("No config.json found. Please place config.json next to the exe.", Color.Red);
                    return;
                }
                using var reader = new StreamReader(stream);
                jsonContent = reader.ReadToEnd();
            }

            var config = JsonSerializer.Deserialize<InstallerConfig>(jsonContent);
            if (config?.Apps != null)
            {
                _apps.Clear();
                _apps.AddRange(config.Apps);

                _appListView.Items.Clear();
                foreach (var app in _apps)
                {
                    var item = new ListViewItem(app.Name) { Checked = true };
                    item.SubItems.Add("Pending");
                    item.SubItems.Add(GetInstallMethod(app));
                    item.Tag = app;
                    _appListView.Items.Add(item);
                }

                Log($"Loaded {_apps.Count} apps to install", Color.LightGreen);
            }
        }
        catch (Exception ex)
        {
            Log($"Error loading config: {ex.Message}", Color.Red);
        }
    }

    private string GetInstallMethod(AppInfo app)
    {
        if (!string.IsNullOrEmpty(app.WingetId)) return "Winget";
        if (!string.IsNullOrEmpty(app.InstallerUrl)) return "Direct Download";
        return "Manual";
    }

    private async void InstallButton_Click(object? sender, EventArgs e)
    {
        if (_isInstalling) return;

        var selectedApps = new List<AppInfo>();
        foreach (ListViewItem item in _appListView.Items)
        {
            if (item.Checked && item.Tag is AppInfo app)
            {
                selectedApps.Add(app);
            }
        }

        if (selectedApps.Count == 0)
        {
            MessageBox.Show("Please select at least one app to install.", "No Apps Selected",
                MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }

        _isInstalling = true;
        _cancelRequested = false;
        _installButton.Enabled = false;
        _cancelButton.Enabled = true;
        _progressBar.Value = 0;
        _progressBar.Maximum = selectedApps.Count;

        Log("Starting installation...", Color.Cyan);

        int successCount = 0;
        int failCount = 0;

        for (int i = 0; i < selectedApps.Count; i++)
        {
            if (_cancelRequested)
            {
                Log("Installation cancelled by user.", Color.Yellow);
                break;
            }

            var app = selectedApps[i];
            UpdateStatus($"Installing {app.Name} ({i + 1}/{selectedApps.Count})...");
            UpdateListItemStatus(app.Name, "Installing...");

            bool success = await InstallApp(app);

            if (success)
            {
                successCount++;
                UpdateListItemStatus(app.Name, "Installed");
                Log($"[OK] {app.Name} installed successfully", Color.LightGreen);
            }
            else
            {
                failCount++;
                UpdateListItemStatus(app.Name, "Failed");
                Log($"[FAIL] {app.Name} installation failed", Color.Red);
            }

            _progressBar.Value = i + 1;
        }

        _isInstalling = false;
        _installButton.Enabled = true;
        _cancelButton.Enabled = false;

        var message = $"Installation complete!\n\nSuccessful: {successCount}\nFailed: {failCount}";
        UpdateStatus(message.Replace("\n", " "));
        Log(message.Replace("\n", " "), Color.Cyan);

        MessageBox.Show(message, "Installation Complete",
            MessageBoxButtons.OK, successCount > 0 ? MessageBoxIcon.Information : MessageBoxIcon.Warning);
    }

    private void CancelButton_Click(object? sender, EventArgs e)
    {
        _cancelRequested = true;
        _cancelButton.Enabled = false;
        UpdateStatus("Cancelling...");
    }

    private async Task<bool> InstallApp(AppInfo app)
    {
        try
        {
            // Try Winget first if available
            if (!string.IsNullOrEmpty(app.WingetId) && await IsWingetAvailable())
            {
                return await InstallViaWinget(app.WingetId);
            }

            // Try direct download
            if (!string.IsNullOrEmpty(app.InstallerUrl))
            {
                return await InstallViaDownload(app);
            }

            Log($"  No installation method available for {app.Name}", Color.Yellow);
            return false;
        }
        catch (Exception ex)
        {
            Log($"  Error installing {app.Name}: {ex.Message}", Color.Red);
            return false;
        }
    }

    private async Task<bool> IsWingetAvailable()
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = "winget",
                Arguments = "--version",
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true
            };
            using var process = Process.Start(psi);
            if (process != null)
            {
                await process.WaitForExitAsync();
                return process.ExitCode == 0;
            }
        }
        catch { }
        return false;
    }

    private async Task<bool> InstallViaWinget(string wingetId)
    {
        Log($"  Installing via Winget: {wingetId}", Color.Gray);

        var psi = new ProcessStartInfo
        {
            FileName = "winget",
            Arguments = $"install --id {wingetId} --accept-source-agreements --accept-package-agreements --silent",
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        };

        using var process = Process.Start(psi);
        if (process == null) return false;

        await process.WaitForExitAsync();
        return process.ExitCode == 0;
    }

    private async Task<bool> InstallViaDownload(AppInfo app)
    {
        Log($"  Downloading: {app.InstallerUrl}", Color.Gray);

        var tempPath = Path.Combine(Path.GetTempPath(), $"kodlaewlong_{app.Id}_{Guid.NewGuid():N}.exe");

        try
        {
            // Download
            using var response = await _httpClient.GetAsync(app.InstallerUrl);
            response.EnsureSuccessStatusCode();

            await using var fs = new FileStream(tempPath, FileMode.Create);
            await response.Content.CopyToAsync(fs);

            // Install
            Log($"  Running installer...", Color.Gray);

            var args = app.SilentArgs ?? "/S /silent /quiet";
            var psi = new ProcessStartInfo
            {
                FileName = tempPath,
                Arguments = args,
                UseShellExecute = true,
                Verb = "runas" // Run as admin
            };

            using var process = Process.Start(psi);
            if (process == null) return false;

            await process.WaitForExitAsync();
            return process.ExitCode == 0;
        }
        finally
        {
            // Cleanup
            try { if (File.Exists(tempPath)) File.Delete(tempPath); } catch { }
        }
    }

    private void UpdateStatus(string message)
    {
        if (InvokeRequired)
        {
            Invoke(() => UpdateStatus(message));
            return;
        }
        _statusLabel.Text = message;
    }

    private void UpdateListItemStatus(string appName, string status)
    {
        if (InvokeRequired)
        {
            Invoke(() => UpdateListItemStatus(appName, status));
            return;
        }

        foreach (ListViewItem item in _appListView.Items)
        {
            if (item.Text == appName)
            {
                item.SubItems[1].Text = status;
                break;
            }
        }
    }

    private void Log(string message, Color color)
    {
        if (InvokeRequired)
        {
            Invoke(() => Log(message, color));
            return;
        }

        _logTextBox.SelectionStart = _logTextBox.TextLength;
        _logTextBox.SelectionLength = 0;
        _logTextBox.SelectionColor = color;
        _logTextBox.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}\n");
        _logTextBox.ScrollToCaret();
    }
}

public class InstallerConfig
{
    public List<AppInfo>? Apps { get; set; }
    public string? BuildId { get; set; }
    public string? GeneratedAt { get; set; }
}

public class AppInfo
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string? WingetId { get; set; }
    public string? InstallerUrl { get; set; }
    public string? SilentArgs { get; set; }
}
