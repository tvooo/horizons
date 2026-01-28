import { $ } from 'bun'

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const dbPath = process.env.DATABASE_PATH || './apps/backend/horizons.db'
const backupLocation = process.env.BACKUP_LOCATION || './backups'
const backupPath = `${backupLocation}/horizons-${timestamp}.sqlite`

await $`mkdir -p ${backupLocation}`
await $`cp ${dbPath} ${backupPath}`
console.log(`Backup created: ${backupPath}`)
