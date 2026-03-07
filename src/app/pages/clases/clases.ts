import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ServicesService } from '../../services/services.service';
import { PaymentService } from '../../services/payment.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';
import { GroupedGymClass, GymClass, GymClassTurn } from '../../shared/interfaces';

@Component({
  selector: 'app-gym-classes',
  templateUrl: './clases.html',
  standalone: true,
  imports: [CommonModule]
})
export default class GymClassesComponent implements OnInit {
  groupedClasses: GroupedGymClass[] = [];
  loading = false;
  error: string | null = null;

  private servicesService = inject(ServicesService);
  private paymentService = inject(PaymentService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  hasActiveSubscription = false;

  // ✅ LÍMITE DE CLASES
  classLimit = 0;
  enrolledClassesCount = 0;
  reachedClassLimit = false;

  // ✅ FILTRO POR DÍA (null = todos los días)
  selectedDay = signal<number | null>(null);
  todayDay = signal<number>(this.getCurrentDayOfWeek());
  todayClassesCount = signal(0);

  // ✅ DÍAS DE LA SEMANA (1-7 para coincidir con backend)
  days = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
  ];

  ngOnInit(): void {
    this.loadPayments();
    this.loadUserProfile();
    this.loadClasses();
  }

  // ✅ MÉTODO CORREGIDO: JS getDay() devuelve 0=Domingo, backend usa 7=Domingo
  private getCurrentDayOfWeek(): number {
    const jsDay = new Date().getDay(); // 0=Domingo, 1=Lunes...6=Sábado
    return jsDay === 0 ? 7 : jsDay;    // Convertir 0→7 para coincidir con backend
  }

  // ✅ FILTRAR CLASES POR DÍA SELECCIONADO
  filteredGroupedClasses = computed(() => {
    const selected = this.selectedDay();
    const allClasses = this.groupedClasses;

    if (!selected) return allClasses;

    return allClasses
      .map(group => ({
        ...group,
        turnos: group.turnos.filter(turno => turno.dia === selected)
      }))
      .filter(group => group.turnos.length > 0);
  });

  // ✅ CONTAR CLASES DE HOY
  private updateTodayClassesCount() {
    const today = this.todayDay();
    const count = this.groupedClasses.reduce((acc, group) => {
      return acc + group.turnos.filter(t => t.dia === today).length;
    }, 0);
    this.todayClassesCount.set(count);
  }

  async loadPayments() {
    try {
      const userId = this.authService.getUserId();
      if (userId === 0) {
        this.toastr.warning('No hay sesión activa', 'Aviso');
        this.hasActiveSubscription = false;
        return;
      }
      const response = await this.paymentService.getActiveSubscription(userId).toPromise();
      this.hasActiveSubscription = response?.hasActiveSubscription ?? false;
      if (!this.hasActiveSubscription) {
        this.toastr.info('No tenés una suscripción activa. Para acceder a las clases, debes pagar un plan.', 'Suscripción requerida');
      }
    } catch (err) {
      console.error('Error al verificar suscripción:', err);
      this.hasActiveSubscription = false;
    }
  }

  async loadUserProfile() {
    try {
      const profile = await this.userService.getMe();
      this.classLimit = profile.classLimit || 0;
      this.enrolledClassesCount = profile.enrolledClassesCount || 0;
      this.reachedClassLimit = this.enrolledClassesCount >= this.classLimit && this.classLimit > 0;
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      this.classLimit = 0;
      this.enrolledClassesCount = 0;
      this.reachedClassLimit = false;
    }
  }

  canReserve(): boolean {
    return this.hasActiveSubscription && !this.reachedClassLimit;
  }

  getLimitMessage(): string {
    if (!this.hasActiveSubscription) {
      return 'No tenés una suscripción activa';
    }
    if (this.reachedClassLimit) {
      return `Límite alcanzado: ${this.enrolledClassesCount}/${this.classLimit} clases`;
    }
    return `Clases disponibles: ${this.classLimit - this.enrolledClassesCount}/${this.classLimit}`;
  }

  // ✅ FILTRAR POR DÍA
  filterByDay(day: number | null) {
    this.selectedDay.set(day);
  }

  // ✅ VERIFICAR SI ES HOY
  isToday(dia: number): boolean {
    return dia === this.todayDay();
  }

  async reserve(classId: number) {
    if (!this.canReserve()) {
      this.toastr.warning(this.getLimitMessage(), 'Atención');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Confirmar reserva',
        message: '¿Estás seguro de que querés reservar esta clase?'
      },
      panelClass: 'ff-confirm-dialog'
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const res = await this.servicesService.reserveClass(classId);
          if (res.success) {
            this.updateTurnoState(classId, true, res.currentEnrollments, res.maxCapacity);
            this.toastr.success('¡Reserva confirmada!');
            await this.loadUserProfile();
            this.updateTodayClassesCount();
          } else {
            this.toastr.error(res.message || 'No se pudo reservar', 'Error');
          }
        } catch (err: any) {
          this.toastr.error(err?.message || 'Error al reservar', 'Error');
        }
      }
    });
  }

  async cancel(classId: number) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Cancelar reserva',
        message: '¿Estás seguro de que querés cancelar esta clase?'
      },
      panelClass: 'ff-confirm-dialog'
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const res = await this.servicesService.cancelReservation(classId);
          if (res.success) {
            this.updateTurnoState(classId, false, res.currentEnrollments, res.maxCapacity);
            this.toastr.info('Reserva cancelada');
            await this.loadUserProfile();
            this.updateTodayClassesCount();
          } else {
            this.toastr.warning(res.message || 'No se pudo cancelar', 'Atención');
          }
        } catch (err: any) {
          this.toastr.error(err?.message || 'Error al cancelar', 'Error');
        }
      }
    });
  }

  private updateTurnoState(classId: number, isReserved: boolean, currentEnrollments?: number, maxCapacity?: number) {
    for (const group of this.groupedClasses) {
      const turno = group.turnos.find(t => t.id === classId);
      if (turno) {
        turno.isReservedByUser = isReserved;
        if (currentEnrollments !== undefined) turno.currentEnrollments = currentEnrollments;
        if (maxCapacity !== undefined) turno.maxCapacity = maxCapacity;
        break;
      }
    }
  }

  async loadClasses() {
    this.loading = true;
    this.error = null;
    try {
      const classes = await this.servicesService.getGymClasses();
      this.groupedClasses = this.groupClasses(classes);
      this.updateTodayClassesCount();
    } catch (err) {
      console.error(err);
      this.error = 'No se pudieron cargar las clases';
    } finally {
      this.loading = false;
    }
  }

  private groupClasses(classes: GymClass[]): GroupedGymClass[] {
    const map = new Map<string, GroupedGymClass>();
    for (const c of classes) {
      if (!map.has(c.nombre)) {
        map.set(c.nombre, {
          nombre: c.nombre,
          descripcion: c.descripcion,
          duracionMinutos: c.duracionMinutos,
          imageUrl: c.imageUrl,
          turnos: []
        });
      }
      const turno: GymClassTurn = {
        id: c.id,
        dia: c.dia,
        hora: c.hora,
        isReservedByUser: c.isReservedByUser,
        maxCapacity: c.maxCapacity,
        currentEnrollments: c.currentEnrollments,
        duracionMinutos: c.duracionMinutos
      };
      map.get(c.nombre)!.turnos.push(turno);
    }
    return Array.from(map.values());
  }

  getDayName(day: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day] ?? '';
  }

  getAvailabilityMessage(turno: { maxCapacity: number; currentEnrollments: number }): string {
    const available = turno.maxCapacity - turno.currentEnrollments;
    if (available <= 0) return '¡Completa!';
    if (available === 1) return 'Queda 1 lugar';
    return `Quedan ${available} lugares`;
  }

  getClassImage(nombre: string): string {
    const images: { [key: string]: string } = {
      'Yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=150&fit=crop',
      'CrossFit': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=150&fit=crop',
      'Spinning': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=150&fit=crop',
      'Pilates': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=150&fit=crop',
      'Boxeo': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=150&fit=crop',
      'Natación': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=150&fit=crop'
    };
    return images[nombre] ?? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=150&fit=crop';
  }
}