import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingService } from '../../core/services/setting.service';
// Asegúrate de que la ruta a tu MaterialModule sea correcta
import { MaterialModule } from '../../shared/material.module'; 

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule // Utilizas tu módulo centralizado de Material
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss' // Si tienes SCSS, o borra esta línea si no lo usas
})
export class Configuracion implements OnInit {
  
  configForm: FormGroup;

  // Variables exigidas por el HTML para mostrar el nombre del archivo seleccionado
  plantillaEntrega: File | null = null;
  plantillaHojaVida: File | null = null;

  constructor(
    private fb: FormBuilder,
    private settingService: SettingService
  ) {
    this.configForm = this.fb.group({
      totalEquipos: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Carga la meta inicial de la base de datos
    this.settingService.getSetting('total_equipos').subscribe({
      next: (response) => {
        this.configForm.patchValue({ totalEquipos: response.value });
      },
      error: (err) => {
        console.log('No se encontró la configuración inicial de total_equipos');
      }
    });
  }

  // Función exigida por el evento (change) en los inputs file del HTML
  onFileSelected(event: any, tipo: 'entrega' | 'hoja_vida') {
    const file: File = event.target.files[0];
    if (file) {
      if (tipo === 'entrega') this.plantillaEntrega = file;
      if (tipo === 'hoja_vida') this.plantillaHojaVida = file;
    }
  }

  guardarConfiguracion() {
    if (this.configForm.valid) {
      const nuevoValor = this.configForm.value.totalEquipos.toString();
      
      // 1. Guardar la meta numérica
      this.settingService.updateSetting('total_equipos', nuevoValor).subscribe({
        next: () => console.log('Configuración numérica actualizada exitosamente'),
        error: (err) => {
          if (err.status === 404) {
            this.settingService.createSetting({ key: 'total_equipos', value: nuevoValor }).subscribe();
          }
        }
      });

      // 2. Subir plantilla de Entrega si se seleccionó una
      if (this.plantillaEntrega) {
        this.settingService.uploadTemplate('plantilla_entrega', this.plantillaEntrega).subscribe({
          next: () => {
            console.log('Plantilla de entrega subida con éxito');
            this.plantillaEntrega = null; // Limpiamos la variable tras subir
          },
          error: (err) => console.error('Error al subir plantilla de entrega', err)
        });
      }
      
      // 3. Subir plantilla de Hoja de Vida si se seleccionó una
      if (this.plantillaHojaVida) {
        this.settingService.uploadTemplate('plantilla_hoja_vida', this.plantillaHojaVida).subscribe({
          next: () => {
            console.log('Plantilla de hoja de vida subida con éxito');
            this.plantillaHojaVida = null; // Limpiamos la variable tras subir
          },
          error: (err) => console.error('Error al subir plantilla de hoja de vida', err)
        });
      }
    }
  }
}