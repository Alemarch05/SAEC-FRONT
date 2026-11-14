import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { CatalogoComponent} from './components/catalogo/catalogo.component';
import { DetalleEquipoComponent } from './components/detalle-equipo/detalle-equipo.component';
import { Dashboard } from './components/dashboard/dashboard';
import { Configuracion } from './components/configuracion/configuracion';
import { HistorialAlertas } from './components/historial-alertas/historial-alertas';
export const routes: Routes = [
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Redirección por defecto si entran a la raíz '/' hacia '/enlace1'
      { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
      
      // Aquí declaras la ruta para Enlace1Component
      { path: 'catalogo', component: CatalogoComponent },
      { path: 'catalogo/:id', component: DetalleEquipoComponent },
      { path: 'dashboard', component: Dashboard },
      { path: 'configuracion', component: Configuracion },
      { path: 'historial', component: HistorialAlertas },
      { path: 'historial/:id', component: HistorialAlertas },
      

    ]
  },

];
