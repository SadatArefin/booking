import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Authentication } from '../../services/authentication/authentication';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authServiceMock: jasmine.SpyObj<Authentication>;
    let router: Router;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('Authentication', ['signUp', 'storeUser']);

        await TestBed.configureTestingModule({
            imports: [FormsModule, RouterTestingModule, CommonModule],
            declarations: [],
            providers: [
                { provide: Authentication, useValue: authSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        authServiceMock = TestBed.inject(Authentication) as jasmine.SpyObj<Authentication>;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onSubmit', () => {
        it('should show error if email or password is empty', () => {
            // Arrange
            component.email = '';
            component.password = 'password123';

            // Act
            component.onSubmit();

            // Assert
            expect(component.errorMessage).toBe('Email and password are required.');
            expect(authServiceMock.signUp).not.toHaveBeenCalled();
        });

        it('should show error if password is less than 6 characters', () => {
            // Arrange
            component.email = 'test@example.com';
            component.password = '12345';

            // Act
            component.onSubmit();

            // Assert
            expect(component.errorMessage).toBe('Password must be at least 6 characters long.');
            expect(authServiceMock.signUp).not.toHaveBeenCalled();
        });

        it('should call authentication service signUp with correct credentials', () => {
            // Arrange
            component.email = 'test@example.com';
            component.password = 'password123';
            const userCredential = { user: { email: 'test@example.com' } };
            authServiceMock.signUp.and.returnValue(of(userCredential));
            spyOn(router, 'navigate');

            // Act
            component.onSubmit();

            // Assert
            expect(authServiceMock.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(authServiceMock.storeUser).toHaveBeenCalledWith(userCredential.user);
            expect(router.navigate).toHaveBeenCalledWith(['/']);
        });

        it('should display error message when registration fails', () => {
            // Arrange
            component.email = 'test@example.com';
            component.password = 'password123';
            const error = { message: 'Email already in use' };
            authServiceMock.signUp.and.returnValue(throwError(() => error));

            // Act
            component.onSubmit();

            // Assert
            expect(authServiceMock.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(component.errorMessage).toBe('Email already in use');
        });
    });
});