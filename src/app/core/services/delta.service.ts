import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeltaResponse, HardwareDelta } from '../interfaces/delta.interface';

@Injectable({
  providedIn: 'root'
})
export class DeltaService {

  private apiUrl = `${environment.ApiUrl}/deltas`;
  private devicesUrl = `${environment.ApiUrl}/devices`;

  constructor(private http: HttpClient) { }

  getDeltas(): Observable<DeltaResponse> {
    return this.http.get<DeltaResponse>(this.apiUrl);
  }

  getDeltasByDevice(deviceId: string): Observable<DeltaResponse> {
    return this.http.get<DeltaResponse>(`${this.devicesUrl}/${deviceId}/deltas`);
  }

  getDeltaById(id: string): Observable<{ success: boolean, data: HardwareDelta }> {
    return this.http.get<{ success: boolean, data: HardwareDelta }>(`${this.apiUrl}/${id}`);
  }
}

