import { app } from 'electron'
import { join, extname } from 'path'
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
  existsSync,
  readdirSync,
  copyFileSync,
  statSync
} from 'fs'
import { randomUUID } from 'crypto'

const IMAGES_DIR = join(app.getPath('userData'), 'images')

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'])
const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg'
}

function ensureImagesDir(): void {
  mkdirSync(IMAGES_DIR, { recursive: true })
}

export function saveImageFromBuffer(buffer: Buffer, mimeType: string): string {
  ensureImagesDir()

  if (buffer.length > MAX_SIZE) {
    throw new Error('IMAGE_TOO_LARGE')
  }

  const ext = MIME_TO_EXT[mimeType]
  if (!ext) {
    throw new Error('UNSUPPORTED_FORMAT')
  }

  const filename = `${randomUUID()}${ext}`
  const filePath = join(IMAGES_DIR, filename)
  writeFileSync(filePath, buffer)

  return `promptlib-image://${filename}`
}

export function saveImageFromPath(sourcePath: string): string {
  ensureImagesDir()

  const stat = statSync(sourcePath)
  if (stat.size > MAX_SIZE) {
    throw new Error('IMAGE_TOO_LARGE')
  }

  const ext = extname(sourcePath).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('UNSUPPORTED_FORMAT')
  }

  const filename = `${randomUUID()}${ext}`
  const filePath = join(IMAGES_DIR, filename)
  copyFileSync(sourcePath, filePath)

  return `promptlib-image://${filename}`
}

export function getImagePath(filename: string): string {
  return join(IMAGES_DIR, filename)
}

export function deleteImage(filename: string): void {
  const filePath = join(IMAGES_DIR, filename)
  if (existsSync(filePath)) {
    unlinkSync(filePath)
  }
}

export function cleanupOrphanedImages(allContents: string[]): void {
  ensureImagesDir()

  const allText = allContents.join('\n')
  const files = readdirSync(IMAGES_DIR)

  for (const file of files) {
    if (!allText.includes(`promptlib-image://${file}`)) {
      unlinkSync(join(IMAGES_DIR, file))
    }
  }
}
