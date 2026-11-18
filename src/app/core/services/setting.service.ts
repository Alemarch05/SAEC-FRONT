import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Setting, DashboardMetrics, TemplateKey, DocumentTemplateData } from '../interfaces/setting.interface';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';


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

  generarDocumentoDiligenciado(key: TemplateKey, data: DocumentTemplateData): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${key}/file`, { responseType: 'arraybuffer' }).pipe(
      map((arrayBuffer: ArrayBuffer) => {
        const zip = new PizZip(arrayBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          delimiters: { start: '${', end: '}' }
        });

        doc.render(data);

        return doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
      })
    );
  }


}