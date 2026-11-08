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
