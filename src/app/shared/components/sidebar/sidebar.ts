import { Component, input, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ServicesService } from '../../../services/services.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styles: ``
})
export class Sidebar {
  name = input<string>('');
  private svc = inject(ServicesService);

  currentUser = this.svc._currentUser;

  menuItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    const items: { label: string; route: string; icon: string }[] = [];

    if (user.role === 'Socio') {
      items.push(
        { label: 'Mi Suscripción', route: '/mi-suscripcion', icon: 'fa-solid fa-id-card' },
        { label: 'Clases Disponibles', route: '/clases', icon: 'fa-dumbbell' },
        { label: 'Historial', route: '/historial', icon: 'fa-history' },
        { label: 'Pagos', route: '/pagos', icon: 'fa fa-credit-card' }
      );
    }

    if (user.role === 'Administrador') {
      items.push({ label: 'Usuarios', route: '/admin/user-list', icon: 'fa-users' });
      items.push({ label: 'Clases', route: '/admin/clases', icon: 'fa-dumbbell' });
      items.push({ label: 'Planes', route: '/admin/planes', icon: 'fa-file-invoice-dollar' });
      items.push({ label: 'Pagos', route: '/admin/pagos', icon: 'fa-credit-card' });
    }

    if (user.role === 'SuperAdministrador') {
      items.push(
        { label: 'Métricas', route: '/admin/metricas', icon: 'fa-chart-line' },
      );
    }

    return items;
  });
}