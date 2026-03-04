import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importar Router
import { PlanService } from '../../services/plan.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { PlanResponse, TypePlan } from '../../shared/interfaces';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pagos.html'
})
export default class PagosComponent implements OnInit {
  private planService = inject(PlanService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  plans = signal<PlanResponse[]>([]);
  loading = signal(false);
  typePlan = TypePlan;
  subscription = signal<any>(null);

  esperandoConfirmacion = signal(false);

  ngOnInit() {
    this.loadPlans();
    this.checkPaymentStatus();
    this.checkCurrentSubscription();
  }

  checkCurrentSubscription() {
    try {
      const userId = this.authService.getUserId();
      if (userId === 0) {
        this.subscription.set(null);
        return;
      }
      this.paymentService.getActiveSubscription(userId).subscribe({
        next: (response) => {
          if (response?.hasActiveSubscription && response.subscription?.isActive) {
            this.subscription.set(response.subscription);
          } else {
            this.subscription.set(null);
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener ID del usuario:', error);
      this.subscription.set(null);
    }
  }

  loadPlans() {
    this.planService.getAllPlans().subscribe(res => this.plans.set(res));
  }

  checkPaymentStatus() {
    // Escuchamos los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      const paymentId = params['payment_id'];
      const status = params['status'];

      // Si el pago fue aprobado y tenemos el ID, confirmamos con el backend
      if (status === 'approved' && paymentId) {
        this.confirmarPagoEnServidor(paymentId);
      } else if (status === 'failure') {
        this.toastr.error('El pago fue rechazado. Por favor, intenta nuevamente.');
      }
    });
  }

  confirmarPagoEnServidor(paymentId: string) {

    if (!paymentId) {
      this.toastr.warning('No se recibió el ID del pago. No se puede confirmar.');
      return;
    }

    this.loading.set(true);
    this.paymentService.confirmarPago(paymentId).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.esperandoConfirmacion.set(false); // Ocultamos el cuadro
        this.checkCurrentSubscription(); // Refrescar el estado de la suscripción
        this.toastr.success('¡Pago confirmado exitosamente!');
        this.router.navigate(['/home-socio']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('No se pudo validar el pago. Verifica el número e intenta de nuevo.');
      }
    });
  }

  buyPlan(planId: number) {
    this.loading.set(true);
    this.paymentService.createPreference(planId).subscribe({
      next: (res) => {
        this.loading.set(false);
        window.open(res.initPoint, '_blank');
        this.esperandoConfirmacion.set(true);
      },
      error: () => this.loading.set(false)
    });
  }

  getPlanDetails(tipo: TypePlan) {
    const details = {
      [TypePlan.Basic]: { icon: '🚀', desc: '5 clases mensuales' },
      [TypePlan.Premium]: { icon: '⭐', desc: '10 clases mensuales' },
      [TypePlan.Elite]: { icon: '👑', desc: '15 clases mensuales' }
    };
    return details[tipo];
  }
}
