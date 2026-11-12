import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device } from '../interfaces/device.interface';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  // Asegúrate de que environment.ApiUrl sea 'http://206.81.6.211:80/api'
  private apiUrl = `${environment.ApiUrl}/devices`;
  private http = inject(HttpClient);

  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(this.apiUrl);
  }

  getDeviceById(id: string): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/${id}`);
  }
  
  deleteDevice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}