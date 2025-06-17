import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar';
import { Authentication } from '../../services/authentication/authentication';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: jasmine.SpyObj<Authentication>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('Authentication', ['logout', 'removeUser'], {
      'user$': of({ email: 'test@example.com', displayName: 'Test User' })
    });

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule],
      declarations: [],
      providers: [
        { provide: Authentication, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authServiceMock = TestBed.inject(Authentication) as jasmine.SpyObj<Authentication>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logout', () => {
    it('should call authentication service logout and navigate to sign-in page', () => {
      // Arrange
      spyOn(router, 'navigate');
      authServiceMock.logout.and.returnValue(of(undefined));

      // Act
      component.logout();

      // Assert
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(authServiceMock.removeUser).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
    });
  });

  describe('user display', () => {
    it('should bind to user$ from authentication service', () => {
      // Act & Assert - In the template, user$ is used directly, we just need to ensure it's properly assigned
      expect(component.user$).toBe(authServiceMock.user$);
    });
  });
});
