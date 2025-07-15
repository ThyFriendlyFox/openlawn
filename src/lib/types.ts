export type Customer = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  serviceRequested: string;
};

export type Route = {
  stops: {
    customerId: string;
    customerName: string;
    address: string;
  }[];
  totalDistance: string;
  totalDuration: string;
};
