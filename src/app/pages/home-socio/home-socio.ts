import { Component, inject, signal } from '@angular/core';
import { ServicesService } from '../../services/services.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-socio',
  imports: [RouterModule, CommonModule],
  templateUrl: './home-socio.html',
  styles: ``
})
export default class HomeSocio {
  private servicesService = inject(ServicesService);
  user = this.servicesService._currentUser;
  enrolledClasses = signal<
    { id: number; nombre: string; dia: number; hora: string }[]
  >([]);

  constructor() {
    this.loadUserClasses();    
  }

  async loadUserClasses() {
    try {
      const data = await this.servicesService.getCurrentUserWithClasses();
      this.enrolledClasses.set(data.enrolledClasses);
    } catch (err) {
      console.error('Error al cargar clases:', err);
    }
  }

  getDayName(day: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day] ?? '';
  }

  cardData = [
    {
      title: 'Reservar clase',
      text: 'Explorá las clases disponibles y reservá tu turno en segundos.',
      buttonName: 'Ver clases',
      pathname: '/clases',
      icon: 'fas fa-dumbbell'
    },
    {
      title: 'Historial',
      text: 'Revisá tus clases pasadas y tu actividad dentro del gimnasio.',
      buttonName: 'Ver historial',
      pathname: '/historial',
      icon: 'fas fa-clock'
    },
    {
      title: 'Pago mensual',
      text: 'Gestioná el pago de tu cuota mensual de forma rápida y segura.',
      buttonName: 'Pagar ahora',
      pathname: '/pagos',
      icon: 'fas fa-credit-card'
    }
  ];




}
