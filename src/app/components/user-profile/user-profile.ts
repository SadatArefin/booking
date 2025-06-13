import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../services/user/user';
import { BehaviorSubject, Observable, catchError, finalize, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.html'
})
export class UserProfile implements OnInit {
  private userService = inject(User);
  private fb = inject(FormBuilder);

  userEmail: string | null = null;
  displayName: string | null = null;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  loading = false;
  error: string | null = null;
  success: string | null = null;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadUserData(): void {
    this.loadingSubject.next(true);

    this.userService.getCurrentUser().pipe(
      tap(user => {
        if (user) {
          this.userEmail = user.email;
          this.displayName = user.displayName;
          this.profileForm.patchValue({ displayName: user.displayName || '' });
        }
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    const { displayName } = this.profileForm.value;
    this.error = null;
    this.success = null;
    this.loadingSubject.next(true);

    this.userService.updateDisplayName(displayName).pipe(
      tap(() => {
        this.displayName = displayName;
        this.success = 'Profile updated successfully';
      }),
      catchError(err => {
        this.error = err.message || 'Failed to update profile';
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.error = null;
    this.success = null;
    this.loadingSubject.next(true);

    this.userService.reauthenticateUser(currentPassword).pipe(
      switchMap(() => this.userService.updatePassword(newPassword)),
      tap(() => {
        this.success = 'Password updated successfully';
        this.passwordForm.reset();
      }),
      catchError(err => {
        this.error = err.message || 'Failed to update password';
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }
}
