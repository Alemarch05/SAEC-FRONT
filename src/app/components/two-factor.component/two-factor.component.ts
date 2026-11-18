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
  templateUrl: './two-factor.component.html',
  styleUrl : './two-factor.component.scss'
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