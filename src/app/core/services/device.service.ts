import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Device,
  DeviceListResponse,
  HardwareSnapshot,
} from '../interfaces/device.interface';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.ApiUrl}/devices`;
  private snapshotsUrl = `${environment.ApiUrl}/snapshots`;

  getDevices(): Observable<DeviceListResponse> {
    return this.http.get<DeviceListResponse>(this.apiUrl);
  }

  getSnapshotsByDeviceId(deviceId: string): Observable<any> {
    return this.http.get<any>(`${this.snapshotsUrl}/${deviceId}`);
  }

  // Obtiene el equipo y su snapshot usando las rutas activas en la VPS
  getDeviceFullDetails(id: string): Observable<{ device: Device | null; snapshot: HardwareSnapshot | null }> {
    return forkJoin({
      devicesRes: this.getDevices(),
      snapshotRes: this.getSnapshotsByDeviceId(id),
    }).pipe(
      map(({ devicesRes, snapshotRes }) => {
        const device = devicesRes.data?.find((d) => d.id === id) ?? null;
        const snapshot = this.extraerSnapshot(snapshotRes);
        return { device, snapshot };
      })
    );
  }

  extraerSnapshot(res: any): HardwareSnapshot | null {
    const payload = res?.data ?? res;
    if (Array.isArray(payload)) {
      return payload.length > 0 ? payload[0] : null;
    }
    if (payload && typeof payload === 'object' && ('processor_summary' in payload || 'total_ram_gb' in payload)) {
      return payload as HardwareSnapshot;
    }
    return null;
  }

  deleteDevice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}