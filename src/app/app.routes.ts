import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService } from './services/services.service';

const authGuard = () => {
    const servicesService = inject(ServicesService);
    const router = inject(Router);
    if (servicesService.isAuthenticated()) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};

const redirectIfLoggedIn = () => {
    const servicesService = inject(ServicesService);
    const router = inject(Router);
    if (servicesService.isAuthenticated()) {
        router.navigate(['/']);
        return false;
    }
    return true;
};

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component'),
        canActivate: [redirectIfLoggedIn]
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./shared/components/layout/layout.component'),
        children: [
            { path: '', loadComponent: () => import('./pages/home/home.component') },
            { path: 'page-1', loadComponent: () => import('./pages/page-1/page-1.component') },
            { path: 'page-2', loadComponent: () => import('./pages/page-2/page-2.component') },
            { path: 'page-3', loadComponent: () => import('./pages/page-3/page-3.component') },
            { path: 'home', redirectTo: '', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '' }
];