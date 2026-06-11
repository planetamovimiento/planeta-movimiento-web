// Helper de cliente: envía (auto-POST) los campos firmados al TPV de Redsys.
// Usado por el asistente de reserva y por los widgets de Ocio.

export type CamposPagoRedsys = {
  url: string
  Ds_SignatureVersion: string
  Ds_MerchantParameters: string
  Ds_Signature: string
}

export function redirigirARedsys(c: CamposPagoRedsys) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = c.url
  const add = (name: string, value: string) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  add('Ds_SignatureVersion', c.Ds_SignatureVersion)
  add('Ds_MerchantParameters', c.Ds_MerchantParameters)
  add('Ds_Signature', c.Ds_Signature)
  document.body.appendChild(form)
  form.submit()
}
