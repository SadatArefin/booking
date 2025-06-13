import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Flight {
  id: number;
  airline: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  price: number;
  duration: string;
  stops: number;
  class: string;
  image: string;
}

@Component({
  selector: 'app-flight-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './flight-details.html'
})
export class FlightDetails implements OnInit {
  flight = signal<Flight | null>(null);
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
        this.fetchFlightDetails(id);
      } else {
        this.error.set('No flight ID provided');
        this.loading.set(false);
      }
    });
  }
  fetchFlightDetails(id: string): void {
    this.loading.set(true);
    this.http.get<Flight[]>('assets/data/flights.json')
      .subscribe({
        next: (flights) => {
          const flight = flights.find(f => f.id === parseInt(id));
          if (flight) {
            this.flight.set(flight);
            // Generate mock additional images for carousel
            this.generateMockImages(flight.image);
          } else {
            this.error.set('Flight not found');
          }
          this.loading.set(false);
        }, error: (err) => {
          const errorMessage = err.status === 404 ?
            'Flight data file not found. Please make sure assets/data/flights.json exists and is properly configured.' :
            'Failed to load flight details';

          this.error.set(errorMessage);
          this.loading.set(false);
          console.error('Error fetching flight details:', err);
        }
      });
  }

  generateMockImages(baseImage: string): void {
    // Create mock variations of the main image for carousel
    const colors = ['4A7342', '3C644E', '5A8050', '2E5C3E'];
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
    console.log('Booking flight:', this.flight());
    // Implement booking logic or navigation to booking page
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
