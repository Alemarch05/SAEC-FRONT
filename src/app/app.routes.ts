import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { Catalogo} from './components/catalogo/catalogo';
import { Dashboard } from './components/dashboard/dashboard';
import { Configuracion } from './components/configuracion/configuracion';
export const routes: Routes = [
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Redirección por defecto si entran a la raíz '/' hacia '/enlace1'
      { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
      
      // Aquí declaras la ruta para Enlace1Component
      { path: 'catalogo', component: Catalogo },
      { path: 'dashboard', component: Dashboard },
      { path: 'configuracion', component: Configuracion },
      

    ]
  },

];
