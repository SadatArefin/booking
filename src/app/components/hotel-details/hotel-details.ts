import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  amenities: string[];
  description: string;
  image: string;
  availableDates: string[];
}

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hotel-details.html'
})
export class HotelDetails implements OnInit {
  hotel = signal<Hotel | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentImageIndex = signal<number>(0);
  // Mock multiple images for carousel (in a real app, you'd have multiple images in your data)
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
        this.fetchHotelDetails(id);
      } else {
        this.error.set('No hotel ID provided');
        this.loading.set(false);
      }
    });
  }
  fetchHotelDetails(id: string): void {
    this.loading.set(true);
    this.http.get<Hotel[]>('/assets/data/hotels.json')
      .subscribe({
        next: (hotels) => {
          const hotel = hotels.find(h => h.id === parseInt(id));
          if (hotel) {
            this.hotel.set(hotel);
            // Generate mock additional images with different shades for carousel
            this.generateMockImages(hotel.image);
          } else {
            this.error.set('Hotel not found');
          }
          this.loading.set(false);
        }, error: (err) => {
          const errorMessage = err.status === 404 ?
            'Hotel data file not found. Please make sure assets/data/hotels.json exists and is properly configured.' :
            'Failed to load hotel details';

          this.error.set(errorMessage);
          this.loading.set(false);
          console.error('Error fetching hotel details:', err);
        }
      });
  }

  generateMockImages(baseImage: string): void {
    // Create mock variations of the main image for the carousel
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
    if (this.hotel()) {
      this.router.navigate(['/booking-form'], {
        queryParams: { id: this.hotel()!.id, type: 'hotel' }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
