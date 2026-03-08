// src/app/pages/admin/gym-class-management/enrolled-users-modal/enrolled-users-modal.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { GymClassService } from '../../../../services/gym-class.service';
import { GymClassEnrolledUsers } from '../../../../shared/interfaces';

interface ModalData {
  classId: number;
  className: string;
}

@Component({
  selector: 'app-enrolled-users-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
<div class="p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-2">
    <div>
      <h2 class="text-2xl font-bold">
        Inscriptos en {{ data.className }}
      </h2>
      <!-- ✅ DÍA Y HORA DE LA CLASE -->
      @if (enrolledData()?.dayAndTime) {
        <p class="text-sm text-slate-400 mt-1 flex items-center gap-2">
          <i class="fas fa-calendar-alt text-yellow-400"></i>
          {{ enrolledData()?.dayAndTime }}
        </p>
      }
    </div>
    <div class="flex items-center gap-3">
      <!-- ✅ CONTADOR DE CAPACIDAD -->
      <span class="px-3 py-1.5 rounded-lg text-sm font-bold 
                   bg-yellow-400/20 text-slate-800 border border-yellow-400/30">
        {{ enrolledData()?.currentEnrollments ?? 0 }}/{{ enrolledData()?.maxCapacity ?? 0 }}
      </span>
      <button mat-icon-button (click)="close()" class="text-slate-400 hover:text-slate-800">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  </div>

  <!-- Loading -->
  @if (loading()) {
    <div class="text-center py-12">
      <mat-icon class="animate-spin text-4xl text-yellow-400">progress_activity</mat-icon>
      <p class="text-slate-400 mt-4">Cargando...</p>
    </div>
  }

  <!-- Sin inscriptos -->
  @if (!loading() && (enrolledData()?.users ?? []).length === 0) {
    <div class="text-center py-12">
      <p class="text-slate-400 text-lg">No hay usuarios inscriptos en esta clase</p>
    </div>
  }

  <!-- ✅ Lista de usuarios CON avatar circular y SIN plan -->
  @if (!loading() && (enrolledData()?.users ?? []).length > 0) {
    <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
      @for (user of enrolledData()?.users ?? []; track user.id) {
        <div class="glass-card p-4 flex items-center justify-between
                    hover:bg-slate-700/50 transition-colors duration-200">
          <!-- ✅ AVATAR CIRCULAR CON INICIAL -->
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-blue-500/20
                        flex items-center justify-center
                        text-blue-400 font-bold text-lg
                        border border-blue-500/30">
              {{ user.nombre.charAt(0) | uppercase }}
            </div>
            <div>
              <p class="font-semibold text-lg">
                {{ user.nombre }} {{ user.apellido }}
              </p>
              <p class="text-sm text-slate-500">{{ user.email }}</p>
            </div>
          </div>
          <!-- ❌ SIN BADGE DE PLAN -->
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
export class EnrolledUsersModalComponent {
  private gymClassService = inject(GymClassService);
  private toastr = inject(ToastrService);
  data = inject<ModalData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<EnrolledUsersModalComponent>);

  enrolledData = signal<GymClassEnrolledUsers | null>(null);
  loading = signal(true);

  constructor() {
    this.loadEnrolledUsers();
  }

  async loadEnrolledUsers() {
    this.loading.set(true);
    try {
      const data = await this.gymClassService.getEnrolledUsers(this.data.classId).toPromise();
      this.enrolledData.set(data ?? null);
    } catch (error: any) {
      this.toastr.error('Error al cargar los inscriptos', 'Error');
    } finally {
      this.loading.set(false);
    }
  }

  close() {
    this.dialogRef.close();
  }
}