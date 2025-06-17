import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Hotel, Flight, Restaurant, SearchFilters } from '../../models/search.model';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchService]
    });
    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHotels', () => {
    it('should return hotels data from HTTP GET request', () => {
      const mockHotels: Hotel[] = [
        {
          id: 1,
          name: 'Test Hotel',
          location: 'Test Location',
          price: 100,
          rating: 4.5,
          amenities: ['WiFi', 'Pool'],
          description: 'Test description',
          image: 'test-image.jpg',
          availableDates: ['2025-06-15', '2025-06-16']
        }
      ];

      service.getHotels().subscribe(hotels => {
        expect(hotels).toEqual(mockHotels);
      });

      const req = httpMock.expectOne('/assets/data/hotels.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockHotels);
    });
  });

  describe('getFlights', () => {
    it('should return flights data from HTTP GET request', () => {
      const mockFlights: Flight[] = [
        {
          id: 1,
          airline: 'Test Airline',
          from: 'Origin',
          to: 'Destination',
          departureDate: '2025-06-15',
          returnDate: '2025-06-20',
          price: 300,
          duration: '2h 30m',
          stops: 0,
          class: 'Economy',
          image: 'test-image.jpg'
        }
      ];

      service.getFlights().subscribe(flights => {
        expect(flights).toEqual(mockFlights);
      });

      const req = httpMock.expectOne('/assets/data/flights.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockFlights);
    });
  });

  describe('getRestaurants', () => {
    it('should return restaurants data from HTTP GET request', () => {
      const mockRestaurants: Restaurant[] = [
        {
          id: 1,
          name: 'Test Restaurant',
          location: 'Test Location',
          cuisine: 'Test Cuisine',
          price: '$$$',
          rating: 4.7,
          features: ['Outdoor Seating'],
          description: 'Test description',
          image: 'test-image.jpg',
          availableDates: ['2025-06-15', '2025-06-16']
        }
      ];

      service.getRestaurants().subscribe(restaurants => {
        expect(restaurants).toEqual(mockRestaurants);
      });

      const req = httpMock.expectOne('/assets/data/restaurants.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockRestaurants);
    });
  });

  describe('search', () => {
    it('should filter hotels based on search filters', () => {
      // Set up mock data
      const mockHotels: Hotel[] = [
        {
          id: 1,
          name: 'Test Hotel',
          location: 'Singapore',
          price: 100,
          rating: 4.5,
          amenities: ['WiFi', 'Pool'],
          description: 'Test description',
          image: 'test-image.jpg',
          availableDates: ['2025-06-15', '2025-06-16']
        },
        {
          id: 2,
          name: 'Expensive Hotel',
          location: 'Singapore',
          price: 500,
          rating: 5,
          amenities: ['WiFi', 'Pool', 'Spa'],
          description: 'Luxury hotel',
          image: 'luxury-image.jpg',
          availableDates: ['2025-06-15', '2025-06-16']
        }
      ];

      // Override the internal data with our mock data
      spyOn<any>(service, 'getHotels').and.returnValue(mockHotels);

      // Create search filters
      const filters: SearchFilters = {
        type: 'hotel',
        location: 'Singapore',
        minPrice: 0,
        maxPrice: 200
      };

      // Execute search
      service.search(filters).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].id).toBe(1);
        expect(results[0].price).toBe(100);
      });
    });
  });

  describe('getLocations', () => {
    it('should return unique locations from hotels, flights, and restaurants', () => {
      // Mock internal data
      const mockHotels: Hotel[] = [
        { id: 1, name: 'Hotel 1', location: 'Singapore', price: 100, rating: 4.5, amenities: [], description: '', image: '', availableDates: [] },
        { id: 2, name: 'Hotel 2', location: 'Tokyo', price: 200, rating: 4.8, amenities: [], description: '', image: '', availableDates: [] }
      ];

      const mockFlights: Flight[] = [
        { id: 1, airline: 'Airline 1', from: 'Singapore', to: 'New York', departureDate: '', returnDate: '', price: 1000, duration: '', stops: 0, class: '', image: '' },
        { id: 2, airline: 'Airline 2', from: 'Tokyo', to: 'London', departureDate: '', returnDate: '', price: 1200, duration: '', stops: 0, class: '', image: '' }
      ];

      const mockRestaurants: Restaurant[] = [
        { id: 1, name: 'Restaurant 1', location: 'Singapore', cuisine: '', price: '', rating: 4.5, features: [], description: '', image: '', availableDates: [] },
        { id: 2, name: 'Restaurant 2', location: 'Paris', cuisine: '', price: '', rating: 4.7, features: [], description: '', image: '', availableDates: [] }
      ];

      // Override the internal data properties
      Object.defineProperty(service, 'hotelsData', { value: mockHotels });
      Object.defineProperty(service, 'flightsData', { value: mockFlights });
      Object.defineProperty(service, 'restaurantsData', { value: mockRestaurants });

      // Execute getLocations
      service.getLocations().subscribe(locations => {
        expect(locations.length).toBe(4);
        expect(locations).toContain('Singapore');
        expect(locations).toContain('Tokyo');
        expect(locations).toContain('New York');
        expect(locations).toContain('Paris');
      });
    });
  });
});
