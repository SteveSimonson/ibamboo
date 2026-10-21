import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function previewSpaShell(): Plugin {
  return {
    name: 'preview-spa-shell',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url ?? '/'
        const q = raw.indexOf('?')
        const path = q === -1 ? raw : raw.slice(0, q)
        const search = q === -1 ? '' : raw.slice(q)
        const last = path.split('/').pop() ?? ''
        if (path !== '/' && path !== '/index.html' && !last.includes('.')) {
          req.url = `/spa-shell.html${search}`
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), previewSpaShell()],
})
