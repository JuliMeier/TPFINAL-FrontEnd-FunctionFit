import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService } from './services/services.service';
import { roleGuard } from './core/role.guard';

const authGuard = () => {
    const servicesService = inject(ServicesService);
    const router = inject(Router);
    if (servicesService.isAuthenticated()) {
        return true;
    } else {
        router.navigate(['/home']);
        return false;
    }
};

const redirectIfLoggedIn = () => {
    const servicesService = inject(ServicesService);
    const router = inject(Router);
    if (servicesService.isAuthenticated()) {
        router.navigate(['/role-home']);
        return false;
    }
    return true;
};

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home'),
        canActivate: [redirectIfLoggedIn]
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login'),
        canActivate: [redirectIfLoggedIn]
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password'),
        canActivate: [redirectIfLoggedIn]
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./pages/reset-password/reset-password'),
        canActivate: [redirectIfLoggedIn]
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register'),
        canActivate: [redirectIfLoggedIn]
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./shared/components/layout/layout'),
        children: [
            {
                path: 'role-home',
                loadComponent: () => import('./pages/role-home-redirect/role-home-redirect')
            },
            {
                path: 'home-socio',
                loadComponent: () => import('./pages/home-socio/home-socio'),
                canActivate: [roleGuard('Socio')]
            },
            {
                path: 'home-admin',
                loadComponent: () => import('./pages/home-admin/home-admin'),
                canActivate: [roleGuard('Administrador')]
            },
            {
                path: 'home-super-admin',
                loadComponent: () => import('./pages/home-super-admin/home-super-admin'),
                canActivate: [roleGuard('SuperAdministrador')]
            },
            {
                path: 'mi-suscripcion',
                loadComponent: () => import('./pages/subscription-status/subscription-status'),
                canActivate: [roleGuard('Socio')]
            },
            {
                path: 'clases',
                loadComponent: () => import('./pages/clases/clases'),
                canActivate: [roleGuard('Socio')]
            },
            {
                path: 'historial',
                loadComponent: () => import('./pages/historical/historical'),
                canActivate: [roleGuard('Socio')]
            },
            {
                path: 'admin/user-list',
                loadComponent: () => import('./pages/admin/user-list/user-list'),
                canActivate: [roleGuard('Administrador')]
            },
            {
                path: 'pagos',
                loadComponent: () => import('./pages/pagos/pagos'),
                canActivate: [roleGuard('Socio')]
            },
            {
                path: 'admin/clases',
                loadComponent: () => import('./pages/admin/gym-class-management/gym-class-management'),
                canActivate: [roleGuard('Administrador')]
            },
            {
                path: 'admin/planes',
                loadComponent: () => import('./pages/admin/plan-management/plan-management'),
                canActivate: [roleGuard('Administrador')]
            },
            {
                path: 'admin/pagos',
                loadComponent: () => import('./pages/admin/payment-management/payment-management'),
                canActivate: [roleGuard('Administrador')]
            },
            {
                path: 'admin/metricas',
                loadComponent: () => import('./pages/admin/metricas/metricas'),
                canActivate: [roleGuard('SuperAdministrador')]
            },
        ]
    },
    { path: '**', redirectTo: 'home' }
];




