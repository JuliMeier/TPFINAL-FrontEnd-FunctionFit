import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../../services/payment.service';
import { AdminUserService } from '../../../services/adminUser.service';
import { PlanService } from '../../../services/plan.service';
import { PaymentResponse } from '../../../shared/interfaces';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './payment-management.html',
  styleUrl: './payment-management.scss',
})
export default class PaymentManagement implements OnInit {

  private paymentService = inject(PaymentService);
  private adminUserService = inject(AdminUserService);
  private planService = inject(PlanService);
  private toastr = inject(ToastrService);


  payments = signal<PaymentResponse[]>([]);
  users = signal<any[]>([]);
  plans = signal<any[]>([]);
  searchTerm = signal('');

  manualCharge = {
    userId: null as number | null,
    planId: null as number | null,
    monto: 0
  };

  filteredPayments = computed(() => {
  const term = this.searchTerm().toLowerCase().trim();
  if (!term) return this.payments();
  return this.payments().filter(p =>
    p.userId.toString().includes(term)
  );
});

  updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  async ngOnInit() {
    await Promise.all([
      this.loadUsers(),
      this.loadPlans()
    ]);
    this.loadPayments();
  }

  async loadUsers() {
    try {
      const res = await this.adminUserService.getAllUsers();
      this.users.set(res);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  }

  async loadPlans() {
    try {
      const res = await firstValueFrom(this.planService.getAllPlans());
      
      this.plans.set(res);
    } catch (err) {
      console.error('Error cargando planes:', err);
    }
  }

  loadPayments() {
    this.paymentService.getPayments().subscribe((res: PaymentResponse[]) => {
      this.payments.set(res);
    });
  }

  onPlanChange() {
    
    const selectedPlan = this.plans().find(p => p.id == this.manualCharge.planId);
    
    if (selectedPlan) {
      
      this.manualCharge.monto = selectedPlan.precio || selectedPlan.price || 0;
      console.log('Monto detectado:', this.manualCharge.monto);
    }
  }

  onSubmitManual() {
    
    if (!this.manualCharge.userId || !this.manualCharge.planId || this.manualCharge.monto <= 0) {
      this.toastr.warning('Por favor, selecciona un usuario y un plan válidos.');
      return;
    }

    this.paymentService.createManualPayment(this.manualCharge).subscribe({
      next: () => {
        this.toastr.success('Pago registrado correctamente');
        this.loadPayments();
        // Resetear el formulario
        this.manualCharge = { userId: null, planId: null, monto: 0 };
      },
      error: (err) => {
        console.error('Error en cargo manual:', err);
       
      let errorMessage = 'No se pudo registrar el pago';
      
      if (err.error && typeof err.error === 'string') {
        
        if (err.error.includes("El usuario ya tiene una suscripción activa")) {
          errorMessage = "El usuario ya tiene una suscripción activa.";
        } else {
          errorMessage = err.error;
        }
      } else if (err.error?.message) {
        
        errorMessage = err.error.message;
      }

      
      this.toastr.error(errorMessage, 'Operación no permitida');
    }
      
    });
  }
}