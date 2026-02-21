import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AdminUserService } from '../../../services/adminUser.service';

@Component({
    selector: 'app-metricas',
    imports: [CommonModule, MatIconModule],
    templateUrl: './metricas.html',
    styles: [`
    .dashboard { 
      padding: 2rem; 
      background: #0f172a; 
      min-height: 100vh; 
      color: #e2e8f0; 
    }
    
    .header { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      margin-bottom: 2rem; 
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .stat-card:hover { 
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
    }
    
    .stat-content {
      flex: 1;
    }
    
    .stat-label { 
      color: #94a3b8; 
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .stat-value { 
      font-size: 1.75rem; 
      font-weight: 700;
    }
    
    .stat-subtitle {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
    
    .bg-users { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .bg-socios { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .bg-admins { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
    .bg-classes { background: rgba(250, 204, 21, 0.2); color: #facc15; }
    .bg-subs { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .bg-revenue { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .bg-payments { background: rgba(249, 115, 22, 0.2); color: #f97316; }
    .bg-occupancy { background: rgba(6, 182, 212, 0.2); color: #06b6d4; }
    
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
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