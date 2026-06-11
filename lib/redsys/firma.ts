// ─────────────────────────────────────────────────────────────────────────────
// Firma y verificación Redsys (HMAC_SHA256_V1). SOLO servidor (usa `crypto`).
// Algoritmo oficial:
//   1) clave-por-pedido = 3DES(clave_comercio, Ds_Order)   [des-ede3-cbc, IV cero]
//   2) firma = HMAC-SHA256(Ds_MerchantParameters, clave-por-pedido) en base64
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto'
import { getRedsysConfig, type RedsysConfig } from './config'

type PeticionInput = {
  order: string
  amountCents: number
  description: string
  urlOk: string
  urlKo: string
  urlNotificacion: string
}

export type CamposRedsys = {
  url: string
  Ds_SignatureVersion: 'HMAC_SHA256_V1'
  Ds_MerchantParameters: string
  Ds_Signature: string
}

/** 3DES-encripta el número de pedido con la clave del comercio → clave del pedido. */
function claveDePedido(order: string, secretBase64: string): Buffer {
  const key = Buffer.from(secretBase64, 'base64') // 24 bytes
  const iv = Buffer.alloc(8, 0)
  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv)
  cipher.setAutoPadding(false)
  // El order se rellena con bytes 0 hasta múltiplo de 8 (ZeroPadding).
  const buf = Buffer.from(order, 'utf8')
  const falta = buf.length % 8 === 0 ? 0 : 8 - (buf.length % 8)
  const padded = Buffer.concat([buf, Buffer.alloc(falta, 0)])
  return Buffer.concat([cipher.update(padded), cipher.final()])
}

function hmac256(data: string, key: Buffer): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest()
}

const toBase64Url = (b: Buffer) => b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
const fromBase64Url = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

/** Construye los campos firmados para enviar (auto-POST) al TPV de Redsys. */
export function crearPeticion(input: PeticionInput, cfg: RedsysConfig): CamposRedsys {
  const params: Record<string, string> = {
    DS_MERCHANT_AMOUNT: String(input.amountCents),
    DS_MERCHANT_ORDER: input.order,
    DS_MERCHANT_MERCHANTCODE: cfg.merchantCode,
    DS_MERCHANT_CURRENCY: cfg.currency,
    DS_MERCHANT_TRANSACTIONTYPE: '0', // autorización
    DS_MERCHANT_TERMINAL: cfg.terminal,
    DS_MERCHANT_MERCHANTURL: input.urlNotificacion,
    DS_MERCHANT_URLOK: input.urlOk,
    DS_MERCHANT_URLKO: input.urlKo,
    DS_MERCHANT_MERCHANTNAME: cfg.merchantName,
    DS_MERCHANT_PRODUCTDESCRIPTION: input.description.slice(0, 125),
  }
  const merchantParameters = Buffer.from(JSON.stringify(params), 'utf8').toString('base64')
  const key = claveDePedido(input.order, cfg.secret)
  const signature = hmac256(merchantParameters, key).toString('base64')

  return {
    url: cfg.endpoint,
    Ds_SignatureVersion: 'HMAC_SHA256_V1',
    Ds_MerchantParameters: merchantParameters,
    Ds_Signature: signature,
  }
}

export type DatosNotificacion = Record<string, string>

/**
 * Verifica la firma de una notificación/retorno de Redsys y devuelve los datos
 * decodificados, o null si la firma no es válida. La firma de respuesta usa
 * base64 URL-safe.
 */
export function verificarNotificacion(
  merchantParameters: string,
  signature: string,
): DatosNotificacion | null {
  const cfg = getRedsysConfig()
  if (!cfg) return null
  try {
    const json = fromBase64Url(merchantParameters).toString('utf8')
    const datos = JSON.parse(json) as DatosNotificacion
    const order = datos.Ds_Order || datos.DS_ORDER || datos.Ds_order
    if (!order) return null

    const key = claveDePedido(order, cfg.secret)
    const esperada = toBase64Url(hmac256(merchantParameters, key))
    const recibida = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const a = Buffer.from(esperada.replace(/=+$/, ''))
    const b = Buffer.from(recibida)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
    return datos
  } catch {
    return null
  }
}

/** True si el código de respuesta de Redsys indica pago autorizado (0000–0099). */
export function pagoAutorizado(dsResponse: string | number | undefined): boolean {
  const n = Number(dsResponse)
  return Number.isFinite(n) && n >= 0 && n <= 99
}
