import { Component, inject } from '@angular/core';
import { ServicesService } from '../../services/services.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './home-admin.html',
  styles: ``,
})
export default class HomeAdmin {
  private services = inject(ServicesService);
  user = this.services._currentUser;

  cardData = [
    {
      title: 'Gestionar Usuarios',
      text: 'Ver, editar o eliminar usuarios registrados en el sistema.',
      buttonName: 'Ir a Usuarios',
      pathname: '/admin/user-list',
      icon: 'fas fa-users'
    },
    {
      title: 'Administrar Clases',
      text: 'Administrar clases disponibles en el gimnasio.',
      buttonName: 'Ir a Clases',
      pathname: '/admin/clases',
      icon: 'fas fa-dumbbell'
    },
    {
      title: 'Gestionar Planes',
      text: 'Crear, editar o eliminar tipos de planes disponibles.',
      buttonName: 'Ir a Planes',
      pathname: '/admin/planes',
      icon: 'fas fa-file-invoice-dollar'
    },
    {
      title: 'Gestionar Pagos',
      text: 'Ver los pagos realizados y registrar pagos en efectivo.',
      buttonName: 'Ir a Pagos',
      pathname: '/admin/pagos',
      icon: 'fas fa-credit-card'
    }
  ];
}