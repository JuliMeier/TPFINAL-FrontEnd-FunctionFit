import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../../services/plan.service';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Plan } from '../../../shared/interfaces';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './plan-management.html',
  styleUrl: './plan-management.scss',
})
export default class PlanManagement {
  private planService = inject(PlanService);
  private toastr = inject(ToastrService);

  plans = signal<Plan[]>([]);
  selectedPlan = signal<Plan | null>(null);
  priceError = signal<string | null>(null);

  constructor() {
    this.loadPlans();
  }

  loadPlans() {
    this.planService.getAllPlans().subscribe({
      next: (allPlans) => {
        this.plans.set(allPlans.sort((a, b) => a.tipo - b.tipo));
      },
      error: (err) => {
        console.error('Error al cargar planes', err);
        this.toastr.error('Error al cargar los planes');
      }
    });
  }

  validatePriceHierarchy(planId: number, newPrice: number): string | null {
    const allPlans = this.plans();

    if (planId === 1) {
      const premium = allPlans.find(p => p.tipo === 2);
      if (premium && newPrice >= premium.precio) {
        return `Basic debe ser menor que Premium ($${premium.precio})`;
      }
    }

    if (planId === 2) {
      const basic = allPlans.find(p => p.tipo === 1);
      const elite = allPlans.find(p => p.tipo === 3);

      if (basic && newPrice <= basic.precio) {
        return `Premium debe ser mayor que Basic ($${basic.precio})`;
      }
      if (elite && newPrice >= elite.precio) {
        return `Premium debe ser menor que Elite ($${elite.precio})`;
      }
    }

    if (planId === 3) {
      const premium = allPlans.find(p => p.tipo === 2);
      if (premium && newPrice <= premium.precio) {
        return `Elite debe ser mayor que Premium ($${premium.precio})`;
      }
    }

    return null;
  }

  editPlan(id: number) {
    this.planService.getPlanById(id).subscribe({
      next: (plan) => {
        this.selectedPlan.set(plan);
        this.priceError.set(null);
      },
      error: (err) => {
        console.error('Error al cargar plan', err);
        this.toastr.error('Error al cargar el plan');
      }
    });
  }

  savePlan() {
    const plan = this.selectedPlan();
    if (!plan) return;

    if (!Number.isInteger(plan.precio) || plan.precio < 1) {
      this.toastr.warning('El precio debe ser un número entero mayor a 0');
      return;
    }

    const error = this.validatePriceHierarchy(plan.id, plan.precio);
    if (error) {
      this.priceError.set(error);
      this.toastr.warning(error);
      return;
    }

    this.planService.updatePlan(plan.id, plan).subscribe({
      next: () => {
        this.toastr.success('Plan actualizado correctamente');
        this.loadPlans();
        this.selectedPlan.set(null);
        this.priceError.set(null);
      },
      error: (err) => {
        console.error('Error al actualizar plan', err);
        this.toastr.error('Error al actualizar el plan');
      }
    });
  }
}