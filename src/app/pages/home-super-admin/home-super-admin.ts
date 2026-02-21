import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesService } from '../../services/services.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-super-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './home-super-admin.html',
  styles: ``
})
export default class HomeSuperAdmin {
  private services = inject(ServicesService);
  user = this.services._currentUser

  cardData = [
    {
      title: 'Métricas', 
      text: 'Visualizá estadísticas globales del gimnasio.',
      buttonName: 'Ir a Métricas',
      pathname: '/admin/metricas',  
      icon: 'fas fa-chart-line'
    },

  ];
}