import Database from 'better-sqlite3'
import { emptyWorkspace, validateWorkspace } from '../shared/domain'
import type { Workspace } from '../shared/types'

export class Store {
  readonly db: Database.Database
  constructor(path: string) {
    this.db = new Database(path)
    this.db.pragma('journal_mode = WAL')
    const version = this.db.pragma('user_version', { simple: true }) as number
    if (version > 1) throw new Error('此数据库由较新版本创建，请升级应用')
    this.db.exec('CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, json TEXT NOT NULL); PRAGMA user_version=1;')
    if (!this.db.prepare('SELECT 1 FROM workspace WHERE id=1').get()) this.db.prepare('INSERT INTO workspace VALUES (1, ?)').run(JSON.stringify(emptyWorkspace()))
  }
  load(): Workspace { return validateWorkspace(JSON.parse((this.db.prepare('SELECT json FROM workspace WHERE id=1').get() as { json: string }).json)) }
  save(input: unknown, force = false): Workspace {
    const next = validateWorkspace(input)
    return this.db.transaction(() => {
      const previous = this.load()
      if (!force && previous.revision !== next.revision) throw new Error('数据已在后台更新。请保留编辑内容，关闭编辑面板后重试。')
      next.revision = previous.revision + 1
      this.db.prepare('UPDATE workspace SET json=? WHERE id=1').run(JSON.stringify(next))
      return next
    })()
  }
  get<T>(key: string, fallback: T): T {
    const row = this.db.prepare('SELECT json FROM cache WHERE key=?').get(key) as { json: string } | undefined
    return row ? JSON.parse(row.json) : fallback
  }
  set(key: string, value: unknown): void { this.db.prepare('INSERT INTO cache (key,json) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET json=excluded.json').run(key, JSON.stringify(value)) }
  clearPrefix(prefix: string): void { this.db.prepare('DELETE FROM cache WHERE substr(key,1,?)=?').run(prefix.length, prefix) }
  close(): void { this.db.close() }
}
