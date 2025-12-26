import { Component, inject } from '@angular/core';
import { ServicesService } from '../../../services/services.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styles: ``
})
export class HeaderComponent {
  private servicesService = inject(ServicesService);
  private router = inject(Router);

  user = this.servicesService._currentUser;
  pageTitle = this.servicesService._pageTitle;

  logout(): void {
    this.servicesService.logout();
    this.router.navigate(['/login']);
  }
}