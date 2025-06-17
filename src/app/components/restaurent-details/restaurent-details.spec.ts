import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurentDetails } from './restaurent-details';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('RestaurentDetails', () => {
  let component: RestaurentDetails;
  let fixture: ComponentFixture<RestaurentDetails>;
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

    fixture = TestBed.createComponent(RestaurentDetails);
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
    it('should call fetchRestaurantDetails with correct ID from route params', () => {
      // Spy on component method
      spyOn(component, 'fetchRestaurantDetails');

      // Call ngOnInit
      component.ngOnInit();

      // Verify method call
      expect(component.fetchRestaurantDetails).toHaveBeenCalledWith('1');
    });
  });

  describe('fetchRestaurantDetails', () => {
    it('should fetch restaurant data and update component state', () => {
      // Setup mock response
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

      // Call method
      component.fetchRestaurantDetails('1');

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/restaurants.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush([mockRestaurant]);

      // Verify component state
      expect(component.restaurant()).toEqual(mockRestaurant);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.mockAdditionalImages.length).toBeGreaterThan(0);
    });

    it('should set error state when restaurant ID is not found', () => {
      // Setup mock response with no matching ID
      const mockRestaurants = [
        {
          id: 2,
          name: 'Different Restaurant',
          location: 'Tokyo',
          cuisine: 'Japanese',
          price: '$$',
          rating: 4.8,
          features: ['Takeout'],
          description: 'Test description',
          image: 'test-image.jpg',
          availableDates: ['2025-06-15', '2025-06-16']
        }
      ];

      // Call method
      component.fetchRestaurantDetails('1');

      // Verify HTTP request
      const req = httpMock.expectOne('/assets/data/restaurants.json');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockRestaurants);

      // Verify error state
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Restaurant not found');
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
      component.restaurant.set({
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
      });

      // Call method
      component.bookNow();

      // Verify navigation
      expect(router.navigate).toHaveBeenCalledWith(
        ['/booking-form'],
        jasmine.objectContaining({
          queryParams: {
            type: 'restaurant',
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
