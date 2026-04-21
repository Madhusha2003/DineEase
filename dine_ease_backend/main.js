import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess;

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "DineEase Server Dashboard",
  });

  const ip = getLocalIp();

  mainWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
      <body style="font-family:sans-serif;text-align:center;padding:40px">
        <h2>Server Running</h2>
        <p>http://${ip}:3001</p>
        <button onclick="require('electron').shell.openExternal('http://localhost:3001')">
          Open
        </button>
      </body>
      </html>
    `)}`
  );
}

app.whenReady().then(() => {
  const resourcesPath = app.isPackaged ? process.resourcesPath : __dirname;
  const userDataPath = app.getPath('userData');

  const backendPath = app.isPackaged
    ? path.join(resourcesPath, 'backend/src/server.js')
    : path.join(__dirname, 'src/server.js');

  // Determine paths based on environment
  let dbPath;
  let uploadsPath;

  if (app.isPackaged) {
    // In production, save to AppData (e.g., %AppData%/DineEase/...)
    dbPath = path.join(userDataPath, 'dineease.db');
    uploadsPath = path.join(userDataPath, 'uploads');

    // Create uploads folder if missing
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    // Copy template database if it doesn't exist in AppData yet
    if (!fs.existsSync(dbPath)) {
      const templateDbPath = path.join(resourcesPath, 'backend/dineease.db');
      if (fs.existsSync(templateDbPath)) {
        fs.copyFileSync(templateDbPath, dbPath);
      }
    }
  } else {
    // In development, keep it local to the folder
    dbPath = path.join(__dirname, 'dineease.db');
    uploadsPath = path.join(__dirname, 'uploads');
  }

  console.log("Backend:", backendPath);
  console.log("DB Path:", dbPath);
  console.log("Uploads Path:", uploadsPath);

  // 🔥 STABLE METHOD
  serverProcess = fork(backendPath, {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      RESOURCES_PATH: resourcesPath,
      DATABASE_URL: `file:${dbPath}`,
      UPLOADS_PATH: uploadsPath
    },
    stdio: ['inherit', 'pipe', 'pipe', 'ipc']
  });

  serverProcess.stdout.on('data', (data) => console.log(`[Server]: ${data}`));
  serverProcess.stderr.on('data', (data) => console.error(`[Server Error]: ${data}`));

  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});