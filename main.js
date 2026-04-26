const { app, BrowserWindow } = require('electron')
const { exec, spawn } = require('child_process')
const path = require('path')

let mainWindow
let splashWindow

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })
  splashWindow.loadFile(path.join(__dirname, 'splash.html'))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Deep.AI Coder — by Deep Tiwari',
    show: false
  })

  mainWindow.webContents.openDevTools()

  const startUrl = app.isPackaged
    ? `file://${path.join(app.getAppPath(), 'build/index.html')}`
    : 'http://localhost:5173'

  mainWindow.loadURL(startUrl)

  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadURL(`file://${path.join(app.getAppPath(), 'build/index.html')}`)
  })

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) splashWindow.close()
    mainWindow.show()
  })
}

function checkOllama() {
  return new Promise((resolve) => {
    exec('ollama list', (error) => resolve(!error))
  })
}

function checkModel() {
  return new Promise((resolve) => {
    exec('ollama list', (error, stdout) => {
      resolve(stdout && stdout.includes('deep-ai'))
    })
  })
}

function installOllama() {
  return new Promise((resolve) => {
    exec('curl -fsSL https://ollama.com/install.sh | sh', (error) => resolve(!error))
  })
}

function downloadModel() {
  return new Promise((resolve) => {
    exec('ollama pull hf.co/Deepaicoder/Deep.ai_coder',
      { timeout: 600000 },
      (error) => resolve(!error))
  })
}

function startOllama() {
  const ollama = spawn('ollama', ['serve'], { detached: true, stdio: 'ignore' })
  ollama.unref()
}

app.whenReady().then(async () => {
  createSplash()
  const ollamaInstalled = await checkOllama()
  if (!ollamaInstalled) await installOllama()
  const modelExists = await checkModel()
  if (!modelExists) await downloadModel()
  startOllama()
  await new Promise(resolve => setTimeout(resolve, 3000))
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
