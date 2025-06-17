import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingForm } from './booking-form';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User } from '../../services/user/user';

describe('BookingForm', () => {
  let component: BookingForm;
  let fixture: ComponentFixture<BookingForm>;
  let httpMock: HttpTestingController;
  let userServiceMock: jasmine.SpyObj<User>;

  beforeEach(async () => {
    const userSpy = jasmine.createSpyObj('User', ['getCurrentUser']);

    // Mock user data
    userSpy.getCurrentUser.and.returnValue(of({
      email: 'test@example.com',
      displayName: 'Test User'
    }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, CommonModule],
      declarations: [],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              type: 'hotel',
              id: '1'
            })
          }
        },
        { provide: User, useValue: userSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingForm);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    userServiceMock = TestBed.inject(User) as jasmine.SpyObj<User>;

    // Spy on component method to prevent actual HTTP call in init
    spyOn(component, 'loadItemData').and.callFake(() => {
      component.itemData.set({
        id: 1,
        name: 'Test Hotel',
        location: 'Singapore',
        price: 150,
        image: 'test-image.jpg',
        availableDates: ['2025-06-15', '2025-06-16']
      });
      component.loading.set(false);
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set itemType and itemId from query params', () => {
      // Verify state from ngOnInit
      expect(component.itemType()).toBe('hotel');
      expect(component.itemId()).toBe(1);
      expect(component.loadItemData).toHaveBeenCalled();
    });
  });

  describe('loadItemData', () => {
    it('should load hotel data for hotel type', () => {
      // Reset component state
      component.itemType.set('hotel');
      component.itemId.set(1);
      component.loading.set(true);
      component.error.set(null);

      // Restore original method
      (component.loadItemData as jasmine.Spy).and.callThrough();      // Call method
      component.loadItemData();

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/hotels.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      const mockHotel = {
        id: 1,
        name: 'Test Hotel',
        location: 'Singapore',
        price: 150,
        rating: 4.5,
        amenities: ['WiFi', 'Pool'],
        description: 'Test description',
        image: 'test-image.jpg',
        availableDates: ['2025-06-15', '2025-06-16']
      };
      req.flush([mockHotel]);

      // Verify component state
      expect(component.itemData()).toEqual(mockHotel);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should load flight data for flight type', () => {
      // Reset component state
      component.itemType.set('flight');
      component.itemId.set(1);
      component.loading.set(true);
      component.error.set(null);

      // Restore original method
      (component.loadItemData as jasmine.Spy).and.callThrough();      // Call method
      component.loadItemData();

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/flights.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      const mockFlight = {
        id: 1,
        airline: 'Test Airline',
        from: 'Singapore',
        to: 'Tokyo',
        departureDate: '2025-06-15',
        returnDate: '2025-06-20',
        price: 450,
        duration: '7h 30m',
        stops: 1,
        class: 'Economy',
        image: 'test-image.jpg'
      };
      req.flush([mockFlight]);

      // Verify component state
      expect(component.itemData()).toEqual(mockFlight);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should load restaurant data for restaurant type', () => {
      // Reset component state
      component.itemType.set('restaurant');
      component.itemId.set(1);
      component.loading.set(true);
      component.error.set(null);

      // Restore original method
      (component.loadItemData as jasmine.Spy).and.callThrough();

      // Call method
      component.loadItemData();

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/restaurants.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      const mockRestaurant = {
        id: 1,
        name: 'Test Restaurant',
        location: 'Singapore',
        cuisine: 'Asian Fusion',
        price: '$$$',
        rating: 4.7,
        features: ['Outdoor Seating', 'Bar'],
        description: 'Test description',
        image: 'test-image.jpg',
        availableDates: ['2025-06-15', '2025-06-16']
      };
      req.flush([mockRestaurant]);

      // Verify component state
      expect(component.itemData()).toEqual(mockRestaurant);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should handle errors when loading data fails', () => {
      // Reset component state
      component.itemType.set('hotel');
      component.itemId.set(1);
      component.loading.set(true);
      component.error.set(null);

      // Restore original method
      (component.loadItemData as jasmine.Spy).and.callThrough();

      // Call method
      component.loadItemData();

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/hotels.json');
      expect(req.request.method).toBe('GET');

      // Respond with error
      req.error(new ErrorEvent('Network error'));

      // Verify component state
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Could not load details.');
    });
  });

  describe('form functionality', () => {
    it('should have form controls with validators', () => {
      // Verify form controls exist
      expect(component.bookingForm.get('name')).toBeTruthy();
      expect(component.bookingForm.get('email')).toBeTruthy();
      expect(component.bookingForm.get('date')).toBeTruthy();
      expect(component.bookingForm.get('guests')).toBeTruthy();

      // Test invalid form
      component.bookingForm.setValue({
        name: '',
        email: 'not-an-email',
        date: '',
        guests: 0
      });

      // Check form validity
      expect(component.bookingForm.valid).toBeFalse();

      // Test valid form
      component.bookingForm.setValue({
        name: 'Test User',
        email: 'test@example.com',
        date: '2025-06-15',
        guests: 2
      });

      // Check form validity
      expect(component.bookingForm.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should not proceed if form is invalid', () => {
      // Make form invalid
      component.bookingForm.setValue({
        name: '',
        email: 'not-an-email',
        date: '',
        guests: 0
      });

      // Spy on window.alert
      spyOn(window, 'alert');

      // Call onSubmit
      component.onSubmit(true);

      // Verify alert was shown
      expect(window.alert).toHaveBeenCalled();
    });

    // Additional onSubmit tests would mock the backend call for successful submission
  });
});
