import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AdminUserService } from '../../../services/adminUser.service';

@Component({
  selector: 'app-metricas',
  imports: [CommonModule, MatIconModule],
  templateUrl: './metricas.html',
  styles: [`
        .space-y-8 {
            > * + * {
                margin-top: 2rem;
            }
        }

        .glass-card {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }

        .divide-y > * + * {
            border-top: 1px solid rgba(51, 65, 85, 0.5);
        }

        .divide-x > * + * {
            border-left: 1px solid rgba(51, 65, 85, 0.5);
        }

        .divide-slate-700 {
            border-color: rgba(51, 65, 85, 0.5);
        }

        .divide-slate-800 {
            border-color: rgba(30, 41, 59, 0.8);
        }

        table {
            background: transparent;

            thead {
                background: rgba(15, 23, 42, 0.5);
            }

            tbody {
                tr {
                    transition: background-color 0.2s ease;

                    &:hover {
                        background: rgba(30, 41, 59, 0.3);
                    }
                }
            }
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
export default class Metricas {
  private adminService = inject(AdminUserService);

  stats = signal({
    totalUsers: 0,
    totalAdmins: 0,
    totalSocios: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    subscriptionRate: 0,
    totalClasses: 0,
    classesWithAvailableSpots: 0,
    fullClasses: 0,
    occupancyRate: 0,
    totalEnrollments: 0,  // ✅ NUEVO CAMPO
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0
  });

  loading = signal(true);

  constructor() {
    this.loadActivity();
  }

  async loadActivity() {
    this.loading.set(true);
    try {
      const data = await this.adminService.getActivitySummary();
      this.stats.set(data.stats);
    } catch (err) {
      console.error('Error cargando actividad:', err);
    } finally {
      this.loading.set(false);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(value);
  }
}