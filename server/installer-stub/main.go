package main

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
)

const SCRIPT_MARKER = "###KODLAEWLONG_SCRIPT_START###"

func main() {
	// Get path to this executable
	exePath, err := os.Executable()
	if err != nil {
		showError("ไม่สามารถหาตำแหน่งไฟล์ได้: " + err.Error())
		return
	}

	// Read the executable file
	data, err := os.ReadFile(exePath)
	if err != nil {
		showError("ไม่สามารถอ่านไฟล์ได้: " + err.Error())
		return
	}

	// Find the script marker
	markerBytes := []byte(SCRIPT_MARKER)
	markerIndex := bytes.Index(data, markerBytes)
	if markerIndex == -1 {
		showError("ไม่พบสคริปต์ติดตั้ง กรุณาดาวน์โหลดไฟล์ใหม่")
		return
	}

	// Extract the PowerShell script (after the marker)
	scriptStart := markerIndex + len(markerBytes)
	script := string(data[scriptStart:])

	if len(script) == 0 {
		showError("สคริปต์ติดตั้งว่างเปล่า")
		return
	}

	// Create temp file for the script
	tempDir := os.TempDir()
	scriptPath := filepath.Join(tempDir, "KodLaewLong-Installer.ps1")

	err = os.WriteFile(scriptPath, []byte(script), 0644)
	if err != nil {
		showError("ไม่สามารถสร้างไฟล์ชั่วคราวได้: " + err.Error())
		return
	}

	// Clean up script file when done
	defer os.Remove(scriptPath)

	// Run PowerShell with the script
	// -ExecutionPolicy Bypass: Allow running the script
	// -NoProfile: Don't load user profile (faster)
	// -WindowStyle Hidden: Hide PowerShell window (GUI will show)
	cmd := exec.Command("powershell.exe",
		"-ExecutionPolicy", "Bypass",
		"-NoProfile",
		"-File", scriptPath,
	)

	// Set process attributes to hide console window
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow: true,
	}

	// Run and wait for completion
	err = cmd.Run()
	if err != nil {
		// If PowerShell fails, try running with visible window for debugging
		cmd2 := exec.Command("powershell.exe",
			"-ExecutionPolicy", "Bypass",
			"-NoProfile",
			"-File", scriptPath,
		)
		cmd2.Run()
	}
}

func showError(message string) {
	// Use PowerShell to show a message box
	script := fmt.Sprintf(`
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.MessageBox]::Show('%s', 'KodLaewLong Error', 'OK', 'Error')
`, message)

	cmd := exec.Command("powershell.exe", "-Command", script)
	cmd.Run()
}
