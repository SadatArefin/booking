import { Injectable, inject } from '@angular/core';
import { Auth, updatePassword, updateProfile, User as FirebaseUser } from '@angular/fire/auth';
import { from, Observable, of } from 'rxjs';
import { Authentication } from '../authentication/authentication';

@Injectable({
  providedIn: 'root'
})
export class User {
  private auth: Auth = inject(Auth);
  private authService = inject(Authentication);

  constructor() { }

  // Get current user from Firebase Auth
  getCurrentUser(): Observable<FirebaseUser | null> {
    return this.authService.user$;
  }

  // Update user display name
  updateDisplayName(displayName: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of(undefined);

    return from(updateProfile(user, { displayName }));
  }

  // Update user password
  updatePassword(newPassword: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of(undefined);

    return from(updatePassword(user, newPassword));
  }

  // Reauthenticate user (required for sensitive operations like password change)
  reauthenticateUser(currentPassword: string): Observable<any> {
    const user = this.auth.currentUser;
    if (!user || !user.email) return of(null);

    return this.authService.signIn(user.email, currentPassword);
  }
}
