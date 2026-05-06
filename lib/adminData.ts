import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

export function readJson<T>(filename: string, fallback: T): T {
  try {
    const text = fs.readFileSync(path.join(dataDir, filename), 'utf8')
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

export function writeJson(filename: string, data: unknown): void {
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2) + '\n', 'utf8')
}
