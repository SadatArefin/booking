import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App, GlobalErrorHandler } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { Authentication } from './services/authentication/authentication';
import { ErrorHandler } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let authServiceMock: jasmine.SpyObj<Authentication>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('Authentication', ['getStoredUser']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, CommonModule],
      declarations: [],
      providers: [
        { provide: Authentication, useValue: authSpy }
      ]
    })
      .overrideComponent(App, {
        set: {
          imports: [RouterTestingModule, CommonModule],
          providers: [],
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    authServiceMock = TestBed.inject(Authentication) as jasmine.SpyObj<Authentication>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should check for stored user on initialization', () => {
      // Reset and setup mock
      authServiceMock.getStoredUser.calls.reset();
      authServiceMock.getStoredUser.and.returnValue({ email: 'test@example.com' });

      // Call ngOnInit
      component.ngOnInit();

      // Verify service call
      expect(authServiceMock.getStoredUser).toHaveBeenCalled();
    });

    it('should not do anything special if no user found', () => {
      // Reset and setup mock
      authServiceMock.getStoredUser.calls.reset();
      authServiceMock.getStoredUser.and.returnValue(null);

      // Call ngOnInit
      component.ngOnInit();

      // Verify service call
      expect(authServiceMock.getStoredUser).toHaveBeenCalled();
    });
  });
});

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: Router, useValue: routerSpy }
      ]
    });

    errorHandler = TestBed.inject(GlobalErrorHandler);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should navigate to error page when handling an error', () => {
    // Call handleError
    errorHandler.handleError(new Error('Test error'));

    // Verify navigation
    expect(router.navigate).toHaveBeenCalledWith(['/error']);
  });
});
