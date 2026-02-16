import { Component, inject } from '@angular/core';
import { ServicesService } from '../../../services/services.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styles: ``
})
export class Header {
  private servicesService = inject(ServicesService);
  private router = inject(Router);

  user = this.servicesService._currentUser;

  logout(): void {
    this.servicesService.logout();
    this.router.navigate(['/home']);
  }
}