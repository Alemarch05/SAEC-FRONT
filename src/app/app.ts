import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('smai-frontend');
  
  private msalService = inject(MsalService);

  ngOnInit() {
    // Inicializa MSAL de forma segura
    this.msalService.instance.initialize().then(() => {
      // Atrapa la respuesta cuando la página recarga tras volver de Microsoft
      this.msalService.instance.handleRedirectPromise().then((response) => {
        if (response !== null && response.account !== null) {
          this.msalService.instance.setActiveAccount(response.account);
          console.log("Login exitoso tras redirección");
        }
      }).catch((error) => console.error("Error procesando redirección", error));
    });
  }
}