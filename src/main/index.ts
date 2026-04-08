import { app, BrowserWindow, shell, Menu, globalShortcut, ipcMain, screen, protocol, net } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc'
import { getMenuLabels } from './menu-labels'
import { getSettings } from './services/settings-store'
import * as imageStore from './services/image-store'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'promptlib-image',
    privileges: { standard: true, secure: true, supportFetchAPI: true }
  }
])

const isDev = !app.isPackaged
const isMac = process.platform === 'darwin'

let mainWindow: BrowserWindow | null = null
let paletteWindow: BrowserWindow | null = null

function buildMenu(): void {
  const settings = getSettings()
  const labels = getMenuLabels(settings.language)

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
      label: labels.file,
      submenu: [
        {
          label: labels.newPrompt,
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-prompt')
          }
        },
        {
          label: labels.importMarkdown,
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
      label: labels.edit,
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
      label: labels.view,
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
      label: labels.window,
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac ? [{ type: 'separator' as const }, { role: 'front' as const }] : [])
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}

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
  const { x, y, width, height } = display.workArea

  paletteWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
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
      paletteWindow!.focus()
      paletteWindow!.webContents.focus()
    })
  } else {
    // Re-position to current cursor display
    const display = getCursorDisplay()
    const { x: dx, y: dy, width: dw, height: dh } = display.workArea
    paletteWindow.setBounds({ x: dx, y: dy, width: dw, height: dh })
    paletteWindow.show()
    paletteWindow.focus()
    paletteWindow.webContents.focus()
  }
}

function hidePalette(): void {
  if (paletteWindow && paletteWindow.isVisible()) {
    paletteWindow.hide()
  }
}

app.whenReady().then(() => {
  buildMenu()
  registerIpcHandlers()

  protocol.handle('promptlib-image', (request) => {
    const filename = request.url.replace('promptlib-image://', '')
    const filePath = imageStore.getImagePath(filename)
    return net.fetch(`file://${filePath}`)
  })

  ipcMain.handle('hide-palette', () => {
    hidePalette()
  })

  ipcMain.handle('resize-palette', () => {
    // No-op: palette window is now full-screen with CSS-based layout
  })

  ipcMain.handle('rebuild-menu', () => {
    buildMenu()
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
