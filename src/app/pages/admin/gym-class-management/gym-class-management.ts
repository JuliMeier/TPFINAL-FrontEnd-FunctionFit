import { Component, computed, inject, signal } from '@angular/core';
import { GymClassService } from '../../../services/gym-class.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GymClassFormComponent } from '../gym-class-form/gym-class-form.component';
import { GymClass, GymClassDeleteSummary, GroupedGymClass } from '../../../shared/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { EnrolledUsersModalComponent } from './enrolled-users-modal/enrolled-users-modal.component';

@Component({
  selector: 'app-gym-class-management',
  imports: [FormsModule, CommonModule, GymClassFormComponent],
  templateUrl: './gym-class-management.html',
  styleUrl: './gym-class-management.scss',
})
export default class GymClassManagement {
  private gymClassService = inject(GymClassService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  deleteSummary = signal<GymClassDeleteSummary | null>(null);
  gymClasses = signal<GymClass[]>([]);
  showForm = signal(false);
  selectedGymClass: GymClass | null = null;
  showConfirmDialog = false;
  pendingDeleteId: number | null = null;

  // ✅ ARRAY SIMPLE PARA MOSTRAR EN TABLA (índice = día del backend)
  // Backend: 1=Lunes, 2=Martes... 7=Domingo
  days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // ✅ ARRAY DE OBJETOS PARA LOS BOTONES DEL FILTRO
  filterDays = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
  ];

  // ✅ FILTRO POR DÍA (null = todos los días)
  selectedDay = signal<number | null>(null);
  todayDay = signal<number>(this.getCurrentDayOfWeek());

  constructor() {
    this.loadGymClasses();
  }

  // ✅ MÉTODO: JS getDay() devuelve 0=Domingo, backend usa 7=Domingo
  private getCurrentDayOfWeek(): number {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 7 : jsDay;
  }

  async loadGymClasses() {
    try {
      const allClasses = await this.gymClassService.getAllGymClasses().toPromise();
      if (allClasses) {
        this.gymClasses.set(allClasses);
      }
    } catch (err: any) {
      this.toastr.error('Error al cargar las clases', 'Error');
    }
  }

  // ✅ AGRUPAR CLASES POR NOMBRE
  groupedClasses = computed(() => {
    const allClasses = this.gymClasses();
    if (!allClasses || allClasses.length === 0) return [];

    const map = new Map<string, {
      nombre: string;
      descripcion: string;
      duracionMinutos: number;
      imageUrl: string;
      turnos: GymClass[]
    }>();

    for (const c of allClasses) {
      if (!map.has(c.nombre)) {
        map.set(c.nombre, {
          nombre: c.nombre,
          descripcion: c.descripcion,
          duracionMinutos: c.duracionMinutos,
          imageUrl: c.imageUrl,
          turnos: []
        });
      }
      map.get(c.nombre)!.turnos.push(c);
    }

    return Array.from(map.values());
  });

  // ✅ FILTRAR CLASES POR DÍA SELECCIONADO
  filteredGroupedClasses = computed(() => {
    const selected = this.selectedDay();
    const allGroups = this.groupedClasses();

    if (!selected) return allGroups;

    return allGroups
      .map(group => ({
        ...group,
        turnos: group.turnos.filter(turno => turno.dia === selected)
      }))
      .filter(group => group.turnos.length > 0);
  });

  // ✅ FILTRAR POR DÍA
  filterByDay(day: number | null) {
    this.selectedDay.set(day);
  }

  // ✅ VERIFICAR SI ES HOY
  isToday(dia: number): boolean {
    return dia === this.todayDay();
  }

  editGymClass(gymClass: GymClass) {
    this.selectedGymClass = gymClass;
    this.showForm.set(true);
  }

  createNewClass() {
    this.selectedGymClass = null;
    this.showForm.set(true);
  }

  async confirmDelete(id: number) {
    this.pendingDeleteId = id;
    try {
      const summary = await this.gymClassService.getDeleteSummary(id).toPromise();
      this.deleteSummary.set(summary ?? null);
      this.showConfirmDialog = true;
    } catch (err) {
      this.toastr.error('Error al cargar información de la clase');
      this.showConfirmDialog = true;
    }
  }

  viewEnrolledUsers(gymClass: GymClass) {
    const dialogRef = this.dialog.open(EnrolledUsersModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        classId: gymClass.id,
        className: gymClass.nombre
      },
      panelClass: 'ff-confirm-dialog'
    });
  }

  cancelDelete() {
    this.showConfirmDialog = false;
    this.pendingDeleteId = null;
  }

  async deleteGymClass(id: number | null) {
    if (!id) return;
    try {
      await this.gymClassService.deleteGymClass(id).toPromise();
      this.toastr.success('Clase eliminada correctamente');
      await this.loadGymClasses();
    } catch (err: any) {
      this.toastr.error('Error al eliminar la clase', 'Error');
    } finally {
      this.showConfirmDialog = false;
      this.pendingDeleteId = null;
    }
  }

  onFormClose() {
    this.showForm.set(false);
    this.selectedGymClass = null;
    this.loadGymClasses();
  }

  getClassImage(nombre: string): string {
    const images: { [key: string]: string } = {
      'Yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=150&fit=crop',
      'CrossFit': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=150&fit=crop',
      'Spinning': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=150&fit=crop',
      'Pilates': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=150&fit=crop',
      'Boxeo': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=150&fit=crop',
      'Zumba': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=150&fit=crop'
    };
    return images[nombre] ?? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=150&fit=crop';
  }
}