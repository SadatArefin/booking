import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authentication } from './authentication';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const authService = inject(Authentication);
    const router = inject(Router);

    return authService.user$.pipe(
        map(user => {
            if (user) {
                return true;
            }
            router.navigate(['/sign-in']);
            return false;
        })
    );
};
