import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Setting, DashboardMetrics } from '../interfaces/setting.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  private apiUrl = `${environment.ApiUrl}/settings`;
  private dashboardUrl = `${environment.ApiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getSetting(key: string): Observable<Setting> {
    return this.http.get<Setting>(`${this.apiUrl}/${key}`);
  }

  createSetting(setting: { key: string, value: string }): Observable<{ message: string, data: Setting }> {
    return this.http.post<{ message: string, data: Setting }>(this.apiUrl, setting);
  }

  updateSetting(key: string, value: string): Observable<{ message: string, data: Setting }> {
    return this.http.put<{ message: string, data: Setting }>(`${this.apiUrl}/${key}`, { value });
  }

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(this.dashboardUrl);
  }

  uploadTemplate(key: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('key', key);
    formData.append('file', file); 

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }
}