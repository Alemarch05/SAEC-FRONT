import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule, // Necesario para routerLink y routerLinkActive
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  private msalService = inject(MsalService);

  // Usamos Signals de Angular 19 para la reactividad de la UI
  userName = signal<string>('Usuario SAEC');
  userInitials = signal<string>('US');

  ngOnInit() {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (activeAccount && activeAccount.name) {
      this.userName.set(activeAccount.name);
      
      // Calcula las iniciales (Ej: "Alejandro Martinez" -> "AM")
      const names = activeAccount.name.split(' ');
      const initials = names.length > 1 
        ? names[0][0] + names[1][0] 
        : names[0][0] + names[0][1];
      this.userInitials.set(initials.toUpperCase());
    }
  }

  logout() {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:4200'
    });
  }
}