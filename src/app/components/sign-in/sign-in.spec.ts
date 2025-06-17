import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignIn } from './sign-in';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Authentication } from '../../services/authentication/authentication';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('SignIn', () => {
  let component: SignIn;
  let fixture: ComponentFixture<SignIn>;
  let authServiceMock: jasmine.SpyObj<Authentication>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('Authentication', ['signIn', 'storeUser']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, CommonModule],
      declarations: [],
      providers: [
        { provide: Authentication, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignIn);
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
      expect(authServiceMock.signIn).not.toHaveBeenCalled();
    });

    it('should call authentication service signIn with correct credentials', () => {
      // Arrange
      component.email = 'test@example.com';
      component.password = 'password123';
      const userCredential = { user: { email: 'test@example.com' } };
      authServiceMock.signIn.and.returnValue(of(userCredential));
      spyOn(router, 'navigate');

      // Act
      component.onSubmit();

      // Assert
      expect(authServiceMock.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(authServiceMock.storeUser).toHaveBeenCalledWith(userCredential.user);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should display error message when authentication fails', () => {
      // Arrange
      component.email = 'test@example.com';
      component.password = 'password123';
      const error = { message: 'Invalid credentials' };
      authServiceMock.signIn.and.returnValue(throwError(() => error));

      // Act
      component.onSubmit();

      // Assert
      expect(authServiceMock.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(component.errorMessage).toBe('Invalid credentials');
    });
  });
});
