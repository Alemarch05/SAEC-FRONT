export interface HardwareSnapshot {
  id: string;
  device_id: string;
  processor_summary: string;
  total_ram_gb: number;
  storage_summary: string;
  gpu_summary: string;
  payload_hash?: string;
  created_at?: string;
}

export interface Device {
  id: string;
  mac_address: string;
  hostname: string;
  serial_number: string | null;
  os_name: string;
  os_version: string;
  agent_version: string;
  status: string;
  last_seen_at?: string;
  created_at?: string;
  updated_at?: string;
  latest_snapshot?: HardwareSnapshot;
}

export interface DevicePagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DeviceListResponse {
  success: boolean;
  data: Device[];
  meta: DevicePagination;
}

export interface DeviceResponse {
  success: boolean;
  data: Device;
}