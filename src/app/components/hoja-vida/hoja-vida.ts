import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { DeviceService } from '../../core/services/device.service';
import { SettingService } from '../../core/services/setting.service';
import { Device, HardwareSnapshot } from '../../core/interfaces/device.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hoja-vida',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MatRadioModule,
    MatSlideToggleModule
  ],
  templateUrl: './hoja-vida.html',
  styleUrl: './hoja-vida.scss'
})
export class HojaVida implements OnInit {

  deviceId: string | null = null;
  device: Device | null = null;
  snapshot: HardwareSnapshot | null = null;
  loading: boolean = true;
  descargando: boolean = false;
  errorMessage: string = '';

  asignadoA: string = '';
  incluirFormatoEntrega: boolean = false;
  tipoEntrega: 'entrega' | 'devolucion' = 'entrega';
  observaciones: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private settingService: SettingService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.deviceId = this.route.snapshot.paramMap.get('id');
    if (!this.deviceId) {
      this.loading = false;
      this.errorMessage = 'No se especificó el identificador del equipo.';
      return;
    }

    this.deviceService.getDeviceFullDetails(this.deviceId).subscribe({
      next: ({ device, snapshot }) => {
        this.device = device;
        this.snapshot = snapshot;
        if (!device) {
          this.errorMessage = 'No se encontró la información del equipo solicitado.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al cargar los datos del equipo', err);
        this.errorMessage = 'No fue posible consultar los datos del equipo en el servidor.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  volverDetalle() {
    if (this.deviceId) {
      this.router.navigate(['/catalogo', this.deviceId]);
    } else {
      this.router.navigate(['/catalogo']);
    }
  }

  descargarFormato() {
    const key = this.incluirFormatoEntrega ? 'plantilla_entrega' : 'plantilla_hoja_vida';
    this.descargando = true;

    this.settingService.getSetting(key).subscribe({
      next: (setting) => {
        this.descargando = false;
        if (!setting?.value) {
          this.snackBar.open('La plantilla no tiene un archivo configurado en el servidor.', 'Cerrar', { duration: 4000 });
          this.cdr.detectChanges();
          return;
        }

        const baseUrl = environment.ApiUrl.replace(/\/api\/?$/, '');
        const fileUrl = setting.value.startsWith('http')
          ? setting.value
          : `${baseUrl}/storage/${setting.value.replace(/^\/+/, '')}`;

        const enlace = document.createElement('a');
        enlace.href = fileUrl;
        enlace.target = '_blank';
        enlace.download = this.obtenerNombreArchivoDescarga(key);
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        this.snackBar.open('Descarga de plantilla iniciada correctamente.', 'Cerrar', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.descargando = false;
        const mensaje = err.status === 404
          ? 'No hay plantilla subida para este formato. Súbela primero en Configuración.'
          : 'Error al consultar la plantilla en el servidor.';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
        this.cdr.detectChanges();
      }
    });
  }

  private obtenerNombreArchivoDescarga(key: string): string {
    const hostname = this.device?.hostname || 'equipo';
    if (key === 'plantilla_entrega') {
      return `formato_${this.tipoEntrega}_${hostname}.docx`;
    }
    return `hoja_vida_${hostname}.docx`;
  }
}
