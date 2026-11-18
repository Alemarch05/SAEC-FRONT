import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DeltaService } from '../../core/services/delta.service';
import { DeviceService } from '../../core/services/device.service';
import { HardwareDelta } from '../../core/interfaces/delta.interface';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-historial-alertas',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './historial-alertas.html',
  styleUrl: './historial-alertas.scss'
})
export class HistorialAlertas implements OnInit {

  historial: HardwareDelta[] = [];
  deltaSeleccionado: HardwareDelta | null = null;
  deviceId: string | null = null;
  nombreEquipo: string = '';

  constructor(
    private deltaService: DeltaService,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.deviceId = this.route.snapshot.paramMap.get('id');
    if (this.deviceId) {
      this.cargarNombreEquipo(this.deviceId);
    }
    this.cargarHistorial();
  }

  cargarNombreEquipo(id: string) {
    this.deviceService.getDevices().subscribe({
      next: (res) => {
        const equipo = res.data?.find((d) => d.id === id);
        if (equipo) {
          this.nombreEquipo = equipo.hostname;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.log('Error al consultar el equipo', err);
      }
    });
  }

  cargarHistorial() {
    const peticion = this.deviceId
      ? this.deltaService.getDeltasByDevice(this.deviceId)
      : this.deltaService.getDeltas();

    peticion.subscribe({
      next: (response) => {
        this.historial = response.data || [];
        if (this.historial.length > 0) {
          this.deltaSeleccionado = this.historial[0];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al cargar el historial de alertas', err);
      }
    });
  }

  seleccionarDelta(delta: HardwareDelta) {
    this.deltaSeleccionado = delta;
  }

  abrirDetalleEquipo(id: string | undefined) {
    const destinoId = id || this.deviceId;
    if (destinoId) {
      this.router.navigate(['/catalogo', destinoId]);
    }
  }

  obtenerNombreComponente(codigo: string): string {
    const nombres: { [key: string]: string } = {
      'RAM': 'Memoria RAM',
      'RAM_MODULE': 'Memoria RAM',
      'STORAGE': 'Disco Duro',
      'STORAGE_DISK': 'Disco Duro',
      'PROCESSOR': 'Procesador',
      'GPU': 'Tarjeta Gráfica',
      'GPU_DEVICE': 'Tarjeta Gráfica',
      'NETWORK': 'Tarjeta de Red'
    };
    return nombres[codigo] || codigo;
  }

  obtenerTipoCambio(delta: HardwareDelta): string {
    const componente = this.obtenerNombreComponente(delta.component_name);
    if (delta.change_type === 'ADDED') {
      return `Adición de ${componente}`;
    }
    if (delta.change_type === 'REMOVED') {
      return `Retiro de ${componente}`;
    }
    return `Modificación de ${componente}`;
  }

  formatearValor(valor: string | null): string {
    if (!valor) return 'N/A';
    const texto = valor.trim();

    if (texto.startsWith('{') && texto.endsWith('}')) {
      try {
        const datos = JSON.parse(texto);
        const partes: string[] = [];

        if (datos.model) partes.push(datos.model);
        if (datos.name) partes.push(datos.name);
        if (datos.capacity_gb) partes.push(`${datos.capacity_gb}GB`);
        if (datos.speed_mhz) partes.push(`${datos.speed_mhz}MHz`);
        if (datos.slot) partes.push(`Slot ${datos.slot}`);
        if (datos.serial_number) partes.push(`S/N: ${datos.serial_number}`);

        return partes.length > 0 ? partes.join(' - ') : texto;
      } catch {
        return texto;
      }
    }

    return texto;
  }

  obtenerObservaciones(delta: HardwareDelta): string {
    const componente = this.obtenerNombreComponente(delta.component_name).toLowerCase();
    const anterior = this.formatearValor(delta.previous_value);
    const nuevo = this.formatearValor(delta.new_value);

    if (delta.change_type === 'REMOVED') {
      return `Se detectó la desconexión o retiro de ${componente} (${anterior}) durante el escaneo del agente SAEC.`;
    }
    if (delta.change_type === 'ADDED') {
      return `Se detectó la instalación de nuevo componente de ${componente} (${nuevo}) durante el escaneo del agente SAEC.`;
    }
    return `Cambio en ${componente} de "${anterior}" a "${nuevo}" registrado automáticamente por el agente SAEC.`;
  }
}

