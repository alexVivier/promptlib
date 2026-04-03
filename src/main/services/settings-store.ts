import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs'
import type { AppSettings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'

const SETTINGS_PATH = join(app.getPath('userData'), 'settings.json')

export function getSettings(): AppSettings {
  if (!existsSync(SETTINGS_PATH)) {
    return { ...DEFAULT_SETTINGS }
  }
  const raw = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'))
  return { ...DEFAULT_SETTINGS, ...raw }
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const updated = { ...current, ...partial }
  const tmp = SETTINGS_PATH + '.tmp'
  writeFileSync(tmp, JSON.stringify(updated, null, 2), 'utf-8')
  renameSync(tmp, SETTINGS_PATH)
  return updated
}
