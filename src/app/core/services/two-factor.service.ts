import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TwoFactorStatus {
  is_confirmed: boolean;
  secret?: string;
  otpauth_url?: string;
}

@Injectable({ providedIn: 'root' })
export class TwoFactorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.ApiUrl}/2fa`;
  private readonly STORAGE_KEY = 'saec_2fa_verified';

  isVerifiedLocally(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  markAsVerified(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  clearVerification(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getStatus(): Observable<TwoFactorStatus> {
    return this.http.get<TwoFactorStatus>(`${this.apiUrl}/status`);
  }

  verifyCode(code: string): Observable<{ verified: boolean; message: string }> {
    return this.http.post<{ verified: boolean; message: string }>(`${this.apiUrl}/verify`, { code }).pipe(
      tap((res) => {
        if (res.verified) {
          this.markAsVerified();
        }
      })
    );
  }
}