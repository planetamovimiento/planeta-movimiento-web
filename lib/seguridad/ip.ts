import { headers } from 'next/headers'

/** IP del cliente a partir de las cabeceras (Vercel/Cloudflare). '' si no se puede. */
export async function getClientIp(): Promise<string> {
  try {
    const h = await headers()
    const xff = h.get('x-forwarded-for')
    if (xff) return xff.split(',')[0].trim()
    return (h.get('x-real-ip') || h.get('cf-connecting-ip') || '').trim()
  } catch {
    return ''
  }
}
