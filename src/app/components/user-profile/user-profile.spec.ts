import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfile } from './user-profile';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { User } from '../../services/user/user';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('UserProfile', () => {
  let component: UserProfile;
  let fixture: ComponentFixture<UserProfile>;
  let userServiceMock: jasmine.SpyObj<User>;

  beforeEach(async () => {
    const userSpy = jasmine.createSpyObj('User', ['getCurrentUser', 'updateDisplayName', 'updatePassword', 'reauthenticateUser']);

    // Mock successful user data response
    userSpy.getCurrentUser.and.returnValue(of({
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      uid: 'test-uid',
      phoneNumber: null,
      photoURL: null,
      tenantId: null,
      refreshToken: '',
      providerId: '',
      delete: () => Promise.resolve(),
      getIdToken: () => Promise.resolve(''),
      getIdTokenResult: () => Promise.resolve({} as any),
      reload: () => Promise.resolve(),
      toJSON: () => ({})
    }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule],
      declarations: [],
      providers: [
        FormBuilder,
        { provide: User, useValue: userSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfile);
    component = fixture.componentInstance;
    userServiceMock = TestBed.inject(User) as jasmine.SpyObj<User>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize forms and load user data', () => {
      // Spy on component methods
      spyOn(component, 'initForms');
      spyOn(component, 'loadUserData');

      // Call ngOnInit again
      component.ngOnInit();

      // Verify method calls
      expect(component.initForms).toHaveBeenCalled();
      expect(component.loadUserData).toHaveBeenCalled();
    });
  });

  describe('loadUserData', () => {
    it('should set user data from service response', () => {
      // Reset properties
      component.userEmail = null;
      component.displayName = null;

      // Mock service response
      userServiceMock.getCurrentUser.and.returnValue(of({
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        uid: 'test-uid',
        phoneNumber: null,
        photoURL: null,
        tenantId: null,
        refreshToken: '',
        providerId: '',
        delete: () => Promise.resolve(),
        getIdToken: () => Promise.resolve(''),
        getIdTokenResult: () => Promise.resolve({} as any),
        reload: () => Promise.resolve(),
        toJSON: () => ({})
      }));

      // Call method
      component.loadUserData();

      // Verify data was set
      expect(component.userEmail).toBe('test@example.com' as any);
      expect(component.displayName).toBe('Test User' as any);
      expect(component.profileForm.get('displayName')?.value).toBe('Test User');
    });
  });

  describe('updateProfile', () => {
    it('should call userService.updateDisplayName with form value', () => {
      // Setup form
      component.profileForm.setValue({ displayName: 'New Name' });
      userServiceMock.updateDisplayName.and.returnValue(of(undefined));

      // Call method
      component.updateProfile();

      // Verify service call
      expect(userServiceMock.updateDisplayName).toHaveBeenCalledWith('New Name');
      expect(component.success).toContain('Profile updated');
    });

    it('should handle error when update fails', () => {
      // Setup form
      component.profileForm.setValue({ displayName: 'New Name' });
      userServiceMock.updateDisplayName.and.returnValue(throwError(() => new Error('Update failed')));      // Call method
      component.updateProfile();

      // Verify error handling
      expect(component.error).toContain('Update failed');
    });
  });

  describe('updatePassword', () => {
    it('should call reauthenticateUser and updatePassword when passwords match', () => {
      // Set up the component
      if (!component.passwordForm) {
        component.initForms();
      }

      // Setup form values
      component.passwordForm.setValue({
        currentPassword: 'currentPass',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123'
      });

      // Mock service responses
      userServiceMock.reauthenticateUser.and.returnValue(of({}));
      userServiceMock.updatePassword.and.returnValue(of(undefined));

      // Call method
      component.updatePassword();

      // Verify service calls
      expect(userServiceMock.reauthenticateUser).toHaveBeenCalledWith('currentPass');
      expect(userServiceMock.updatePassword).toHaveBeenCalledWith('newPass123');
      expect(component.success).toContain('Password updated');
    });

    it('should handle error when password update fails', () => {
      // Set up the component
      if (!component.passwordForm) {
        component.initForms();
      }

      // Setup form values
      component.passwordForm.setValue({
        currentPassword: 'currentPass',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123'
      });

      // Mock service responses - simulate reauthentication success but password update failure
      userServiceMock.reauthenticateUser.and.returnValue(of({}));
      userServiceMock.updatePassword.and.returnValue(throwError(() => new Error('Password update failed')));

      // Call method
      component.updatePassword();

      // Verify error handling
      expect(component.error).toContain('Password update failed');
      expect(component.success).toBeNull();
    });

    it('should handle error when reauthentication fails', () => {
      // Set up the component
      if (!component.passwordForm) {
        component.initForms();
      }

      // Setup form values
      component.passwordForm.setValue({
        currentPassword: 'currentPass',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123'
      });

      // Mock service responses - simulate reauthentication failure
      userServiceMock.reauthenticateUser.and.returnValue(throwError(() => new Error('Invalid credentials')));

      // Call method
      component.updatePassword();

      // Verify error handling
      expect(component.error).toContain('Invalid credentials');
      expect(component.success).toBeNull();
      // Password update should not be called if reauthentication fails
      expect(userServiceMock.updatePassword).not.toHaveBeenCalled();
    });
  });
});
