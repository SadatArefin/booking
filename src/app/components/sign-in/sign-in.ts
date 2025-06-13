import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Authentication } from '../../services/authentication/authentication';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './sign-in.html'
})
export class SignIn {
  email = '';
  password = '';
  errorMessage = '';

  private authService = inject(Authentication);
  private router = inject(Router);

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }
    this.authService.signIn(this.email, this.password).subscribe({
      next: (userCredential) => {
        this.authService.storeUser(userCredential.user);
        this.router.navigate(['/']); // Navigate to home or dashboard
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Sign-in error:', error);
      }
    });
  }
}
