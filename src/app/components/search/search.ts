import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SearchService } from '../../services/search/search.service';
import { SearchFilters, SearchResult, Hotel, Flight, Restaurant } from '../../models/search.model';

@Component({
  selector: 'app-search',
  standalone: true, imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './search.html',
  providers: [SearchService]
})
export class Search implements OnInit {
  searchForm!: FormGroup;
  searchType = signal<'hotel' | 'flight' | 'restaurant'>('hotel');
  locations = signal<string[]>([]);
  searchResults = signal<SearchResult[]>([]);
  isLoading = signal<boolean>(false);
  showResults = signal<boolean>(false);

  // For date picker min/max
  today = new Date().toISOString().split('T')[0];
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

  // For price slider
  minPrice = signal<number>(0);
  maxPrice = signal<number>(2000);

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadLocations();

    // Set default search results when component loads
    this.performSearch();
  }

  initForm(): void {
    this.searchForm = new FormGroup({
      type: new FormControl('hotel', Validators.required),
      location: new FormControl(''),
      startDate: new FormControl(this.today),
      endDate: new FormControl(this.today),
      guests: new FormControl(2, [Validators.min(1), Validators.max(10)]),
      minPrice: new FormControl(0),
      maxPrice: new FormControl(2000)
    });

    // Listen for search type changes
    this.searchForm.get('type')?.valueChanges.subscribe(value => {
      this.searchType.set(value);
    });
  }

  loadLocations(): void {
    this.searchService.getLocations().subscribe(locations => {
      this.locations.set(locations);
    });
  }

  onSearchSubmit(): void {
    if (this.searchForm.valid) {
      this.performSearch();
    }
  }

  performSearch(): void {
    this.isLoading.set(true);
    this.showResults.set(true);

    const filters: SearchFilters = {
      type: this.searchForm.value.type,
      location: this.searchForm.value.location,
      startDate: this.searchForm.value.startDate,
      endDate: this.searchForm.value.endDate,
      guests: this.searchForm.value.guests,
      minPrice: this.searchForm.value.minPrice,
      maxPrice: this.searchForm.value.maxPrice
    };

    this.searchService.search(filters).subscribe(results => {
      this.searchResults.set(results);
      this.isLoading.set(false);
    });
  }

  // Type guard functions to safely access type-specific properties in the template
  isHotel(result: SearchResult): result is Hotel {
    return 'amenities' in result;
  }

  isFlight(result: SearchResult): result is Flight {
    return 'airline' in result;
  }

  isRestaurant(result: SearchResult): result is Restaurant {
    return 'cuisine' in result;
  }
  updatePriceRange(event: Event, type: 'min' | 'max'): void {
    const value = +(event.target as HTMLInputElement).value;
    if (type === 'min') {
      this.minPrice.set(value);
      this.searchForm.patchValue({ minPrice: value });
    } else {
      this.maxPrice.set(value);
      this.searchForm.patchValue({ maxPrice: value });
    }
  }
  viewDetails(result: SearchResult): void {
    if (this.isHotel(result)) {
      window.location.href = `/hotel/${result.id}`;
    } else if (this.isFlight(result)) {
      window.location.href = `/flight/${result.id}`;
    } else if (this.isRestaurant(result)) {
      window.location.href = `/restaurant/${result.id}`;
    }
  }
}
