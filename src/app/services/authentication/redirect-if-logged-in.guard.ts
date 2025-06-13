import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authentication } from './authentication';
import { map } from 'rxjs';

export const redirectIfLoggedInGuard: CanActivateFn = () => {
    const authService = inject(Authentication);
    const router = inject(Router);

    return authService.user$.pipe(
        map(user => {
            if (user) {
                router.navigate(['/']); // Or your desired redirect path for logged-in users
                return false;
            }
            return true;
        })
    );
};
