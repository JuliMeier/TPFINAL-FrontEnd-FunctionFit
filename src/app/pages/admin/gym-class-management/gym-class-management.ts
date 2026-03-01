import { Component, computed, inject, signal } from '@angular/core';
import { GymClassService } from '../../../services/gym-class.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GymClassFormComponent } from '../gym-class-form/gym-class-form.component';
import { GymClass } from '../../../shared/interfaces';

@Component({
  selector: 'app-gym-class-management',
  imports: [FormsModule, CommonModule, GymClassFormComponent],
  templateUrl: './gym-class-management.html',
  styleUrl: './gym-class-management.scss',
})
export default class GymClassManagement {
  private gymClassService = inject(GymClassService);
  private toastr = inject(ToastrService);

  searchTerm = signal('');
  gymClasses = signal<GymClass[]>([]);
  showForm = signal(false);
  selectedGymClass: GymClass | null = null;
  showConfirmDialog = false;
  pendingDeleteId: number | null = null;

  days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor() {
    this.loadGymClasses();
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

  filteredGymClasses = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allClasses = this.gymClasses();
    if (!allClasses || allClasses.length === 0) return [];
    return allClasses.filter(c =>
      (c.nombre?.toLowerCase() ?? '').includes(term) ||
      (c.descripcion?.toLowerCase() ?? '').includes(term)
    );
  });

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  editGymClass(gymClass: GymClass) {
    this.selectedGymClass = gymClass;
    this.showForm.set(true);
  }

  // ✅ NUEVA CLASE
  createNewClass() {
    this.selectedGymClass = null;
    this.showForm.set(true);
  }

  confirmDelete(id: number) {
    this.pendingDeleteId = id;
    this.showConfirmDialog = true;
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

  // ✅ MÉTODO PARA OBTENER IMAGEN SEGÚN NOMBRE
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