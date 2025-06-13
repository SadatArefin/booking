import { Routes } from '@angular/router';
import { SignIn } from './components/sign-in/sign-in';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './services/authentication/auth.guard';
import { redirectIfLoggedInGuard } from './services/authentication/redirect-if-logged-in.guard';
import { Home } from './components/home/home';
import { BookingForm } from './components/booking-form/booking-form';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'sign-in', component: SignIn, canActivate: [redirectIfLoggedInGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [redirectIfLoggedInGuard] },
    { path: 'booking', component: BookingForm, canActivate: [authGuard] },
];
