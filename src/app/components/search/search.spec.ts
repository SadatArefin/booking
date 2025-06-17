import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Search } from './search';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../../services/search/search.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SearchResult } from '../../models/search.model';

describe('Search', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;
  let searchServiceMock: jasmine.SpyObj<SearchService>;

  beforeEach(async () => {
    const searchSpy = jasmine.createSpyObj('SearchService', ['getLocations', 'search']);

    // Mock successful locations response
    searchSpy.getLocations.and.returnValue(of(['Singapore', 'Tokyo', 'New York']));

    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: 1,
        name: 'Test Hotel',
        location: 'Singapore',
        price: 150,
        rating: 4.5,
        amenities: ['WiFi', 'Pool'],
        description: 'Test description',
        image: 'test-image.jpg',
        availableDates: ['2025-06-15', '2025-06-16']
      }
    ];
    searchSpy.search.and.returnValue(of(mockResults));

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, CommonModule],
      declarations: [],
      providers: [
        { provide: SearchService, useValue: searchSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    searchServiceMock = TestBed.inject(SearchService) as jasmine.SpyObj<SearchService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form and load locations', () => {
      // Spy on component methods
      spyOn(component, 'initForm');
      spyOn(component, 'loadLocations');

      // Call ngOnInit again
      component.ngOnInit();

      // Verify method calls
      expect(component.initForm).toHaveBeenCalled();
      expect(component.loadLocations).toHaveBeenCalled();
    });
  });

  describe('loadLocations', () => {
    it('should set locations from service response', () => {
      // Reset signal
      component.locations.set([]);

      // Call method
      component.loadLocations();

      // Verify data was set
      expect(component.locations()).toEqual(['Singapore', 'Tokyo', 'New York']);
      expect(searchServiceMock.getLocations).toHaveBeenCalled();
    });
  });

  describe('onSearchSubmit', () => {
    it('should call performSearch when form is valid', () => {
      // Spy on performSearch method
      spyOn(component, 'performSearch');

      // Setup form to be valid
      component.searchForm.patchValue({
        location: 'Singapore',
        startDate: '2025-06-15',
        endDate: '2025-06-20',
        guests: 2
      });

      // Call method
      component.onSearchSubmit();

      // Verify method call
      expect(component.performSearch).toHaveBeenCalled();
    });
  });

  describe('performSearch', () => {
    it('should call searchService.search and update results', () => {
      // Setup
      const mockResults: SearchResult[] = [
        {
          id: 1,
          name: 'Test Hotel',
          location: 'Singapore',
          price: 150,
          rating: 4.5,
          amenities: ['WiFi', 'Pool'],
          description: 'Test description',
          image: 'test-image.jpg',
          availableDates: ['2025-06-15', '2025-06-16']
        }
      ];
      searchServiceMock.search.and.returnValue(of(mockResults));

      // Initialize signals
      component.isLoading.set(false);
      component.showResults.set(false);
      component.searchResults.set([]);

      // Setup form
      component.searchForm.patchValue({
        location: 'Singapore',
        startDate: '2025-06-15',
        endDate: '2025-06-20',
        guests: 2,
        minPrice: 0,
        maxPrice: 1000
      });

      // Set search type
      component.searchType.set('hotel');

      // Call method
      component.performSearch();

      // Verify service call and state updates
      expect(searchServiceMock.search).toHaveBeenCalled();
      expect(component.searchResults()).toEqual(mockResults);
      expect(component.isLoading()).toBe(false);
      expect(component.showResults()).toBe(true);
    });
  });
});
