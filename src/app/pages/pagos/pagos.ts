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
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      const cancelled = params['cancelled'];

      if (sessionId) {
        this.confirmarPagoEnServidor(sessionId);
      } else if (cancelled) {
        this.toastr.warning('Cancelaste el proceso de pago. Podés intentarlo cuando quieras.');
      }
    });
  }

  confirmarPagoEnServidor(sessionId: string) {
    if (!sessionId) {
      this.toastr.warning('No se recibió el ID de sesión. No se puede confirmar.');
      return;
    }

    this.loading.set(true);
    this.paymentService.confirmarPago(sessionId).subscribe({
      next: () => {
        this.loading.set(false);
        this.checkCurrentSubscription();
        this.toastr.success('¡Pago confirmado exitosamente!');
        this.router.navigate(['/home-socio']);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('No se pudo validar el pago. Por favor contactá soporte.');
      }
    });
  }

  buyPlan(planId: number) {
    this.loading.set(true);
    this.paymentService.createCheckoutSession(planId).subscribe({
      next: (res) => {
        this.loading.set(false);
        window.location.href = res.initPoint;
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error al crear sesión de Stripe:', err);
        console.error('Detalle del error:', err?.error);
        this.toastr.error('No se pudo iniciar el proceso de pago. Revisá la consola para más detalles.');
      }
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
