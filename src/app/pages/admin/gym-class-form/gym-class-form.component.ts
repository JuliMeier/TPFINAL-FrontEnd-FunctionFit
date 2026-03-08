// src/app/pages/admin/gym-class-form/gym-class-form.component.ts

import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GymClassService } from '../../../services/gym-class.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { GymClass } from '../../../shared/interfaces';

@Component({
  selector: 'app-gym-class-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gym-class-form.component.html',
  styleUrl: './gym-class-form.component.scss'
})
export class GymClassFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gymClassService = inject(GymClassService);
  private toastr = inject(ToastrService);

  @Input() gymClassToEdit: GymClass | null = null;
  @Output() onClose = new EventEmitter<void>();

  days = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
  ];

  existingClasses: GymClass[] = [];

  // ✅ IMÁGENES POR DEFECTO
  private defaultImages: { [key: string]: string } = {
    'Yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=150&fit=crop',
    'CrossFit': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=150&fit=crop',
    'Spinning': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=150&fit=crop',
    'Pilates': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=150&fit=crop',
    'Boxeo': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=150&fit=crop',
    'Zumba': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=150&fit=crop'
  };

  private fallbackImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=150&fit=crop';

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required]],
    duracionMinutos: [60, [Validators.required, Validators.min(10), Validators.max(180)]],
    imageUrl: [this.fallbackImage, [Validators.required]],
    dia: [1, [Validators.required]],
    hora: ['08:00', [Validators.required]],
    maxCapacity: [15, [Validators.required, Validators.min(1), Validators.max(50)]]
  });

  isLoading = false;
  isEditMode = false;
  selectedExistingClassId: number | null = null;
  isNewClassMode = false;

  // ✅ NUEVO: Turnos existentes de la clase seleccionada
  existingTurnosForClass: { dia: number, hora: string }[] = [];

  ngOnInit() {
    this.loadExistingClasses();
    this.loadGymClassData();
  }

  async loadExistingClasses() {
    try {
      const classes = await this.gymClassService.getAllGymClasses().toPromise();
      if (classes) {
        const uniqueNames = new Map<string, GymClass>();
        classes.forEach(c => {
          if (!uniqueNames.has(c.nombre)) {
            uniqueNames.set(c.nombre, c);
          }
        });
        this.existingClasses = Array.from(uniqueNames.values());
      }
    } catch (err) {
      console.error('Error cargando clases existentes:', err);
    }
  }

  loadGymClassData() {
    if (this.gymClassToEdit) {
      this.isEditMode = true;
      this.form.patchValue({
        nombre: this.gymClassToEdit.nombre,
        descripcion: this.gymClassToEdit.descripcion,
        duracionMinutos: this.gymClassToEdit.duracionMinutos,
        dia: this.gymClassToEdit.dia,
        hora: this.gymClassToEdit.hora,
        maxCapacity: this.gymClassToEdit.maxCapacity,
        imageUrl: this.gymClassToEdit.imageUrl || this.fallbackImage
      });
    }
  }

  // ✅ SELECCIONAR CLASE EXISTENTE
  onExistingClassChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const classId = Number(selectElement.value);

    if (classId && classId > 0) {
      const classToCopy = this.existingClasses.find(c => c.id === classId);
      if (classToCopy) {
        this.selectedExistingClassId = classId;
        this.isNewClassMode = false;

        // ✅ Autocompletar datos base
        this.form.patchValue({
          nombre: classToCopy.nombre,
          descripcion: classToCopy.descripcion,
          duracionMinutos: classToCopy.duracionMinutos,
          imageUrl: classToCopy.imageUrl || this.defaultImages[classToCopy.nombre] || this.fallbackImage,
          dia: 1,
          hora: '08:00',
          maxCapacity: 15
        }, { emitEvent: false });

        // ✅ OBTENER TURNOS EXISTENTES DE ESA CLASE (para mostrar aviso)
        this.existingTurnosForClass = this.existingClasses
          .filter(c => c.nombre === classToCopy.nombre)
          .map(c => ({ dia: c.dia, hora: c.hora }));

        // ✅ BLOQUEAR campos que no deben editarse al crear turno nuevo
        this.form.get('descripcion')?.disable();
        this.form.get('duracionMinutos')?.disable();
      }
    } else {
      this.resetToNewClassMode();
    }
  }

  // ✅ CAMBIAR A MODO "CREAR NUEVA"
  enableNewClassMode() {
    this.isNewClassMode = true;
    this.selectedExistingClassId = null;
    this.existingTurnosForClass = [];

    this.form.patchValue({
      nombre: '',
      descripcion: '',
      duracionMinutos: 60,
      imageUrl: this.fallbackImage,
      dia: 1,
      hora: '08:00',
      maxCapacity: 15
    }, { emitEvent: false });

    // ✅ DESBLOQUEAR todos los campos
    this.form.get('descripcion')?.enable();
    this.form.get('duracionMinutos')?.enable();

    setTimeout(() => {
      const input = document.querySelector('input[formControlName="nombre"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  // ✅ INPUT DE NOMBRE - Asigna imagen automáticamente
  onNombreInput() {
    const nombre = this.form.get('nombre')?.value || '';

    if (this.selectedExistingClassId) {
      this.selectedExistingClassId = null;
      this.existingTurnosForClass = [];
      const select = document.querySelector('select') as HTMLSelectElement;
      if (select) select.value = '0';
    }

    const img = this.defaultImages[nombre] || this.fallbackImage;
    this.form.patchValue({ imageUrl: img }, { emitEvent: false });

    // ✅ DESBLOQUEAR campos si es clase nueva
    this.form.get('descripcion')?.enable();
    this.form.get('duracionMinutos')?.enable();
  }

  public resetToNewClassMode() {
    this.selectedExistingClassId = null;
    this.isNewClassMode = false;
    this.existingTurnosForClass = [];

    this.form.get('descripcion')?.enable();
    this.form.get('duracionMinutos')?.enable();

    this.form.patchValue({
      nombre: '',
      descripcion: '',
      duracionMinutos: 60,
      imageUrl: this.fallbackImage,
      dia: 1,
      hora: '08:00',
      maxCapacity: 15
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toastr.error('Por favor, completa todos los campos correctamente');
      return;
    }

    // ✅ VALIDACIÓN DE CAPACIDAD MÍNIMA (solo en edición)
    if (this.isEditMode && this.gymClassToEdit) {
      const currentEnrollments = this.gymClassToEdit.currentEnrollments || 0;
      const newCapacity = this.form.get('maxCapacity')?.value || 0;

      if (newCapacity < currentEnrollments) {
        this.toastr.error(
          `No se puede reducir la capacidad a ${newCapacity}. ` +
          `Hay ${currentEnrollments} usuarios inscriptos. ` +
          `La capacidad mínima debe ser ${currentEnrollments}.`,
          'Capacidad insuficiente'
        );
        return;
      }
    }

    this.isLoading = true;
    try {
      // ✅ Habilitar campos antes de enviar (porque pueden estar disabled)
      this.form.get('descripcion')?.enable();
      this.form.get('duracionMinutos')?.enable();

      const formData = this.form.getRawValue();

      if (this.isEditMode) {
        if (this.gymClassToEdit) {
          await this.gymClassService.editGymClass(this.gymClassToEdit.id, formData).toPromise();
          this.toastr.success('Clase actualizada correctamente');
        }
      } else {
        await this.gymClassService.createGymClass(formData).toPromise();
        this.toastr.success('Clase creada correctamente');
      }

      this.onClose.emit();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.error?.message
        || (this.isEditMode ? 'Error al actualizar la clase' : 'Error al crear la clase');
      this.toastr.error(errorMessage);
    } finally {
      this.isLoading = false;
      // Volver a bloquear si corresponde
      if (this.selectedExistingClassId) {
        this.form.get('descripcion')?.disable();
        this.form.get('duracionMinutos')?.disable();
      }
    }
  }



  close() {
    this.onClose.emit();
  }
}