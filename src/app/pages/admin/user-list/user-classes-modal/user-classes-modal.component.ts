import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { AdminUserService } from '../../../../services/adminUser.service';
import { GymClassSummary } from '../../../../shared/interfaces';

interface ModalData {
  userId: number;
  userName: string;
}

@Component({
  selector: 'app-user-classes-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        Clases de {{ data.userName }} 
        <span class="text-yellow-400">({{ classesCount() }})</span>
      </h2>
      <button mat-icon-button (click)="close()" class="text-slate-400 hover:text-slate-800">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- Loading -->
    @if (loading()) {
      <div class="text-center py-12">
        <mat-icon class="animate-spin text-4xl text-yellow-400">progress_activity</mat-icon>
        <p class="text-slate-400 mt-4">Cargando...</p>
      </div>
    }

    <!-- Sin clases -->
    @if (!loading() && classes().length === 0) {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Este usuario no tiene clases reservadas</p>
      </div>
    }

    <!-- ✅ Lista de clases CON BOTÓN DE BAJA (ÍCONO FONTAWESOME) -->
    @if (!loading() && classes().length > 0) {
      <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
        @for (cls of classes(); track cls.id) {
          <div class="glass-card p-4 flex items-center justify-between
          hover:bg-slate-700/50 transition-colors duration-200">
            <div>
              <p class="font-semibold text-lg">{{ cls.nombre }}</p>
              <p class="text-sm text-slate-500">
                {{ getDayName(cls.dia) }} · {{ cls.hora }}
              </p>
            </div>
            <!-- ✅ BOTÓN DE BAJA CON ÍCONO FONTAWESOME (igual que user-list) -->
            <button
              (click)="unenroll(cls.id, cls.nombre)"
              [disabled]="unrollingId() === cls.id"
              class="w-10 h-10 rounded-lg flex items-center justify-center
                     text-red-500 hover:text-red-400 
                     hover:bg-red-500/20 
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Dar de baja">
              @if (unrollingId() === cls.id) {
                <mat-icon class="animate-spin text-lg">progress_activity</mat-icon>
              } @else {
                <i class="fas fa-trash-alt text-lg"></i>
              }
            </button>
          </div>
        }
      </div>
    }

    <!-- Footer -->
    <div class="mt-6 pt-4 border-t border-slate-700 flex justify-end">
      <button mat-button (click)="close()"
      class="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
        Cerrar
      </button>
    </div>
  </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class UserClassesModalComponent {
  private adminUserService = inject(AdminUserService);
  private toastr = inject(ToastrService);
  data = inject<ModalData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<UserClassesModalComponent>);

  classes = signal<GymClassSummary[]>([]);
  classesCount = signal(0);
  loading = signal(true);
  unrollingId = signal<number | null>(null);

  constructor() {
    this.loadClasses();
  }

  async loadClasses() {
    this.loading.set(true);
    try {
      const profile = await this.adminUserService.getUserProfile(this.data.userId);
      const enrolledClasses = profile.enrolledClasses || [];
      this.classes.set(enrolledClasses);
      this.classesCount.set(enrolledClasses.length);
    } catch (error: any) {
      this.toastr.error('Error al cargar las clases', 'Error');
    } finally {
      this.loading.set(false);
    }
  }

  async unenroll(classId: number, className: string) {
    this.unrollingId.set(classId);
    try {
      const result = await this.adminUserService.unenrollUser(this.data.userId, classId);
      if (result.success) {
        this.toastr.success(`Usuario dado de baja de ${className}`, 'Éxito');
        await this.loadClasses();
      } else {
        this.toastr.error(result.message || 'No se pudo dar de baja', 'Error');
      }
    } catch (error: any) {
      this.toastr.error(error.message || 'Error al dar de baja', 'Error');
    } finally {
      this.unrollingId.set(null);
    }
  }

  getDayName(day: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day] ?? '';
  }

  close() {
    this.dialogRef.close(true);
  }
}