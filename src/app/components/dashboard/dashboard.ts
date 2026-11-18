import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingService } from '../../core/services/setting.service';
import { DeltaService } from '../../core/services/delta.service';
import { DashboardMetrics } from '../../core/interfaces/setting.interface';
import { HardwareDelta } from '../../core/interfaces/delta.interface';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  metrics: DashboardMetrics = {
    registro_actual: 0,
    meta: 0,
    porcentaje: 0
  };

  alertas: HardwareDelta[] = [];

  constructor(
    private settingService: SettingService,
    private deltaService: DeltaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // 1. Cargar métricas del Dashboard desde http://206.81.6.211/api/dashboard
    this.settingService.getDashboardMetrics().subscribe({
      next: (response) => {
        this.metrics = response;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al cargar las métricas del dashboard', err);
      }
    });

    // 2. Cargar alertas críticas recientes desde http://206.81.6.211/api/deltas
    this.deltaService.getDeltas().subscribe({
      next: (response) => {
        this.alertas = response.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al cargar las alertas recientes', err);
      }
    });
  }

  obtenerTituloAlerta(alerta: HardwareDelta): string {
    const nombres: { [key: string]: string } = {
      'RAM': 'MEMORIA RAM',
      'RAM_MODULE': 'MEMORIA RAM',
      'STORAGE': 'DISCO DURO',
      'STORAGE_DISK': 'DISCO DURO',
      'PROCESSOR': 'PROCESADOR',
      'GPU': 'TARJETA GRÁFICA',
      'GPU_DEVICE': 'TARJETA GRÁFICA',
      'NETWORK': 'TARJETA DE RED'
    };

    const componente = nombres[alerta.component_name] || alerta.component_name;

    if (alerta.change_type === 'REMOVED') {
      return `DESCONEXIÓN DE ${componente}`;
    }
    return `CAMBIO DE ${componente} DETECTADO`;
  }

  obtenerDescripcionAlerta(alerta: HardwareDelta): string {
    const valorAnterior = this.formatearValor(alerta.previous_value);
    const valorNuevo = this.formatearValor(alerta.new_value);

    if (alerta.change_type === 'REMOVED') {
      return `Se reportó ausencia de ${valorAnterior || alerta.component_name.toLowerCase()}`;
    }
    if (valorAnterior && valorNuevo) {
      return `Cambio de ${valorAnterior} a ${valorNuevo} detectado durante el escaneo automático`;
    }
    return `Modificación de ${alerta.component_name.toLowerCase()} detectada durante el escaneo automático`;
  }

  formatearValor(valor: string | null): string {
    if (!valor) return '';
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

  obtenerTiempoRelativo(fecha: string): string {
    if (!fecha) return 'Reciente';
    const diffMinutos = Math.max(1, Math.floor((Date.now() - new Date(fecha).getTime()) / 60000));
    if (diffMinutos < 60) {
      return `Hace ${diffMinutos} ${diffMinutos === 1 ? 'minuto' : 'minutos'}`;
    }
    const diffHoras = Math.floor(diffMinutos / 60);
    if (diffHoras < 24) {
      return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    }
    const diffDias = Math.floor(diffHoras / 24);
    return `Hace ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`;
  }

  irHistorialEquipo(deviceId: string) {
    if (deviceId) {
      this.router.navigate(['/historial', deviceId]);
    }
  }
}
