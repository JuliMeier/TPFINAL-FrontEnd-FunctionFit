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

  constructor(private service: ServicesService) {}

  async ngOnInit() {
    try {
      const data = await this.service.getUserHistory();

      this.history = data.map(item => ({
        ...item,
        classDate: this.formatDate(item.classDate),
        actionDate: this.formatDate(item.actionDate)
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

    this.streak = 0;
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].status === 'Active') {
        this.streak++;
      } else {
        break;
      }
    }
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