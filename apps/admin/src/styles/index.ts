import { join } from 'node:path'

const cssPath = join(import.meta.dir, 'output.css')
export const css = await Bun.file(cssPath).text()
