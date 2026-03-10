import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesService } from '../../services/services.service';
import { Historical } from '../../shared/interfaces';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-historical',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historical.html',
})
export default class HistoricalComponent implements OnInit {

  chart: any;
  history: Historical[] = [];

  totalClasses = 0;
  activeCount = 0;
  cancelledCount = 0;
  attendancePercent = 0;
  streak = 0;

  constructor(private service: ServicesService) { }

  async ngOnInit() {
    try {
      const data = await this.service.getUserHistory();

      this.history = data.map(item => ({
        ...item,
        classDate: this.formatDate(item.classDate),
        actionDate: item.actionDate
      }));

      this.calculateMetrics();
      setTimeout(() => this.buildPieChart(), 200);

    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private calculateMetrics() {
    this.totalClasses = this.history.length;
    this.cancelledCount = this.history.filter(h => h.status === 'Cancelled').length;
    this.activeCount = this.history.filter(h => h.status === 'Active').length;
    this.attendancePercent =
      this.totalClasses > 0
        ? Math.round((this.activeCount / this.totalClasses) * 100)
        : 0;

    // ✅ CALCULAR RACHA CORRECTAMENTE USANDO actionDate
    this.streak = this.calculateStreak();
  }

  // ✅ NUEVO MÉTODO: Calcula la racha basada en fechas consecutivas de acciones Activas
  private calculateStreak(): number {
    if (this.history.length === 0) return 0;

    // Ordenar por actionDate descendente (más reciente primero)
    const sortedHistory = [...this.history].sort((a, b) =>
      new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
    );

    let streak = 0;

    for (let i = 0; i < sortedHistory.length; i++) {
      const current = sortedHistory[i];

      // Si no es Active, la racha se rompe
      if (current.status !== 'Active') {
        break;
      }

      // Si es el primer elemento, iniciamos la racha
      if (i === 0) {
        streak = 1;
        continue;
      }

      const previous = sortedHistory[i - 1];
      const currentDate = new Date(current.actionDate);
      const previousDate = new Date(previous.actionDate);

      // ✅ Calcular diferencia en días entre acciones consecutivas
      const diffDays = this.getDaysDifference(currentDate, previousDate);

      // ✅ Si la diferencia es de 0 a 7 días, consideramos que la racha continúa
      // (permite flexibilidad de hasta una semana entre clases)
      if (diffDays >= 0 && diffDays <= 7) {
        streak++;
      } else {
        // ✅ Si hay más de 7 días de diferencia, la racha se rompe
        break;
      }
    }

    return streak;
  }

  // ✅ Helper: Calcula diferencia en días entre dos fechas
  private getDaysDifference(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // milisegundos en un día
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.round(diffTime / oneDay);
  }


  private buildPieChart() {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chart) this.chart.destroy();

    const clases = [...new Set(this.history.map(h => h.className))];
    const counts = clases.map(c =>
      this.history.filter(h => h.className === c && h.status === 'Active').length
    );

    const colors = [
      'rgba(74, 222, 128, 0.8)',
      'rgba(250, 204, 21, 0.8)',
      'rgba(96, 165, 250, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(192, 132, 252, 0.8)',
      'rgba(248, 113, 113, 0.8)',
    ];

    this.chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: clases,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderColor: '#1e293b',
          borderWidth: 2,
          hoverOffset: 16
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.2,
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#1e293b',
              font: { size: 13 },
              padding: 20,
              usePointStyle: true,
              pointStyleWidth: 10
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = counts.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((ctx.raw as number / total) * 100) : 0;
                return ` ${ctx.label}: ${ctx.raw} clases (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }
}