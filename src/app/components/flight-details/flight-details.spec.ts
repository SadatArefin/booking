import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlightDetails } from './flight-details';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('FlightDetails', () => {
  let component: FlightDetails;
  let fixture: ComponentFixture<FlightDetails>;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CommonModule],
      declarations: [],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ id: '1' })),
          params: of({ id: '1' })
        }
      },
      { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightDetails);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Don't call detectChanges() here to prevent ngOnInit from running automatically
  });

  afterEach(() => {
    httpMock.verify();
  });
  it('should create', () => {
    fixture.detectChanges();

    // Handle the HTTP request triggered by ngOnInit
    const req = httpMock.expectOne('/assets/data/flights.json');
    req.flush([]);

    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('should call fetchFlightDetails with correct ID from route params', () => {
      // Spy on component method
      spyOn(component, 'fetchFlightDetails');

      // Call ngOnInit
      component.ngOnInit();

      // Verify method call
      expect(component.fetchFlightDetails).toHaveBeenCalledWith('1');

      // No HTTP request verification needed here since we spied on fetchFlightDetails
    });
  });

  describe('fetchFlightDetails', () => {
    it('should fetch flight data and update component state', () => {
      // Setup mock response
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

      // Call method
      component.fetchFlightDetails('1');

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/flights.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush([mockFlight]);

      // Verify component state
      expect(component.flight()).toEqual(mockFlight);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.mockAdditionalImages.length).toBeGreaterThan(0);
    });

    it('should set error state when flight ID is not found', () => {
      // Setup mock response with no matching ID
      const mockFlights = [
        {
          id: 2,
          airline: 'Different Airline',
          from: 'Tokyo',
          to: 'London',
          departureDate: '2025-06-15',
          returnDate: '2025-06-20',
          price: 900,
          duration: '12h 30m',
          stops: 1,
          class: 'Business',
          image: 'test-image.jpg'
        }
      ];

      // Call method
      component.fetchFlightDetails('1');

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/flights.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockFlights);

      // Verify error state
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Flight not found');
    });
  });
  describe('carousel navigation', () => {
    beforeEach(() => {
      // Setup without triggering HTTP requests
      component.mockAdditionalImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    });

    it('should update currentImageIndex when prevImage is called', () => {
      component.currentImageIndex.set(1);

      // Call method
      component.prevImage();

      // Verify index updated
      expect(component.currentImageIndex()).toBe(0);
    });

    it('should update currentImageIndex when nextImage is called', () => {
      component.currentImageIndex.set(1);

      // Call method
      component.nextImage();

      // Verify index updated
      expect(component.currentImageIndex()).toBe(2);
    });
  });
  describe('navigation', () => {
    beforeEach(() => {
      // Setup without triggering HTTP requests
      component.flight.set({
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
      });
    });

    it('should navigate to booking form when bookNow is called', () => {
      // Call method
      component.bookNow();

      // Verify navigation
      expect(router.navigate).toHaveBeenCalledWith(
        ['/booking-form'],
        jasmine.objectContaining({
          queryParams: {
            type: 'flight',
            id: 1
          }
        })
      );
    });

    it('should navigate back when goBack is called', () => {
      // Call method
      component.goBack();

      // Verify navigation
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
