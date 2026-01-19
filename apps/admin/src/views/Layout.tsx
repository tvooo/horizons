import type { Child } from 'hono/jsx'
import { css } from '../styles'

interface LayoutProps {
  title: string
  children: Child
}

export function Layout({ title, children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} - Horizons Admin</title>
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body class="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
