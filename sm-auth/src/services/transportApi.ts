/**
 * Transport API Integration Services
 * This file contains API integration logic for Bangladesh transport providers
 * Currently using MOCK DATA for demonstration purposes until real API keys are obtained.
 */

// API Configuration
const API_CONFIG = {
  bus: {
    brtc: {
      baseUrl: 'https://api.brtc.gov.bd/v1',
      apiKey: 'YOUR_BRTC_API_KEY_HERE'
    },
    shohagh: {
      baseUrl: 'https://api.shohaghparibahan.com/v1',
      apiKey: 'YOUR_SHOHAGH_API_KEY_HERE'
    },
    hanif: {
      baseUrl: 'https://api.hanifenterprise.com/v1',
      apiKey: 'YOUR_HANIF_API_KEY_HERE'
    }
  },
  train: {
    railway: {
      baseUrl: 'https://eticket.railway.gov.bd/api/v1',
      apiKey: 'YOUR_RAILWAY_API_KEY_HERE'
    }
  },
  flight: {
    biman: {
      baseUrl: 'https://api.bimanairlines.com/v1',
      apiKey: 'YOUR_BIMAN_API_KEY_HERE'
    },
    usBangla: {
      baseUrl: 'https://api.us-banglaairlines.com/v1',
      apiKey: 'YOUR_USBANGLA_API_KEY_HERE'
    },
    novoair: {
      baseUrl: 'https://api.flynovoair.com/v1',
      apiKey: 'YOUR_NOVOAIR_API_KEY_HERE'
    },
    // Alternative: Use flight aggregator APIs
    amadeus: {
      baseUrl: 'https://api.amadeus.com/v1',
      apiKey: 'YOUR_AMADEUS_API_KEY_HERE',
      apiSecret: 'YOUR_AMADEUS_SECRET_HERE'
    }
  }
};

// Types
export interface SearchParams {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  transportType: 'bus' | 'train' | 'flight';
  passengers: number;
  class?: string;
}

export interface Ticket {
  id: string;
  provider: string;
  providerLogo: string;
  transportType: 'bus' | 'train' | 'flight';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  class: string;
  availableSeats: number;
  amenities: string[];
  route?: string[];
  vehicleNumber?: string;
  flightNumber?: string;
  trainNumber?: string;
}

export interface BookingDetails {
  ticketId: string;
  passengers: PassengerInfo[];
  seats: string[];
  contactEmail: string;
  contactPhone: string;
}

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  nid?: string;
  passport?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  pnr: string;
  status: 'confirmed' | 'pending' | 'failed';
  tickets: ConfirmedTicket[];
  totalAmount: number;
  paymentStatus: string;
  downloadUrl: string;
}

export interface ConfirmedTicket {
  ticketNumber: string;
  passengerName: string;
  seat: string;
  class: string;
}

// Mock Data Generators
const generateMockBusTickets = (params: SearchParams): Ticket[] => [
  {
    id: 'brtc-101',
    provider: 'BRTC',
    providerLogo: 'figma:asset/brtc_logo.png', // Placeholder
    transportType: 'bus',
    from: params.from,
    to: params.to,
    departureTime: '08:00 AM',
    arrivalTime: '02:00 PM',
    duration: '6h 00m',
    price: 500,
    currency: 'BDT',
    class: 'AC Chair',
    availableSeats: 24,
    amenities: ['AC', 'Water', 'Blanket'],
    vehicleNumber: 'DHK-METRO-B-11-2233'
  },
  {
    id: 'shohagh-202',
    provider: 'Shohagh Paribahan',
    providerLogo: 'figma:asset/shohagh_logo.png', // Placeholder
    transportType: 'bus',
    from: params.from,
    to: params.to,
    departureTime: '10:30 AM',
    arrivalTime: '04:30 PM',
    duration: '6h 00m',
    price: 1200,
    currency: 'BDT',
    class: 'Business Class',
    availableSeats: 12,
    amenities: ['AC', 'Water', 'Snacks', 'WiFi'],
    vehicleNumber: 'DHK-METRO-B-14-5566'
  },
  {
    id: 'hanif-303',
    provider: 'Hanif Enterprise',
    providerLogo: 'figma:asset/hanif_logo.png', // Placeholder
    transportType: 'bus',
    from: params.from,
    to: params.to,
    departureTime: '11:45 PM',
    arrivalTime: '06:00 AM',
    duration: '6h 15m',
    price: 850,
    currency: 'BDT',
    class: 'Non-AC',
    availableSeats: 30,
    amenities: ['Water'],
    vehicleNumber: 'DHK-METRO-G-12-8899'
  }
];

const generateMockTrainTickets = (params: SearchParams): Ticket[] => [
  {
    id: 'train-701',
    provider: 'Bangladesh Railway',
    providerLogo: 'figma:asset/railway_logo.png', // Placeholder
    transportType: 'train',
    from: params.from,
    to: params.to,
    departureTime: '06:30 AM',
    arrivalTime: '12:00 PM',
    duration: '5h 30m',
    price: 345,
    currency: 'BDT',
    class: 'Shovon Chair',
    availableSeats: 45,
    amenities: ['Fan', 'Toilet'],
    trainNumber: '701 Subarna Express'
  },
  {
    id: 'train-702',
    provider: 'Bangladesh Railway',
    providerLogo: 'figma:asset/railway_logo.png', // Placeholder
    transportType: 'train',
    from: params.from,
    to: params.to,
    departureTime: '03:00 PM',
    arrivalTime: '08:45 PM',
    duration: '5h 45m',
    price: 750,
    currency: 'BDT',
    class: 'Snigdha (AC)',
    availableSeats: 18,
    amenities: ['AC', 'Toilet', 'Food Car'],
    trainNumber: '702 Sonar Bangla'
  }
];

const generateMockFlightTickets = (params: SearchParams): Ticket[] => [
  {
    id: 'biman-001',
    provider: 'Biman Bangladesh Airlines',
    providerLogo: 'figma:asset/biman_logo.png', // Placeholder
    transportType: 'flight',
    from: params.from,
    to: params.to,
    departureTime: '09:15 AM',
    arrivalTime: '10:00 AM',
    duration: '0h 45m',
    price: 3500,
    currency: 'BDT',
    class: 'Economy',
    availableSeats: 8,
    amenities: ['Snacks', 'Baggage 20kg'],
    flightNumber: 'BG-433'
  },
  {
    id: 'usbangla-002',
    provider: 'US-Bangla Airlines',
    providerLogo: 'figma:asset/usbangla_logo.png', // Placeholder
    transportType: 'flight',
    from: params.from,
    to: params.to,
    departureTime: '04:45 PM',
    arrivalTime: '05:30 PM',
    duration: '0h 45m',
    price: 3800,
    currency: 'BDT',
    class: 'Economy',
    availableSeats: 15,
    amenities: ['Snacks', 'Baggage 20kg'],
    flightNumber: 'BS-145'
  }
];

// Bus API Integration
class BusApiService {
  async searchBuses(params: SearchParams): Promise<Ticket[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock data instead of failing fetch
      return generateMockBusTickets(params);
    } catch (error) {
      console.error('Bus search error:', error);
      throw new Error('Failed to search buses. Please try again.');
    }
  }

  async bookBus(bookingDetails: BookingDetails): Promise<BookingConfirmation> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      bookingId: 'BK-' + Math.floor(Math.random() * 100000),
      pnr: 'PNR' + Math.floor(Math.random() * 10000),
      status: 'confirmed',
      tickets: bookingDetails.passengers.map((p, i) => ({
        ticketNumber: 'TKT-' + Math.floor(Math.random() * 1000000),
        passengerName: `${p.firstName} ${p.lastName}`,
        seat: bookingDetails.seats[i] || 'A1',
        class: 'Standard'
      })),
      totalAmount: 1500, // Mock amount
      paymentStatus: 'paid',
      downloadUrl: '#'
    };
  }
}

// Train API Integration
class TrainApiService {
  async searchTrains(params: SearchParams): Promise<Ticket[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateMockTrainTickets(params);
    } catch (error) {
      console.error('Train search error:', error);
      throw new Error('Failed to search trains. Please try again.');
    }
  }

  async bookTrain(bookingDetails: BookingDetails): Promise<BookingConfirmation> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      bookingId: 'TR-' + Math.floor(Math.random() * 100000),
      pnr: 'TRPNR' + Math.floor(Math.random() * 10000),
      status: 'confirmed',
      tickets: bookingDetails.passengers.map((p, i) => ({
        ticketNumber: 'TRTKT-' + Math.floor(Math.random() * 1000000),
        passengerName: `${p.firstName} ${p.lastName}`,
        seat: bookingDetails.seats[i] || 'KA-12',
        class: 'Shovon'
      })),
      totalAmount: 850,
      paymentStatus: 'paid',
      downloadUrl: '#'
    };
  }
}

// Flight API Integration
class FlightApiService {
  async searchFlights(params: SearchParams): Promise<Ticket[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateMockFlightTickets(params);
    } catch (error) {
      console.error('Flight search error:', error);
      throw new Error('Failed to search flights. Please try again.');
    }
  }

  async bookFlight(bookingDetails: BookingDetails): Promise<BookingConfirmation> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      bookingId: 'FL-' + Math.floor(Math.random() * 100000),
      pnr: 'FLPNR' + Math.floor(Math.random() * 10000),
      status: 'confirmed',
      tickets: bookingDetails.passengers.map((p, i) => ({
        ticketNumber: 'FLTKT-' + Math.floor(Math.random() * 1000000),
        passengerName: `${p.firstName} ${p.lastName}`,
        seat: bookingDetails.seats[i] || '12A',
        class: 'Economy'
      })),
      totalAmount: 5500,
      paymentStatus: 'paid',
      downloadUrl: '#'
    };
  }
}

// Export service instances
export const busApi = new BusApiService();
export const trainApi = new TrainApiService();
export const flightApi = new FlightApiService();

// Unified search function
export async function searchTransport(params: SearchParams): Promise<Ticket[]> {
  switch (params.transportType) {
    case 'bus':
      return await busApi.searchBuses(params);
    case 'train':
      return await trainApi.searchTrains(params);
    case 'flight':
      return await flightApi.searchFlights(params);
    default:
      throw new Error('Invalid transport type');
  }
}

// Unified booking function
export async function bookTransport(bookingDetails: BookingDetails): Promise<BookingConfirmation> {
  const transportType = bookingDetails.ticketId.includes('train') ? 'train' :
                       bookingDetails.ticketId.includes('biman') || 
                       bookingDetails.ticketId.includes('usbangla') || 
                       bookingDetails.ticketId.includes('novoair') ? 'flight' : 'bus';
  
  switch (transportType) {
    case 'bus':
      return await busApi.bookBus(bookingDetails);
    case 'train':
      return await trainApi.bookTrain(bookingDetails);
    case 'flight':
      return await flightApi.bookFlight(bookingDetails);
    default:
      throw new Error('Invalid transport type');
  }
}
