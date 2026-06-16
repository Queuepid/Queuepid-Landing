import { readFileSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

// Serves the existing static landing page at / without modifying public/index.html
export async function GET() {
  const html = readFileSync(path.join(process.cwd(), 'public/index.html'), 'utf-8')
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
