import type { Customer } from './types';

export const mockCustomers: Customer[] = [
  {
    id: 'C001',
    name: 'John Smith',
    address: '123 Oak Avenue, Springfield',
    lat: 40.7128,
    lng: -74.0060,
    notes: 'Customer has a dog named Buddy. Make sure to close the gate.',
    serviceRequested: 'Weekly Mowing & Edging',
  },
  {
    id: 'C002',
    name: 'Maria Garcia',
    address: '456 Maple Drive, Rivertown',
    lat: 40.7228,
    lng: -74.0160,
    notes: 'Sprinkler system runs on Wednesdays at 6 AM. Back lawn is sloped.',
    serviceRequested: 'Fertilization & Weed Control',
  },
  {
    id: 'C003',
    name: 'David Johnson',
    address: '789 Pine Street, Lakeside',
    lat: 40.7188,
    lng: -73.9960,
    notes: 'Wants a quote for landscaping the flower beds next visit.',
    serviceRequested: 'Spring Cleanup & Mulching',
  },
  {
    id: 'C004',
    name: 'Sarah Wilson',
    address: '101 Birch Road, Hilltop',
    lat: 40.7308,
    lng: -74.0010,
    notes: 'Access key for the back gate is under the green pot.',
    serviceRequested: 'Weekly Mowing & Edging',
  },
];
