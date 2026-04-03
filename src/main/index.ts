import { app, BrowserWindow, shell, Menu, globalShortcut, ipcMain, screen } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc'

const isDev = !app.isPackaged
const isMac = process.platform === 'darwin'

let mainWindow: BrowserWindow | null = null
let paletteWindow: BrowserWindow | null = null

const menuTemplate: Electron.MenuItemConstructorOptions[] = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' as const },
            { type: 'separator' as const },
            { role: 'hide' as const },
            { role: 'hideOthers' as const },
            { role: 'unhide' as const },
            { type: 'separator' as const },
            { role: 'quit' as const }
          ]
        }
      ]
    : []),
  {
    label: 'Fichier',
    submenu: [
      {
        label: 'Nouveau prompt',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWindow?.webContents.send('menu-new-prompt')
        }
      },
      {
        label: 'Importer Markdown...',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => {
          mainWindow?.webContents.send('menu-import-markdown')
        }
      },
      { type: 'separator' as const },
      isMac ? { role: 'close' as const } : { role: 'quit' as const }
    ]
  },
  {
    label: 'Edition',
    submenu: [
      { role: 'undo' as const },
      { role: 'redo' as const },
      { type: 'separator' as const },
      { role: 'cut' as const },
      { role: 'copy' as const },
      { role: 'paste' as const },
      { role: 'selectAll' as const }
    ]
  },
  {
    label: 'Affichage',
    submenu: [
      { role: 'reload' as const },
      { role: 'forceReload' as const },
      { role: 'toggleDevTools' as const },
      { type: 'separator' as const },
      { role: 'resetZoom' as const },
      { role: 'zoomIn' as const },
      { role: 'zoomOut' as const },
      { type: 'separator' as const },
      { role: 'togglefullscreen' as const }
    ]
  },
  {
    label: 'Fenêtre',
    submenu: [
      { role: 'minimize' as const },
      { role: 'zoom' as const },
      ...(isMac ? [{ type: 'separator' as const }, { role: 'front' as const }] : [])
    ]
  }
]

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function getCursorDisplay(): Electron.Display {
  const cursorPoint = screen.getCursorScreenPoint()
  return screen.getDisplayNearestPoint(cursorPoint)
}

function createPaletteWindow(): void {
  const display = getCursorDisplay()
  const { x: dx, y: dy, width: dw } = display.workArea
  const paletteWidth = 696  // 680 content + 16 padding
  const initialHeight = 72  // ~56 content + 16 padding
  const x = Math.round(dx + (dw - paletteWidth) / 2)
  const y = dy + 180

  paletteWindow = new BrowserWindow({
    width: paletteWidth,
    height: initialHeight,
    maxHeight: 460,
    x,
    y,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  paletteWindow.on('closed', () => {
    paletteWindow = null
  })

  paletteWindow.on('blur', () => {
    hidePalette()
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    paletteWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/palette.html')
  } else {
    paletteWindow.loadFile(join(__dirname, '../renderer/palette.html'))
  }
}

function togglePalette(): void {
  if (paletteWindow && paletteWindow.isVisible()) {
    hidePalette()
    return
  }

  if (!paletteWindow) {
    createPaletteWindow()
    paletteWindow!.once('ready-to-show', () => {
      paletteWindow!.show()
    })
  } else {
    // Re-center on current cursor screen
    const display = getCursorDisplay()
    const { x: dx, y: dy, width: dw } = display.workArea
    const x = Math.round(dx + (dw - 696) / 2)
    paletteWindow.setPosition(x, dy + 180)
    paletteWindow.show()
  }
}

function hidePalette(): void {
  if (paletteWindow && paletteWindow.isVisible()) {
    paletteWindow.hide()
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  registerIpcHandlers()

  ipcMain.handle('hide-palette', () => {
    hidePalette()
  })

  ipcMain.handle('resize-palette', (_, height: number) => {
    if (paletteWindow) {
      const withPadding = height + 16 // 8px padding top + bottom
      const clamped = Math.min(Math.max(withPadding, 72), 480)
      paletteWindow.setSize(696, clamped)
    }
  })

  createWindow()

  globalShortcut.register('CommandOrControl+Alt+P', () => {
    togglePalette()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
