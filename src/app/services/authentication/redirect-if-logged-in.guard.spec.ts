import { TestBed } from '@angular/core/testing';
import { redirectIfLoggedInGuard } from './redirect-if-logged-in.guard';
import { Authentication } from './authentication';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// Define a type guard function to check if a value is an Observable
function isObservable<T>(value: any): value is Observable<T> {
    return value && typeof value.subscribe === 'function';
}

describe('redirectIfLoggedInGuard', () => {
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

    it('should redirect to home page when user is logged in', (done) => {
        // Setup user$ to return a user (logged in)
        const mockUser = { email: 'test@example.com' };
        Object.defineProperty(authServiceMock, 'user$', { get: () => of(mockUser) });

        // Mock route and state
        const routeSnapshot = {} as ActivatedRouteSnapshot;
        const stateSnapshot = {} as RouterStateSnapshot;

        // Call guard
        const result = redirectIfLoggedInGuard(routeSnapshot, stateSnapshot);

        if (isObservable(result)) {
            result.subscribe((guardResult) => {
                // Either expect false or expect it to be a UrlTree
                if (typeof guardResult === 'boolean') {
                    expect(guardResult).toBe(false);
                } else {
                    // It's a UrlTree, so we can assume redirection happened
                    expect(guardResult instanceof UrlTree).toBe(true);
                }
                expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
                done();
            });
        } else {
            // Handle synchronous result
            if (typeof result === 'boolean') {
                expect(result).toBe(false);
            } else {
                expect(result instanceof UrlTree).toBe(true);
            }
            expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
            done();
        }
    });

    it('should allow activation when user is not logged in', (done) => {
        // Setup user$ to return null (not logged in)
        Object.defineProperty(authServiceMock, 'user$', { get: () => of(null) });

        // Mock route and state
        const routeSnapshot = {} as ActivatedRouteSnapshot;
        const stateSnapshot = {} as RouterStateSnapshot;

        // Call guard
        const result = redirectIfLoggedInGuard(routeSnapshot, stateSnapshot);

        if (isObservable(result)) {
            result.subscribe((guardResult) => {
                if (typeof guardResult === 'boolean') {
                    expect(guardResult).toBe(true);
                } else {
                    // This case should not occur for this test
                    fail('Expected boolean result, got UrlTree');
                }
                expect(routerMock.navigate).not.toHaveBeenCalled();
                done();
            });
        } else {
            if (typeof result === 'boolean') {
                expect(result).toBe(true);
            } else {
                fail('Expected boolean result, got UrlTree');
            }
            expect(routerMock.navigate).not.toHaveBeenCalled();
            done();
        }
    });
});