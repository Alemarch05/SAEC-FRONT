import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DeviceService } from '../../core/services/device.service';
import { Device, HardwareSnapshot } from '../../core/interfaces/device.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-equipo',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './detalle-equipo.component.html',
  styleUrls: ['./detalle-equipo.component.scss'],
})
export class DetalleEquipoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deviceService = inject(DeviceService);

  device = signal<Device | null>(null);
  loading = signal(true);
  errorMessage = signal('');
  componentesFormateados = signal<{ name: string; status: boolean }[]>([]);
  displayedColumns: string[] = ['component', 'status'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.errorMessage.set('No se recibió el ID del equipo en la ruta.');
      return;
    }

    this.deviceService.getDeviceFullDetails(id).subscribe({
      next: ({ device, snapshot }) => {
        if (device) {
          this.device.set(device);
          this.formatearComponentes(device, snapshot);
        } else {
          this.errorMessage.set('No se encontró el equipo solicitado.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('Error al consultar las especificaciones en el servidor.');
        console.error('Error cargando detalle', err);
      },
    });
  }

  private formatearComponentes(device: Device, snap: HardwareSnapshot | null) {
    this.componentesFormateados.set([
      { name: `Sistema Operativo: ${device.os_name} (${device.os_version || 'N/A'})`, status: !!device.os_name },
      { name: `Dirección MAC: ${device.mac_address}`, status: !!device.mac_address },
      { name: `Número de Serie: ${device.serial_number || 'Sin registrar'}`, status: !!device.serial_number },
      { name: `Procesador: ${snap?.processor_summary || 'Sin datos de escaneo'}`, status: !!snap?.processor_summary },
      { name: `Memoria RAM: ${snap?.total_ram_gb ? snap.total_ram_gb + ' GB' : 'Sin datos de escaneo'}`, status: !!snap?.total_ram_gb },
      { name: `Almacenamiento: ${snap?.storage_summary || 'Sin datos de escaneo'}`, status: !!snap?.storage_summary },
      { name: `Gráficos (GPU): ${snap?.gpu_summary || 'Sin datos de escaneo'}`, status: !!snap?.gpu_summary },
    ]);
  }

  volverCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  irHistorial() {
    this.router.navigate(['/historial', this.device()?.id]);
  }

  generarHojaVida() {
    this.router.navigate(['/hoja-vida', this.device()?.id]);
  }

  eliminarEquipo() {
    const current = this.device();
    if (!current) return;

    Swal.fire({
      title: '¿Eliminar equipo de SAEC?',
      text: `Se eliminará permanentemente "${current.hostname}" (${current.serial_number || 'Sin S/N'}) y su historial de hardware.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#1E3A5F',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deviceService.deleteDevice(current.id).subscribe({
          next: (res) => {
            Swal.fire({
              title: 'Equipo eliminado',
              text: res?.message || 'El equipo ha sido removido del inventario.',
              icon: 'success',
              timer: 1800,
              showConfirmButton: false,
            }).then(() => {
              this.router.navigate(['/catalogo']);
            });
          },
          error: (err) => {
            console.error('Error eliminando equipo', err);
            Swal.fire({
              title: 'No se pudo eliminar',
              text: err.error?.message || 'Ocurrió un error al intentar eliminar el equipo en el servidor.',
              icon: 'error',
              confirmButtonColor: '#1E3A5F',
            });
          },
        });
      }
    });
  }
}