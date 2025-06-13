export interface Hotel {
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

export interface Flight {
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

export interface Restaurant {
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

export interface SearchFilters {
    type: 'hotel' | 'flight' | 'restaurant';
    location?: string;
    startDate?: string;
    endDate?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
}

export type SearchResult = Hotel | Flight | Restaurant;
