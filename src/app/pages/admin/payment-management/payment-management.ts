import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/payment.service';
import { PaymentResponse } from '../../../shared/interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './payment-management.html',
  styleUrl: './payment-management.scss',
})
export default class PaymentManagement implements OnInit {

  private paymentService = inject(PaymentService);
  payments = signal<PaymentResponse[]>([]);
  searchTerm = signal('');

  manualCharge = {
    userId: 0,
    planId: 1,
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

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.paymentService.getPayments().subscribe((res: PaymentResponse[]) => {
      this.payments.set(res);
    });
  }

  onSubmitManual() {
    if (this.manualCharge.userId <= 0 || this.manualCharge.monto <= 0) {
      alert('Por favor, completa los datos correctamente');
      return;
    }

    this.paymentService.createManualPayment(this.manualCharge).subscribe({
      next: () => {
        alert('Pago y suscripción cargados con éxito');
        this.loadPayments();
        this.manualCharge = { userId: 0, planId: 1, monto: 0 };
      },
      error: (err) => console.error('Error en cargo manual:', err)
    });
  }
}