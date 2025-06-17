import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { Authentication } from './authentication';
import { Router } from '@angular/router';
import { of, isObservable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
    let authServiceMock: jasmine.SpyObj<Authentication>;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('Authentication', [], {
            'user$': of(null)
        });
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: Authentication, useValue: authSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });

        authServiceMock = TestBed.inject(Authentication) as jasmine.SpyObj<Authentication>;
        routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should redirect to sign-in page when user is not logged in', (done) => {
        // Setup user$ to return null (not logged in)
        Object.defineProperty(authServiceMock, 'user$', { get: () => of(null) });

        // Mock route and state
        const routeSnapshot = {} as ActivatedRouteSnapshot;
        const stateSnapshot = {} as RouterStateSnapshot;

        // Call guard
        const result = authGuard(routeSnapshot, stateSnapshot);

        // Verify result
        if (isObservable(result)) {
            result.subscribe(canActivate => {
                expect(canActivate).toBe(false);
                expect(routerMock.navigate).toHaveBeenCalledWith(['/sign-in']);
                done();
            });
        } else {
            expect(result).toBe(false);
            expect(routerMock.navigate).toHaveBeenCalledWith(['/sign-in']);
            done();
        }
    });

    it('should allow activation when user is logged in', (done) => {
        // Setup user$ to return a user (logged in)
        const mockUser = { email: 'test@example.com' };
        Object.defineProperty(authServiceMock, 'user$', { get: () => of(mockUser) });

        // Mock route and state
        const routeSnapshot = {} as ActivatedRouteSnapshot;
        const stateSnapshot = {} as RouterStateSnapshot;

        // Call guard
        const result = authGuard(routeSnapshot, stateSnapshot);

        // Verify result
        if (isObservable(result)) {
            result.subscribe(canActivate => {
                expect(canActivate).toBe(true);
                expect(routerMock.navigate).not.toHaveBeenCalled();
                done();
            });
        } else {
            expect(result).toBe(true);
            expect(routerMock.navigate).not.toHaveBeenCalled();
            done();
        }
    });
});