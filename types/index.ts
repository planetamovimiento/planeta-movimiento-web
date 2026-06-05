export type Servicio = {
  id: string; nombre: string; slug: string;
  descripcion: string; precio_base: number;
  duracion_min: number; activo: boolean; orden: number;
}
export type Paquete = {
  id: string; servicio_id: string; nombre: string;
  precio: number; max_participantes: number;
  duracion_min: number; incluye: string[];
  destacado: boolean; activo: boolean;
}
export type Cliente = {
  id: string; auth_id?: string; nombre: string;
  apellidos: string; email: string; telefono: string;
}
export type Reserva = {
  id: string; numero: string; paquete_id: string;
  cliente_id: string; fecha: string; hora_inicio: string;
  participantes: number; participantes_ad: number;
  estado: 'pendiente'|'confirmada'|'pagada'|'cancelada'|'completada';
  total: number; nombre_cumpleanero?: string;
  edad_cumpleanero?: number; notas_cliente?: string;
  created_at: string;
}
