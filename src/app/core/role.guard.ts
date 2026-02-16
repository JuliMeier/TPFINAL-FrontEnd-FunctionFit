import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServicesService } from '../services/services.service';

export type Role = 'Socio' | 'Administrador' | 'SuperAdministrador';

export const roleGuard = (...allowedRoles: Role[]): CanActivateFn => {
    return () => {
        const svc = inject(ServicesService);
        const router = inject(Router);
        const user = svc._currentUser();

        if (user && allowedRoles.includes(user.role)) {
            return true;
        }

        alert(`Acceso denegado. Requiere rol: ${allowedRoles.join(', ')}`);
        router.navigate(['/']);
        return false;
    };
};