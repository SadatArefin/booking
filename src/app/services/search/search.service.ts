import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Hotel, Flight, Restaurant, SearchFilters, SearchResult } from '../../models/search.model';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private hotelsData: Hotel[] = [];
    private flightsData: Flight[] = [];
    private restaurantsData: Restaurant[] = [];
    private readonly dataLoaded = {
        hotels: false,
        flights: false,
        restaurants: false
    };

    constructor(private http: HttpClient) {
        this.loadInitialData();
    }

    private loadInitialData(): void {
        this.getHotels().subscribe();
        this.getFlights().subscribe();
        this.getRestaurants().subscribe();
    }

    getHotels(): Observable<Hotel[]> {
        if (this.dataLoaded.hotels) {
            return of(this.hotelsData);
        }
        return this.http.get<Hotel[]>('/assets/data/hotels.json').pipe(
            map(data => {
                this.hotelsData = data;
                this.dataLoaded.hotels = true;
                return data;
            }),
            catchError(error => {
                console.error('Error loading hotels data', error);
                return of([]);
            })
        );
    }

    getFlights(): Observable<Flight[]> {
        if (this.dataLoaded.flights) {
            return of(this.flightsData);
        }
        return this.http.get<Flight[]>('/assets/data/flights.json').pipe(
            map(data => {
                this.flightsData = data;
                this.dataLoaded.flights = true;
                return data;
            }),
            catchError(error => {
                console.error('Error loading flights data', error);
                return of([]);
            })
        );
    }

    getRestaurants(): Observable<Restaurant[]> {
        if (this.dataLoaded.restaurants) {
            return of(this.restaurantsData);
        }
        return this.http.get<Restaurant[]>('/assets/data/restaurants.json').pipe(
            map(data => {
                this.restaurantsData = data;
                this.dataLoaded.restaurants = true;
                return data;
            }),
            catchError(error => {
                console.error('Error loading restaurants data', error);
                return of([]);
            })
        );
    }

    search(filters: SearchFilters): Observable<SearchResult[]> {
        switch (filters.type) {
            case 'hotel':
                return this.getHotels().pipe(
                    map(hotels => this.filterHotels(hotels, filters))
                );
            case 'flight':
                return this.getFlights().pipe(
                    map(flights => this.filterFlights(flights, filters))
                );
            case 'restaurant':
                return this.getRestaurants().pipe(
                    map(restaurants => this.filterRestaurants(restaurants, filters))
                );
            default:
                return forkJoin([
                    this.getHotels(),
                    this.getFlights(),
                    this.getRestaurants()
                ]).pipe(
                    map(([hotels, flights, restaurants]) => {
                        const filteredHotels = this.filterHotels(hotels, filters);
                        const filteredFlights = this.filterFlights(flights, filters);
                        const filteredRestaurants = this.filterRestaurants(restaurants, filters);
                        return [...filteredHotels, ...filteredFlights, ...filteredRestaurants];
                    })
                );
        }
    }

    getLocations(): Observable<string[]> {
        return forkJoin([
            this.getHotels(),
            this.getFlights().pipe(map(flights => [...flights.map(f => f.from), ...flights.map(f => f.to)])),
            this.getRestaurants()
        ]).pipe(
            map(([hotels, flightLocations, restaurants]) => {
                const hotelLocations = hotels.map(hotel => hotel.location);
                const restaurantLocations = restaurants.map(restaurant => restaurant.location);

                // Combine all locations and remove duplicates
                return [...new Set([...hotelLocations, ...flightLocations, ...restaurantLocations])].sort();
            })
        );
    }

    private filterHotels(hotels: Hotel[], filters: SearchFilters): Hotel[] {
        return hotels.filter(hotel => {
            // Location filter
            if (filters.location && !hotel.location.includes(filters.location)) {
                return false;
            }

            // Price filter
            if (filters.minPrice !== undefined && hotel.price < filters.minPrice) {
                return false;
            }
            if (filters.maxPrice !== undefined && hotel.price > filters.maxPrice) {
                return false;
            }

            // Date filter
            if (filters.startDate) {
                const hasAvailability = hotel.availableDates.some(date =>
                    new Date(date) >= new Date(filters.startDate!)
                );
                if (!hasAvailability) return false;
            }

            return true;
        });
    }

    private filterFlights(flights: Flight[], filters: SearchFilters): Flight[] {
        return flights.filter(flight => {
            // Location filter (from or to)
            if (filters.location &&
                !flight.from.includes(filters.location) &&
                !flight.to.includes(filters.location)) {
                return false;
            }

            // Price filter
            if (filters.minPrice !== undefined && flight.price < filters.minPrice) {
                return false;
            }
            if (filters.maxPrice !== undefined && flight.price > filters.maxPrice) {
                return false;
            }

            // Date filter
            if (filters.startDate && new Date(flight.departureDate) < new Date(filters.startDate)) {
                return false;
            }

            return true;
        });
    }

    private filterRestaurants(restaurants: Restaurant[], filters: SearchFilters): Restaurant[] {
        return restaurants.filter(restaurant => {
            // Location filter
            if (filters.location && !restaurant.location.includes(filters.location)) {
                return false;
            }

            // Price filter - converting price string ($, $$, $$$) to approximate value
            const priceValue = restaurant.price.length * 50; // $ = 50, $$ = 100, $$$ = 150
            if (filters.minPrice !== undefined && priceValue < filters.minPrice) {
                return false;
            }
            if (filters.maxPrice !== undefined && priceValue > filters.maxPrice) {
                return false;
            }

            // Date filter
            if (filters.startDate) {
                const hasAvailability = restaurant.availableDates.some(date =>
                    new Date(date) >= new Date(filters.startDate!)
                );
                if (!hasAvailability) return false;
            }

            return true;
        });
    }
}
