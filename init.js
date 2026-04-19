const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let pythonProcess = null;
let viteProcess = null;

const FRONTEND_PORT = 5173;

// ======================================================
// Kill process tree safely
// ======================================================
function killProcess(proc, name = "process") {
    if (!proc || proc.killed) return;

    try {
        if (process.platform === "win32") {
            spawn("taskkill", ["/pid", proc.pid, "/f", "/t"]);
        } else {
            process.kill(-proc.pid, "SIGTERM");
        }
        console.log(`Killed ${name} (pid ${proc.pid})`);
    } catch (err) {
        console.warn(`Failed to kill ${name}:`, err.message);
    }
}

// ======================================================
// Wait for Vite to be ready
// ======================================================
function waitForViteReady(url, timeout = 20000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = () => {
            http.get(url, (res) => {
                resolve(true);
            }).on('error', () => {
                if (Date.now() - start > timeout) {
                    reject(new Error("Vite not ready"));
                } else {
                    setTimeout(check, 300);
                }
            });
        };

        check();
    });
}

// ======================================================
// Electron window
// ======================================================
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        }
    });

    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ======================================================
// Start React (Vite)
// ======================================================
function startFrontend() {
    const frontendPath = path.join(__dirname, 'frontend');

    viteProcess = spawn('npm', ['run', 'dev'], {
        cwd: frontendPath,
        shell: true,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    viteProcess.stdout.on('data', (d) => {
        console.log(`[VITE] ${d}`);
    });

    viteProcess.stderr.on('data', (d) => {
        console.error(`[VITE ERROR] ${d}`);
    });

    viteProcess.unref();
}

// ======================================================
// Start Python backend
// ======================================================
function startBackend() {
    const venvPython = path.join(__dirname, '.venv', 'bin', 'python');
    const winVenvPython = path.join(__dirname, '.venv', 'Scripts', 'python.exe');

    let pythonPath;

    if (fs.existsSync(venvPython)) {
        pythonPath = venvPython;
    } else if (fs.existsSync(winVenvPython)) {
        pythonPath = winVenvPython;
    } else {
        console.error("No virtualenv found");
        return;
    }

    pythonProcess = spawn(pythonPath, ['-m', 'backend.server'], {
        cwd: __dirname,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    pythonProcess.stdout.on('data', (d) => {
        console.log(`[PY] ${d}`);
    });

    pythonProcess.stderr.on('data', (d) => {
        console.error(`[PY ERROR] ${d}`);
    });

    pythonProcess.unref();
}

// ======================================================
// Stop all processes
// ======================================================
function stopAll() {
    console.log("Shutting down processes...");

    if (viteProcess) {
        killProcess(viteProcess, "Vite");
        viteProcess = null;
    }

    if (pythonProcess) {
        killProcess(pythonProcess, "Python backend");
        pythonProcess = null;
    }

    if (mainWindow) {
        mainWindow.destroy();
        mainWindow = null;
    }
}

// ======================================================
// App lifecycle
// ======================================================
app.whenReady().then(async () => {
    startBackend();
    startFrontend();

    try {
        await waitForViteReady(`http://localhost:${FRONTEND_PORT}`);
        createWindow();
    } catch (err) {
        console.error("Frontend failed to start:", err);
    }
});

app.on('window-all-closed', () => {
    stopAll();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', stopAll);
app.on('will-quit', stopAll);

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
