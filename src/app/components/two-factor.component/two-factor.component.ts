import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import Swal from 'sweetalert2';
import { MaterialModule } from '../../shared/material.module';
import { TwoFactorService } from '../../core/services/two-factor.service';

@Component({
  selector: 'app-verificar-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
    <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#F4F7FA;">
      <mat-card style="max-width:420px; width:100%; padding:24px; text-align:center;">
        <h2 style="color:#1E3A5F; margin-bottom:8px;">Verificación en Dos Pasos</h2>

        @if (loading()) {
          <mat-spinner diameter="40" style="margin:24px auto;"></mat-spinner>
        } @else {
          @if (!isConfirmed() && qrDataUrl()) {
            <p style="font-size:14px; color:#475569;">
              Escanea este código QR con <strong>Microsoft Authenticator</strong> para vincular tu cuenta de SAEC:
            </p>
            <img [src]="qrDataUrl()" alt="QR 2FA" style="width:200px; height:200px; margin:12px auto;" />
            <p style="font-size:12px; color:#64748B;">Clave manual: <code>{{ secretKey() }}</code></p>
          } @else {
            <p style="font-size:14px; color:#475569;">
              Ingresa el código de 6 dígitos generado por <strong>Microsoft Authenticator</strong>.
            </p>
          }

          <mat-form-field appearance="outline" style="width:100%; margin-top:16px;">
            <mat-label>Código de 6 dígitos</mat-label>
            <input matInput [(ngModel)]="code" maxlength="6" placeholder="000000" (keyup.enter)="validar()" />
          </mat-form-field>

          <button mat-flat-button color="primary" style="width:100%; background:#1E3A5F;"
                  [disabled]="code.length !== 6 || validating()" (click)="validar()">
            {{ validating() ? 'Verificando...' : 'Verificar e Ingresar' }}
          </button>
        }
      </mat-card>
    </div>
  `
})
export class Verificar2faComponent implements OnInit {
  private twoFactorService = inject(TwoFactorService);
  private router = inject(Router);

  loading = signal(true);
  validating = signal(false);
  isConfirmed = signal(false);
  qrDataUrl = signal('');
  secretKey = signal('');
  code = '';

  ngOnInit(): void {
    if (this.twoFactorService.isVerifiedLocally()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.twoFactorService.getStatus().subscribe({
      next: async (res) => {
        this.isConfirmed.set(res.is_confirmed);
        if (!res.is_confirmed && res.otpauth_url) {
          this.secretKey.set(res.secret || '');
          const dataUrl = await QRCode.toDataURL(res.otpauth_url);
          this.qrDataUrl.set(dataUrl);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        Swal.fire('Error', 'No se pudo consultar el estado 2FA.', 'error');
      }
    });
  }

  validar(): void {
    if (this.code.length !== 6) return;
    this.validating.set(true);

    this.twoFactorService.verifyCode(this.code).subscribe({
      next: () => {
        this.validating.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.validating.set(false);
        this.code = '';
        Swal.fire('Código inválido', err.error?.message || 'Verifica los 6 dígitos e intenta de nuevo.', 'error');
      }
    });
  }
}