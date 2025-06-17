import { TestBed } from '@angular/core/testing';
import { Authentication } from './authentication';
import { Auth } from '@angular/fire/auth';
import * as authFunctions from '@angular/fire/auth';

describe('Authentication', () => {
  let service: Authentication;
  let authMock: jasmine.SpyObj<Auth>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('Auth', []);

    // Mock the Firebase Auth functions
    spyOn(authFunctions, 'createUserWithEmailAndPassword').and.returnValue(Promise.resolve({ user: { email: 'test@example.com' } }) as any);
    spyOn(authFunctions, 'signInWithEmailAndPassword').and.returnValue(Promise.resolve({ user: { email: 'test@example.com' } }) as any);
    spyOn(authFunctions, 'signOut').and.returnValue(Promise.resolve() as any);

    TestBed.configureTestingModule({
      providers: [
        Authentication,
        { provide: Auth, useValue: authSpy }
      ]
    });

    service = TestBed.inject(Authentication);
    authMock = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signUp', () => {
    it('should call createUserWithEmailAndPassword with correct parameters', (done) => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      // Act
      service.signUp(email, password).subscribe((result: any) => {
        // Assert
        expect(result).toBeDefined();
        expect(authFunctions.createUserWithEmailAndPassword).toHaveBeenCalledWith(authMock, email, password);
        done();
      });
    });
  });

  describe('signIn', () => {
    it('should call signInWithEmailAndPassword with correct parameters', (done) => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      // Act
      service.signIn(email, password).subscribe((result: any) => {
        // Assert
        expect(result).toBeDefined();
        expect(authFunctions.signInWithEmailAndPassword).toHaveBeenCalledWith(authMock, email, password);
        done();
      });
    });
  });

  describe('logout', () => {
    it('should call signOut with auth instance', (done) => {
      // Act
      service.logout().subscribe(() => {
        // Assert
        expect(authFunctions.signOut).toHaveBeenCalledWith(authMock);
        done();
      });
    });
  });

  describe('user storage methods', () => {
    it('should store user in localStorage', () => {
      // Arrange
      const user = { email: 'test@example.com' };
      spyOn(localStorage, 'setItem');

      // Act
      service.storeUser(user);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
    });

    it('should retrieve user from localStorage', () => {
      // Arrange
      const user = { email: 'test@example.com' };
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(user));

      // Act
      const result = service.getStoredUser();

      // Assert
      expect(result).toEqual(user);
      expect(localStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null if no user in localStorage', () => {
      // Arrange
      spyOn(localStorage, 'getItem').and.returnValue(null);

      // Act
      const result = service.getStoredUser();

      // Assert
      expect(result).toBeNull();
      expect(localStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('should remove user from localStorage', () => {
      // Arrange
      spyOn(localStorage, 'removeItem');

      // Act
      service.removeUser();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });
});

