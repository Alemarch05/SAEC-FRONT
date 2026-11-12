import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DeviceService } from '../../core/services/device.service';
import { Device } from '../../core/interfaces/device.interface';

@Component({
  selector: 'app-detalle-equipo',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './detalle-equipo.component.html'
})
export class DetalleEquipoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deviceService = inject(DeviceService);

  device: Device | null = null;
  displayedColumns: string[] = ['component', 'status'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.deviceService.getDeviceById(id).subscribe(data => this.device = data);
    }
  }

  irHistorial() {
    this.router.navigate(['/historial', this.device?.id]);
  }

  generarHojaVida() {
    this.router.navigate(['/hoja-vida', this.device?.id]);
  }

  eliminarEquipo() {
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
      this.deviceService.deleteDevice(this.device!.id).subscribe(() => {
        this.router.navigate(['/catalogo']);
      });
    }
  }
}