import { copyFileSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const indexPath = join(root, 'dist/index.html')
const shellPath = join(root, 'dist/spa-shell.html')
const ssrOut = join(root, 'dist/.ssr')
const rootPlaceholder = /<div id="root">\s*<\/div>/

const built = readFileSync(indexPath, 'utf8')
if (!rootPlaceholder.test(built)) {
  throw new Error('dist/index.html is missing an empty <div id="root"></div>')
}
copyFileSync(indexPath, shellPath)

await build({
  root,
  build: {
    ssr: join(root, 'src/entry-server.tsx'),
    outDir: ssrOut,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'entry-server.js',
      },
    },
  },
  logLevel: 'warn',
})

const { render } = await import(pathToFileURL(join(ssrOut, 'entry-server.js')).href)
const html = render('/')
if (typeof html !== 'string' || !html.includes('<h1')) {
  throw new Error('Homepage prerender did not include an h1')
}

const next = built.replace(rootPlaceholder, () => `<div id="root">${html}</div>`)
writeFileSync(indexPath, next)
rmSync(ssrOut, { recursive: true, force: true })
