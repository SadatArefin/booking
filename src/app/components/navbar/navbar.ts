import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Authentication } from '../../services/authentication/authentication';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  private authService = inject(Authentication);
  private router = inject(Router);
  user$: Observable<User | null> = this.authService.user$;

  logout() {
    this.authService.logout().subscribe(() => {
      this.authService.removeUser();
      this.router.navigate(['/sign-in']);
    });
  }
}
