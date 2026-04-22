import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import os from 'os';
import fs from 'fs';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess;

// 🔥 Get local IPv4
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

// 🧠 Create Electron Window
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 650,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "DineEase Server Dashboard",
  });

  const ip = getLocalIp();
  const url = `http://${ip}:3001`;

  // 🔥 Generate QR Code
  const qrDataUrl = await QRCode.toDataURL(url);

  mainWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
        <head>
          <title>DineEase Server</title>
        </head>
        <body style="font-family: Arial; text-align: center; padding: 40px; background: #f4f4f4">

          <h2>🍽️ DineEase Server Running</h2>

          <p style="font-size:18px"><b>${url}</b></p>

          <img src="${qrDataUrl}" style="width:220px;height:220px;margin:20px;border-radius:12px"/>

          <br/>

          <button 
            style="padding:10px 20px;font-size:16px;cursor:pointer"
            onclick="require('electron').shell.openExternal('${url}')"
          >
            Open Server
          </button>

          <p style="margin-top:20px;color:gray">
            Scan QR to connect from mobile 📱
          </p>

        </body>
      </html>
    `)}`
  );
}

// 🚀 App start
app.whenReady().then(() => {
  const resourcesPath = app.isPackaged ? process.resourcesPath : __dirname;
  const userDataPath = app.getPath('userData');

  const backendPath = app.isPackaged
    ? path.join(resourcesPath, 'app/src/server.js')
    : path.join(__dirname, 'src/server.js');

  let dbPath;
  let uploadsPath;

  if (app.isPackaged) {
    dbPath = path.join(userDataPath, 'dineease.db');
    uploadsPath = path.join(userDataPath, 'uploads');

    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    if (!fs.existsSync(dbPath)) {
      const templateDbPath = path.join(resourcesPath, 'app/dineease.db');
      if (fs.existsSync(templateDbPath)) {
        fs.copyFileSync(templateDbPath, dbPath);
      }
    }
  } else {
    dbPath = path.join(__dirname, 'dineease.db');
    uploadsPath = path.join(__dirname, 'uploads');
  }

  console.log("Backend:", backendPath);
  console.log("DB Path:", dbPath);
  console.log("Uploads Path:", uploadsPath);

  // 🔥 Start backend
  serverProcess = fork(backendPath, {
    cwd: app.isPackaged
      ? path.join(resourcesPath, 'app')
      : __dirname,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      RESOURCES_PATH: resourcesPath,
      DATABASE_URL: `file:${dbPath}`,
      UPLOADS_PATH: uploadsPath,
    },
    stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Server]: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error]: ${data}`);
  });

  // 🧠 Create UI
  createWindow();
});

// 🛑 Cleanup
app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});