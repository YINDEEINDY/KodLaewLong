using System;
using System.Diagnostics;
using System.IO;
using System.Text;

namespace KodLaewLong.Stub;

/// <summary>
/// Stub launcher that reads PowerShell script appended to itself
/// The server appends the PS1 script after a marker at the end of this EXE
/// </summary>
class Program
{
    const string MARKER = "###KODLAEWLONG_SCRIPT_START###";

    static int Main()
    {
        try
        {
            // Get the path of this executable
            string exePath = Environment.ProcessPath ?? Process.GetCurrentProcess().MainModule?.FileName ?? "";

            if (string.IsNullOrEmpty(exePath) || !File.Exists(exePath))
            {
                ShowError("Cannot find executable path");
                return 1;
            }

            // Read the entire executable
            byte[] exeBytes = File.ReadAllBytes(exePath);
            string exeContent = Encoding.UTF8.GetString(exeBytes);

            // Find the marker
            int markerIndex = exeContent.IndexOf(MARKER);
            if (markerIndex == -1)
            {
                ShowError("No embedded script found. This installer may be corrupted.");
                return 1;
            }

            // Extract the PowerShell script (after marker)
            string script = exeContent.Substring(markerIndex + MARKER.Length);

            // Create temp directory
            string tempDir = Path.Combine(Path.GetTempPath(), $"KodLaewLong_{DateTime.Now:yyyyMMddHHmmss}");
            Directory.CreateDirectory(tempDir);

            // Write the script to temp file
            string scriptPath = Path.Combine(tempDir, "KodLaewLong-Installer.ps1");
            File.WriteAllText(scriptPath, script, Encoding.UTF8);

            // Run PowerShell with admin rights
            var psi = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = $"-ExecutionPolicy Bypass -NoProfile -File \"{scriptPath}\"",
                UseShellExecute = true,
                Verb = "runas", // Request admin
                WorkingDirectory = tempDir
            };

            using var process = Process.Start(psi);
            process?.WaitForExit();

            // Cleanup
            try
            {
                Directory.Delete(tempDir, true);
            }
            catch { }

            return 0;
        }
        catch (Exception ex)
        {
            ShowError($"Error: {ex.Message}");
            return 1;
        }
    }

    static void ShowError(string message)
    {
        Console.WriteLine(message);
        Console.WriteLine("Press any key to exit...");
        Console.ReadKey();
    }
}
