import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../services/user/user';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-form.html'
})
export class BookingForm implements OnInit {
  bookingForm!: FormGroup;
  itemType = signal<string>('');
  itemId = signal<number | null>(null);
  itemData = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  availableDates: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private userService: User
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.itemType.set(params['type']);
      this.itemId.set(+params['id']);
      this.loadItemData();
    });
    this.bookingForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      date: ['', Validators.required],
      guests: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
    // Autofill email from Firebase
    this.userService.getCurrentUser().subscribe(user => {
      if (user && user.email) {
        this.bookingForm.patchValue({ email: user.email });
      }
    });
  }

  loadItemData() {
    const type = this.itemType();
    const id = this.itemId();
    let url = '';
    if (type === 'hotel') url = '/assets/data/hotels.json';
    else if (type === 'restaurant') url = '/assets/data/restaurants.json';
    else if (type === 'flight') url = '/assets/data/flights.json';
    if (!url) return;
    this.loading.set(true);
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const item = data.find((x: any) => x.id === id) || null;
        this.itemData.set(item);
        this.availableDates = item?.availableDates || [];
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load details.');
        this.loading.set(false);
      }
    });
  }

  get f() { return this.bookingForm.controls; }

  onSubmit(payNow: boolean) {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    // Handle booking logic here
    alert(payNow ? 'Proceeding to payment...' : 'Booking confirmed for later!');
  }
}
