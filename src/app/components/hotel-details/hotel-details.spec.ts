import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelDetails } from './hotel-details';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('HotelDetails', () => {
  let component: HotelDetails;
  let fixture: ComponentFixture<HotelDetails>;
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

    fixture = TestBed.createComponent(HotelDetails);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call fetchHotelDetails with correct ID from route params', () => {
      // Spy on component method
      spyOn(component, 'fetchHotelDetails');

      // Call ngOnInit
      component.ngOnInit();

      // Verify method call
      expect(component.fetchHotelDetails).toHaveBeenCalledWith('1');
    });
  });

  describe('fetchHotelDetails', () => {
    it('should fetch hotel data and update component state', () => {
      // Setup mock response
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

      // Call method
      component.fetchHotelDetails('1');

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/hotels.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush([mockHotel]);

      // Verify component state
      expect(component.hotel()).toEqual(mockHotel);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.mockAdditionalImages.length).toBeGreaterThan(0);
    });

    it('should set error state when hotel ID is not found', () => {
      // Setup mock response with no matching ID
      const mockHotels = [
        {
          id: 2,
          name: 'Different Hotel',
          location: 'Tokyo',
          price: 200,
          rating: 4.8,
          amenities: ['WiFi', 'Pool'],
          description: 'Test description',
          image: 'test-image.jpg',
          availableDates: ['2025-06-15', '2025-06-16']
        }
      ];

      // Call method
      component.fetchHotelDetails('1');

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/hotels.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockHotels);

      // Verify error state
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Hotel not found');
    });
  });

  describe('carousel navigation', () => {
    it('should update currentImageIndex when prevImage is called', () => {
      // Setup
      component.mockAdditionalImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      component.currentImageIndex.set(1);

      // Call method
      component.prevImage();

      // Verify index updated
      expect(component.currentImageIndex()).toBe(0);
    });

    it('should update currentImageIndex when nextImage is called', () => {
      // Setup
      component.mockAdditionalImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      component.currentImageIndex.set(1);

      // Call method
      component.nextImage();

      // Verify index updated
      expect(component.currentImageIndex()).toBe(2);
    });
  });

  describe('navigation', () => {
    it('should navigate to booking form when bookNow is called', () => {
      // Setup
      component.hotel.set({
        id: 1,
        name: 'Test Hotel',
        location: 'Singapore',
        price: 150,
        rating: 4.5,
        amenities: ['WiFi', 'Pool'],
        description: 'Test description',
        image: 'test-image.jpg',
        availableDates: ['2025-06-15', '2025-06-16']
      });

      // Call method
      component.bookNow();

      // Verify navigation
      expect(router.navigate).toHaveBeenCalledWith(
        ['/booking-form'],
        jasmine.objectContaining({
          queryParams: {
            type: 'hotel',
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
