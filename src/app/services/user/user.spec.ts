import { TestBed } from '@angular/core/testing';
import { User } from './user';
import { Auth } from '@angular/fire/auth';
import { Authentication } from '../authentication/authentication';
import { of, throwError } from 'rxjs';
import * as authFunctions from '@angular/fire/auth';

describe('User', () => {
  let service: User;
  let authMock: jasmine.SpyObj<Auth>;
  let authServiceMock: jasmine.SpyObj<Authentication>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('Auth', [], {
      'currentUser': { email: 'test@example.com', displayName: 'Test User' }
    });

    const authServiceSpy = jasmine.createSpyObj('Authentication', ['signIn'], {
      'user$': of({ email: 'test@example.com', displayName: 'Test User' })
    });

    // Mock Firebase auth functions
    spyOn(authFunctions, 'updateProfile').and.returnValue(Promise.resolve() as any);
    spyOn(authFunctions, 'updatePassword').and.returnValue(Promise.resolve() as any);

    TestBed.configureTestingModule({
      providers: [
        User,
        { provide: Auth, useValue: authSpy },
        { provide: Authentication, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(User);
    authMock = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;
    authServiceMock = TestBed.inject(Authentication) as jasmine.SpyObj<Authentication>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentUser', () => {
    it('should return the user from Authentication service', () => {
      // Act
      const result = service.getCurrentUser();

      // Assert
      result.subscribe(user => {
        expect(user).toBeDefined();
        expect(user?.displayName).toBe('Test User');
      });
    });
  });

  describe('updateDisplayName', () => {
    it('should call updateProfile with correct parameters', (done) => {
      // Arrange
      const newDisplayName = 'New Name';

      // Act      service.updateDisplayName(newDisplayName).subscribe(() => {
      // Assert
      expect(authFunctions.updateProfile).toHaveBeenCalledWith(
        jasmine.any(Object),
        { displayName: newDisplayName }
      );
      done();
    });
  });

  it('should return undefined observable if no user', (done) => {
    // Arrange
    Object.defineProperty(authMock, 'currentUser', { value: null });

    // Act
    service.updateDisplayName('New Name').subscribe(result => {
      // Assert
      expect(result).toBeUndefined();
      expect(authFunctions.updateProfile).not.toHaveBeenCalled();
      done();
    });
  });

  describe('updatePassword', () => {
    it('should call updatePassword with correct parameters', (done) => {
      // Arrange
      const newPassword = 'newPassword123';

      // Act      service.updatePassword(newPassword).subscribe(() => {
      // Assert
      expect(authFunctions.updatePassword).toHaveBeenCalledWith(
        jasmine.any(Object),
        newPassword
      );
      done();
    });
  });

  describe('reauthenticateUser', () => {
    it('should call signIn with user email and password', (done) => {
      // Arrange
      const currentPassword = 'password123';
      authServiceMock.signIn.and.returnValue(of({ user: { email: 'test@example.com' } }));

      // Act
      service.reauthenticateUser(currentPassword).subscribe(() => {
        // Assert
        expect(authServiceMock.signIn).toHaveBeenCalledWith('test@example.com', currentPassword);
        done();
      });
    });
  });
});

