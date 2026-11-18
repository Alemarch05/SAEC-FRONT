export interface DeviceInfo {
  id: string;
  hostname: string;
  mac_address?: string;
  serial_number?: string;
  os_name?: string;
  status?: string;
  assigned_to?: string;
}

export interface HardwareDelta {
  id: string;
  device_id: string;
  component_name: string;
  change_type: string;
  previous_value: string | null;
  new_value: string | null;
  detected_at: string;
  device?: DeviceInfo;
}

export interface DeltaResponse {
  success: boolean;
  data: HardwareDelta[];
}

