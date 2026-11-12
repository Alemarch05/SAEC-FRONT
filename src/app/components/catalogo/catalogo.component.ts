import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DeviceService } from '../../core/services/device.service';
import { Device } from '../../core/interfaces/device.interface';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit {
  private deviceService = inject(DeviceService);
  private router = inject(Router);

  devices: Device[] = [];
  selectedDevice: Device | null = null;
  displayedColumns: string[] = ['name', 'ip_address', 'status', 'location'];

  ngOnInit() {
    this.deviceService.getDevices().subscribe({
      next: (data) => this.devices = data,
      error: (err) => console.error('Error cargando equipos', err)
    });
  }

  selectDevice(device: Device) {
    this.selectedDevice = device;
  }

  abrirDetalle(id: string) {
    this.router.navigate(['/catalogo', id]);
  }
}