import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Authentication } from './services/authentication/authentication';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar'; // Corrected import statement
import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class App implements OnInit {
  title = 'booking';
  private authService = inject(Authentication);

  ngOnInit(): void {
    const storedUser = this.authService.getStoredUser();
    if (storedUser) {
      console.log('User found in local storage:', storedUser);
    }
  }
}

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const router = inject(Router);
    // Optionally log error
    router.navigate(['/error']);
  }
}
