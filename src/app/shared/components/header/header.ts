import { Component, inject } from '@angular/core';
import { ServicesService } from '../../../services/services.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './header.html',
  styles: [`
    .profile-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
    }
    .profile-icon {
      color: #e2e8f0;
      font-size: 1.25rem;
    }
    .profile-btn:hover .profile-icon {
      color: #facc15;
    }
    .profile-menu-panel {
      min-width: 240px !important;
      border-radius: 8px !important;
      overflow: hidden !important;
    }
    .profile-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      background: rgba(30, 41, 59, 0.5);
    }
    .profile-name {
      font-size: 1rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 0.25rem;
    }
    .profile-role {
      font-size: 0.875rem;
      color: #facc15;
      font-weight: 500;
    }
    .logout-btn {
      color: #ef4444 !important;
      font-size: 0.938rem !important;
      padding: 0.75rem 1.5rem !important;
    }
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1) !important;
    }
    
    ::ng-deep .mat-mdc-menu-panel.profile-menu-panel {
      background: #0f172a !important;
      border: 1px solid rgba(51, 65, 85, 0.5) !important;
      backdrop-filter: blur(10px);
    }
    ::ng-deep .mat-mdc-menu-item {
      color: #e2e8f0 !important;
      font-size: 0.938rem !important;
      padding: 0.75rem 1.5rem !important;
    }
    ::ng-deep .mat-mdc-menu-item:hover {
      background: rgba(250, 204, 21, 0.1) !important;
    }
    ::ng-deep .mat-mdc-menu-content {
      background: #0f172a !important;
      color: #e2e8f0 !important;
    }
    ::ng-deep .mat-mdc-divider {
      border-top-color: rgba(51, 65, 85, 0.5) !important;
    }
  `]
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