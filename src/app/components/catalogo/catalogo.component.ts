import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DeviceService } from '../../core/services/device.service';
import { Device, HardwareSnapshot } from '../../core/interfaces/device.interface';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
})
export class CatalogoComponent implements OnInit {
  private deviceService = inject(DeviceService);
  private router = inject(Router);

  devices = signal<Device[]>([]);
  selectedDevice = signal<Device | null>(null);
  selectedSnapshot = signal<HardwareSnapshot | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  displayedColumns: string[] = ['hostname', 'mac_address', 'os_name', 'status'];

  ngOnInit() {
    this.deviceService.getDevices().subscribe({
      next: (response) => {
        if (response.success) {
          this.devices.set(response.data);
        } else {
          this.errorMessage.set('El servidor no pudo cargar el catálogo de equipos.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('No fue posible conectar con el servidor.');
        console.error('Error cargando equipos', err);
      },
    });
  }

  selectDevice(device: Device) {
    this.selectedDevice.set(device);
    this.selectedSnapshot.set(null);

    this.deviceService.getSnapshotsByDeviceId(device.id).subscribe({
      next: (res) => {
        const snap = this.deviceService.extraerSnapshot(res);
        this.selectedSnapshot.set(snap);
      },
      error: (err) => console.error('Error trayendo snapshot del equipo', err),
    });
  }

  private extraerSnapshot(device: any): HardwareSnapshot | null {
    return (
      device?.latest_snapshot ||
      device?.latestSnapshot ||
      device?.snapshot ||
      device?.specs ||
      (Array.isArray(device?.hardware_snapshots) ? device.hardware_snapshots[0] : null)
    );
  }

  abrirDetalle(id: string) {
    this.router.navigate(['/catalogo', id]);
  }
}