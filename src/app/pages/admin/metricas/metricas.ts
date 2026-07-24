import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AdminUserService } from '../../../services/adminUser.service';
import Chart from 'chart.js/auto';

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
    
    // Animación fade-in para KPI cards
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .glass-card {
      animation: fadeInUp 0.5s ease-out forwards;
      opacity: 0;
      
      &:nth-child(1) { animation-delay: 0.1s; }
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.3s; }
      &:nth-child(4) { animation-delay: 0.4s; }
    }
  `]
})
export default class Metricas implements OnInit, AfterViewInit {
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
        totalEnrollments: 0,
        totalPayments: 0,
        paidPayments: 0,
        pendingPayments: 0,
        totalRevenue: 0
    });

    loading = signal(true);

    // ✅ KPIs COMPUTADOS
    kpis = signal<Array<{
        label: string;
        value: string | number;
        icon: string;
        colorClass: string;
        borderClass: string;
        tooltip: string;
    }>>([]);

    // ✅ REFERENCIAS A LOS GRÁFICOS
    private userRoleChart: Chart | null = null;
    private subscriptionChart: Chart | null = null;
    private paymentChart: Chart | null = null;

    constructor() {
        this.loadActivity();
    }

    ngOnInit() {
        this.loadActivity();
    }

    ngAfterViewInit() {
        // Construir gráficos después de que el DOM esté listo
        setTimeout(() => {
            this.buildUserRoleChart();
            this.buildSubscriptionChart();
            this.buildPaymentChart();
        }, 100);
    }

    async loadActivity() {
        this.loading.set(true);
        try {
            const data = await this.adminService.getActivitySummary();
            this.stats.set(data.stats);

            // ✅ ACTUALIZAR KPIs
            this.kpis.set([
                {
                    label: 'Total Usuarios',
                    value: this.stats().totalUsers,
                    icon: 'fas fa-users',
                    colorClass: 'text-blue-400',
                    borderClass: 'border-blue-500',
                    tooltip: 'Usuarios registrados en el sistema'
                },
                {
                    label: 'Ingresos Totales',
                    value: this.formatCurrencyShort(this.stats().totalRevenue),
                    icon: 'fas fa-euro-sign',
                    colorClass: 'text-green-400',
                    borderClass: 'border-green-500',
                    tooltip: 'Suma de todos los pagos aprobados'
                },
                {
                    label: 'Clases Activas',
                    value: this.stats().totalClasses,
                    icon: 'fas fa-dumbbell',
                    colorClass: 'text-yellow-400',
                    borderClass: 'border-yellow-500',
                    tooltip: 'Turnos de clases programados'
                },
                {
                    label: 'Ocupación',
                    value: this.stats().occupancyRate + '%',
                    icon: 'fas fa-chart-pie',
                    colorClass: 'text-purple-400',
                    borderClass: 'border-purple-500',
                    tooltip: 'Porcentaje de cupos ocupados'
                }
            ]);

            // ✅ RECONSTRUIR GRÁFICOS DESPUÉS DE CARGAR DATOS
            setTimeout(() => {
                this.buildUserRoleChart();
                this.buildSubscriptionChart();
                this.buildPaymentChart();
            }, 200);

        } catch (err) {
            console.error('Error cargando actividad:', err);
        } finally {
            this.loading.set(false);
        }
    }

    // ✅ FORMATO CORTO PARA MONEDA
    formatCurrencyShort(value: number): string {
        if (value >= 1000000) {
            return `€${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `€${(value / 1000).toFixed(0)}K`;
        }
        return `€${value.toFixed(0)}`;
    }

    // ✅ FORMATO COMPLETO PARA MONEDA
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // ✅ COLOR DINÁMICO PARA OCUPACIÓN
    getOccupancyColor(): string {
        const rate = this.stats().occupancyRate;
        if (rate >= 80) return '#ef4444'; // Rojo - Alta ocupación
        if (rate >= 50) return '#eab308'; // Amarillo - Media
        return '#22c55e'; // Verde - Baja
    }

    // ✅ GRÁFICO DE BARRAS - USUARIOS POR ROL
    private buildUserRoleChart() {
        const canvas = document.getElementById('userRoleChart') as HTMLCanvasElement;
        if (!canvas) return;

        // Destruir gráfico anterior si existe
        if (this.userRoleChart) {
            this.userRoleChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        this.userRoleChart = new Chart(ctx, {
            type: 'bar',
            data: {
                // ✅ SOLO 2 LABELS - Sacamos Super Admins del eje X
                labels: ['Socios', 'Admins'],
                datasets: [{
                    label: 'Usuarios',
                    data: [
                        this.stats().totalSocios,
                        this.stats().totalAdmins
                    ],
                    backgroundColor: ['#3b82f6', '#8b5cf6'],
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: (context) => ` ${context.parsed.y} usuarios`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(51, 65, 85, 0.5)' },
                        ticks: {
                            color: '#94a3b8',
                            precision: 0
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // ✅ GRÁFICO DE DONA - SUSCRIPCIONES
    private buildSubscriptionChart() {
        const canvas = document.getElementById('subscriptionChart') as HTMLCanvasElement;
        if (!canvas) return;

        if (this.subscriptionChart) {
            this.subscriptionChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        this.subscriptionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Activas', 'Vencidas'],
                datasets: [{
                    data: [this.stats().activeSubscriptions, this.stats().expiredSubscriptions],
                    backgroundColor: ['#22c55e', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                const total = this.stats().activeSubscriptions + this.stats().expiredSubscriptions;
                                const pct = total > 0 ? Math.round((context.raw as number / total) * 100) : 0;
                                return ` ${context.label}: ${context.raw} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ✅ GRÁFICO DE PASTEL - PAGOS
    private buildPaymentChart() {
        const canvas = document.getElementById('paymentChart') as HTMLCanvasElement;
        if (!canvas) return;

        if (this.paymentChart) {
            this.paymentChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        this.paymentChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Aprobados', 'Pendientes'],
                datasets: [{
                    data: [this.stats().paidPayments, this.stats().pendingPayments],
                    backgroundColor: ['#22c55e', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                const total = this.stats().paidPayments + this.stats().pendingPayments;
                                const pct = total > 0 ? Math.round((context.raw as number / total) * 100) : 0;
                                return ` ${context.label}: ${context.raw} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}