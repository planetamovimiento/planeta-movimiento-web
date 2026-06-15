export type Monitor = {
  id: string
  email: string
  nombre: string
  apellidos: string
  foto_url: string
  telefono: string
  fecha_alta: string | null
  especialidades: string[]
  estado: string
  observaciones: string
}

export type Actividad = {
  id: string
  monitor_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  actividad: string
  lugar: string
  grupo: string
  observaciones: string
}

export type Fichaje = {
  id: string
  monitor_id: string
  fecha: string
  entrada: string
  salida: string | null
  actividad: string
  observaciones: string
}

export type Carpeta = {
  id: string
  nombre: string
  orden: number
  numDocs: number
}

export type Documento = {
  id: string
  carpeta_id: string
  nombre: string
  tipo: string
  url: string
  tamano: number
  subido_por: string
  created_at: string
}
