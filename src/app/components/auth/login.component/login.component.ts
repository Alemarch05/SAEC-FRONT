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
      // Quitamos el "api://" y dejamos solo el ID seguido de /.default
      scopes: ['openid', 'profile', '6f4a5212-2919-4a5b-b1a3-b7d97d648a81/.default']
    }).subscribe({
      next: (response) => {
        // Entra ID devolvió el Token exitosamente
        this.router.navigate(['/dashboard']);
      },
      error: (error) => console.error('Error de autenticación', error)
    });
  }
}
