import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  standalone: true,
  selector: 'app-login.component',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private msalService = inject(MsalService);
  private router = inject(Router);

  iniciarSesion() {
    this.msalService.loginPopup({
      scopes: ['openid', 'profile', 'api://TU_CLIENT_ID/.default']
    }).subscribe({
      next: (response) => {
        // Entra ID devolvió el Token exitosamente
        // MSAL ya lo guardó en el localStorage automáticamente
        this.router.navigate(['/dashboard']);
      },
      error: (error) => console.error('Error de autenticación', error)
    });
  }
}
