export interface Setting {
  id?: number;
  created_at?: string;
  updated_at?: string;
  key: string;
  value: string;

}

export interface DashboardMetrics {
  registro_actual: number;
  meta: number;
  porcentaje: number;
}

export type TemplateKey = 'plantilla_entrega' | 'plantilla_hoja_vida';

export interface DocumentTemplateData {
  usuario: string;
  hostname: string;
  serial_number: string;
  mac_address: string;
  os_name: string;
  procesador: string;
  ram: string;
  almacenamiento: string;
  gpu: string;
  tipo_tramite: 'ENTREGA' | 'DEVOLUCIÓN';
  fecha: string;
  observaciones: string;
}
