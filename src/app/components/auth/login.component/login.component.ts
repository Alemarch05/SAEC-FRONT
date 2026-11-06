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
  // Cambiamos a Redirect en lugar de Popup
  this.msalService.loginRedirect({
    scopes: ['openid', 'profile', '6f4a5212-2919-4a5b-b1a3-b7d97d648a81/.default']
  });
  // Nota: Ya no te suscribes con .subscribe() aquí. La página entera cambiará a Microsoft.
}
}
