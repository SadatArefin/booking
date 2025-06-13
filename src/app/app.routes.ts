import { Routes } from '@angular/router';
import { SignIn } from './components/sign-in/sign-in';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './services/authentication/auth.guard';
import { redirectIfLoggedInGuard } from './services/authentication/redirect-if-logged-in.guard';
import { Home } from './components/home/home';
import { BookingForm } from './components/booking-form/booking-form';
import { UserProfile } from './components/user-profile/user-profile';
import { Search } from './components/search/search';
import { HotelDetails } from './components/hotel-details/hotel-details';
import { FlightDetails } from './components/flight-details/flight-details';
import { RestaurentDetails } from './components/restaurent-details/restaurent-details';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'sign-in', component: SignIn, canActivate: [redirectIfLoggedInGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [redirectIfLoggedInGuard] },
    { path: 'booking', component: BookingForm, canActivate: [authGuard] },
    { path: 'profile', component: UserProfile, canActivate: [authGuard] },
    { path: 'search', component: Search },
    { path: 'hotel/:id', component: HotelDetails },
    { path: 'flight/:id', component: FlightDetails },
    { path: 'restaurant/:id', component: RestaurentDetails },
];
