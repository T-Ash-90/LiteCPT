const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let pythonProcess;


// Create Electron app window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: true
      }
    });

    mainWindow.loadFile(path.join(__dirname, 'frontend', 'index.html'));
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


// Start backend
function startBackend() {
    const venvPython = path.join(__dirname, '.venv', 'bin', 'python');
    const winVenvPython = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
    const serverPath = path.join(__dirname, 'backend', 'server.py');

    let pythonPath;
    if (fs.existsSync(venvPython)) {
        pythonPath = venvPython; // macOS/Linux
    } else if (fs.existsSync(winVenvPython)) {
        pythonPath = winVenvPython; // Windows
    } else {
        console.error('Virtual environment not found in root directory.');
        console.error('Please run from project root: python -m venv .venv');
        console.error('Then install dependencies with: .venv/bin/pip install -r requirements.txt');
        return;
    }

    if (!fs.existsSync(serverPath)) {
        console.error('Backend server not found at:', serverPath);
        return;
    }

    pythonProcess = spawn(pythonPath, ['-m', 'backend.server'], {
        cwd: path.join(__dirname)
    });

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Backend error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });

    pythonProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
    if (data.toString().includes('Application startup complete')) {
        if (mainWindow) {
            mainWindow.webContents.reload();
        } else {
            createWindow();
        }
      }
    });

}


// Stop backend
function stopBackend() {
    if (pythonProcess) {
        pythonProcess.kill();
        pythonProcess = null;
    }
}


// App lifecycle
app.whenReady().then(() => {
    startBackend();
    setTimeout(() => {
        createWindow();
    }, 3000);
});

app.on('window-all-closed', () => {
    stopBackend();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    stopBackend();
});
