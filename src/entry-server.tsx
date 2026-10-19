import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from './App'

export function render(url: string) {
  return renderToString(
    <StrictMode>
      <MemoryRouter initialEntries={[url]}>
        <AppShell />
      </MemoryRouter>
    </StrictMode>,
  )
}
