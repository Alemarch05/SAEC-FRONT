export interface HardwareSnapshot {
  cpu_model: string;
  ram_memory: string;
  internal_memory: string;
  mac_address: string;
  components?: { name: string; status: boolean }[]; // Para la tabla de detalles
}

export interface Device {
  id: string; // device_id
  name: string; // Nombre del Equipo (ej. WKS-1234)
  ip_address: string;
  status: 'Activo' | 'Inactivo' | 'Alerta';
  location: string;
  last_snapshot?: HardwareSnapshot;
}