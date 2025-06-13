import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Restaurant {
  id: number;
  name: string;
  location: string;
  cuisine: string;
  price: string;
  rating: number;
  features: string[];
  description: string;
  image: string;
  availableDates: string[];
}

@Component({
  selector: 'app-restaurent-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurent-details.html'
})
export class RestaurentDetails implements OnInit {
  restaurant = signal<Restaurant | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentImageIndex = signal<number>(0);
  // Mock multiple images for carousel
  mockAdditionalImages: string[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.fetchRestaurantDetails(id);
      } else {
        this.error.set('No restaurant ID provided');
        this.loading.set(false);
      }
    });
  }
  fetchRestaurantDetails(id: string): void {
    this.loading.set(true);
    this.http.get<Restaurant[]>('assets/data/restaurants.json')
      .subscribe({
        next: (restaurants) => {
          const restaurant = restaurants.find(r => r.id === parseInt(id));
          if (restaurant) {
            this.restaurant.set(restaurant);
            // Generate mock additional images for carousel
            this.generateMockImages(restaurant.image);
          } else {
            this.error.set('Restaurant not found');
          }
          this.loading.set(false);
        }, error: (err) => {
          const errorMessage = err.status === 404 ?
            'Restaurant data file not found. Please make sure assets/data/restaurants.json exists and is properly configured.' :
            'Failed to load restaurant details';

          this.error.set(errorMessage);
          this.loading.set(false);
          console.error('Error fetching restaurant details:', err);
        }
      });
  }

  generateMockImages(baseImage: string): void {
    // Create mock variations of the main image for carousel
    const colors = ['417D47', '2E5C3E', '5A8050', '3C644E'];
    this.mockAdditionalImages = [baseImage];

    for (let i = 0; i < 3; i++) {
      const newImage = baseImage.replace(/\/([0-9A-F]{6})\//, `/${colors[i]}/`);
      this.mockAdditionalImages.push(newImage);
    }
  }

  prevImage(): void {
    if (this.currentImageIndex() === 0) {
      this.currentImageIndex.set(this.mockAdditionalImages.length - 1);
    } else {
      this.currentImageIndex.update(val => val - 1);
    }
  }

  nextImage(): void {
    if (this.currentImageIndex() === this.mockAdditionalImages.length - 1) {
      this.currentImageIndex.set(0);
    } else {
      this.currentImageIndex.update(val => val + 1);
    }
  }

  bookNow(): void {
    console.log('Booking restaurant:', this.restaurant());
    // Implement booking logic or navigation to booking page
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
