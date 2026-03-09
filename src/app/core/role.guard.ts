import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServicesService } from '../services/services.service';
import { MatDialog } from '@angular/material/dialog';
import { AccessDeniedDialog } from '../shared/components/access-denied-dialog/access-denied-dialog';

export type Role = 'Socio' | 'Administrador' | 'SuperAdministrador';

export const roleGuard = (...allowedRoles: Role[]): CanActivateFn => {
    return () => {
        const svc = inject(ServicesService);
        const router = inject(Router);
        const dialog = inject(MatDialog);
        const user = svc._currentUser();

        if (user && allowedRoles.includes(user.role)) {
            return true;
        }

        // ✅ ABRIR MODAL SIMPLIFICADO
        dialog.open(AccessDeniedDialog, {
            width: '380px',
            maxWidth: '90vw',
            disableClose: true,
            panelClass: 'ff-confirm-dialog',
            data: {
                message: 'No tenés permisos para acceder a esta sección.'
            }
        });

        // Redirigir al home según el rol del usuario
        if (user) {
            switch (user.role) {
                case 'Socio':
                    router.navigate(['/home-socio']);
                    break;
                case 'Administrador':
                    router.navigate(['/home-admin']);
                    break;
                case 'SuperAdministrador':
                    router.navigate(['/home-super-admin']);
                    break;
                default:
                    router.navigate(['/home']);
            }
        } else {
            router.navigate(['/home']);
        }

        return false;
    };
};