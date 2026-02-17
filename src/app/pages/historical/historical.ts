import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
export default class HistoricalComponent implements OnInit, AfterViewInit {

  @ViewChild('historyChart') chartRef!: ElementRef;
  chart: any;
  dataReady = false;

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
      this.dataReady = true;
      this.tryBuildChart();

    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  }

  ngAfterViewInit() {
    this.tryBuildChart();
  }

  private tryBuildChart() {
    if (!this.dataReady || !this.chartRef) return;
    if (this.chart) return;
    this.buildChart();
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

  
    private buildChart() {
  const canvas = document.getElementById('historyChart') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas no encontrado');
    return;
  }

  if (this.chart) {
    this.chart.destroy();
  }

  const clases = [...new Set(this.history.map(h => h.className))];
  const activas = clases.map(c =>
    this.history.filter(h => h.className === c && h.status === 'Active').length
  );
  const canceladas = clases.map(c =>
    this.history.filter(h => h.className === c && h.status === 'Cancelled').length
  );

  this.chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: clases,
      datasets: [
        {
          label: 'Asistidas',
          data: activas,
          backgroundColor: 'rgba(74, 222, 128, 0.6)',
          borderColor: 'rgb(74, 222, 128)',
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'Canceladas',
          data: canceladas,
          backgroundColor: 'rgba(248, 113, 113, 0.6)',
          borderColor: 'rgb(248, 113, 113)',
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#1e293b', font: { size: 13 } }
        }
      },
      scales: {
        x: {
          ticks: { color: '#1e293b' },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          ticks: { color: '#1e293b', stepSize: 1 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });
}
}