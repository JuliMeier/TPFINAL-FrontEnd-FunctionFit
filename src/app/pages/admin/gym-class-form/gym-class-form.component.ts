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

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required]],
    duracionMinutos: [60, [Validators.required, Validators.min(10), Validators.max(180)]],
    imageUrl: ['Clase', [Validators.required]],
    dia: [1, [Validators.required]],
    hora: ['08:00', [Validators.required]],
    maxCapacity: [15, [Validators.required, Validators.min(1), Validators.max(50)]]
  });

  isLoading = false;
  isEditMode = false;
  selectedExistingClassId: number | null = null;

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
        imageUrl: this.gymClassToEdit.imageUrl || 'Clase'
      });
    }
  }

  onExistingClassChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const classId = Number(selectElement.value);

    if (classId && classId > 0) {
      const classToCopy = this.existingClasses.find(c => c.id === classId);
      if (classToCopy) {
        this.selectedExistingClassId = classId;
        this.form.patchValue({
          nombre: classToCopy.nombre,
          descripcion: classToCopy.descripcion,
          duracionMinutos: classToCopy.duracionMinutos,
          imageUrl: classToCopy.nombre
        });
      }
    } else {
      this.selectedExistingClassId = null;
      this.form.patchValue({
        nombre: '',
        descripcion: '',
        duracionMinutos: 60,
        imageUrl: 'Clase'
      });
    }
  }

  onNombreInput() {
    if (this.selectedExistingClassId) {
      this.selectedExistingClassId = null;
      const select = document.querySelector('select') as HTMLSelectElement;
      if (select) {
        select.value = '0';
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toastr.error('Por favor, completa todos los campos correctamente');
      return;
    }

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
    }
  }

  close() {
    this.onClose.emit();
  }
}