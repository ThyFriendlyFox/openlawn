"use client"

import * as React from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api'
import type { Customer } from '@/lib/types'
import { Loader2, AlertTriangle, Users, MapPin } from 'lucide-react'
import { groupNearbyEmployees } from '@/lib/location-utils'

interface Crew {
  id: string;
  name: string;
  employees: Employee[];
  services: {
    serviceType: string;
    days: string[];
  }[];
  status: 'active' | 'inactive';
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  routeProgress: number; // 0-100
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'driver' | 'operator' | 'helper' | 'supervisor';
  location?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  status: 'active' | 'inactive';
}

interface ManagerMapProps {
  customers: Customer[]
  crews: Crew[]
  selectedCrew: Crew | null
  selectedCustomer: Customer | null
  onSelectCrew: (crew: Crew) => void
  onSelectCustomer: (customer: Customer) => void
  apiKey?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%',
}

const center = {
  lat: 27.6648,
  lng: -81.5158,
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }],
    },
    {
        featureType: "road",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }]
    }
  ],
}

// Crew colors for different route lines
const crewColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export function ManagerMap({ 
  customers, 
  crews, 
  selectedCrew, 
  selectedCustomer, 
  onSelectCrew, 
  onSelectCustomer, 
  apiKey 
}: ManagerMapProps) {
  
  React.useEffect(() => {
    if (!apiKey) {
      console.error("Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.");
    }
  }, [apiKey]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "",
    libraries: ['places']
  })

  React.useEffect(() => {
    if (loadError) {
      console.error("Google Maps Load Error:", loadError);
    }
  }, [loadError]);

  const [crewRoutes, setCrewRoutes] = React.useState<{
    [crewId: string]: google.maps.DirectionsResult | null
  }>({})
  
  const mapRef = React.useRef<google.maps.Map | null>(null)

  // Generate routes for each crew (mock implementation for now)
  React.useEffect(() => {
    if (!isLoaded || customers.length === 0) return;

    const directionsService = new google.maps.DirectionsService();
    
    crews.forEach((crew, index) => {
      // For now, assign customers to crews based on index
      // In a real implementation, this would be based on crew assignments and customer preferences
      const crewCustomers = customers.filter((_, customerIndex) => 
        customerIndex % crews.length === index
      );

      if (crewCustomers.length < 2) {
        setCrewRoutes(prev => ({ ...prev, [crew.id]: null }));
        return;
      }

      const origin = { lat: crewCustomers[0].lat, lng: crewCustomers[0].lng };
      const destination = {
        lat: crewCustomers[crewCustomers.length - 1].lat,
        lng: crewCustomers[crewCustomers.length - 1].lng,
      };
      const waypoints = crewCustomers.slice(1, -1).map((customer) => ({
        location: { lat: customer.lat, lng: customer.lng },
        stopover: true,
      }));

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setCrewRoutes(prev => ({ ...prev, [crew.id]: result }));
          } else {
            console.error(`Error fetching directions for crew ${crew.name}: ${status}`);
            setCrewRoutes(prev => ({ ...prev, [crew.id]: null }));
          }
        }
      );
    });
  }, [customers, crews, isLoaded]);

  if (loadError) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-destructive/10 text-destructive p-4">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-lg font-semibold">Error Loading Map</h2>
        <p className="text-center text-sm">Could not load Google Maps. Please check your API key and settings.</p>
        <p className="mt-4 text-xs text-destructive/80">Error: {loadError.message}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-200">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={mapOptions}
      onLoad={(map) => {mapRef.current = map}}
    >
      {/* Render crew routes with different colors */}
      {crews.map((crew, index) => {
        const route = crewRoutes[crew.id];
        if (!route) return null;

        return (
          <DirectionsRenderer
            key={crew.id}
            directions={route}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: crewColors[index % crewColors.length],
                strokeOpacity: 0.8,
                strokeWeight: 6,
              },
            }}
          />
        );
      })}

      {/* Customer markers */}
      {customers.map((customer) => (
        <Marker
          key={customer.id}
          position={{ lat: customer.lat, lng: customer.lng }}
          title={customer.name}
          onClick={() => onSelectCustomer(customer)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: selectedCustomer?.id === customer.id ? 10 : 7,
            fillColor: selectedCustomer?.id === customer.id ? 'hsl(var(--ring))' : 'hsl(var(--primary))',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: 'white',
          }}
        />
      ))}

      {/* Crew location markers */}
      {crews.map((crew, index) => {
        if (!crew.currentLocation) return null;

        return (
          <Marker
            key={`crew-${crew.id}`}
            position={{ lat: crew.currentLocation.lat, lng: crew.currentLocation.lng }}
            title={crew.name}
            onClick={() => onSelectCrew(crew)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: selectedCrew?.id === crew.id ? 12 : 8,
              fillColor: crewColors[index % crewColors.length],
              fillOpacity: 0.9,
              strokeWeight: 3,
              strokeColor: 'white',
            }}
          />
        );
      })}

      {/* Employee location markers with grouping */}
      {crews.map((crew, index) => {
        const activeEmployeesWithLocation = crew.employees.filter(
          emp => emp.location && emp.status === 'active'
        )
        
        if (activeEmployeesWithLocation.length === 0) return null

        const employeeGroups = groupNearbyEmployees(activeEmployeesWithLocation, 20)

        return employeeGroups.map((group, groupIndex) => {
          if (!group.centerLocation) return null

          if (group.type === 'group') {
            // Render grouped employees
            return (
              <Marker
                key={`group-${crew.id}-${groupIndex}`}
                position={group.centerLocation}
                title={`${group.employees.length} employees from ${crew.name}`}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8 + (group.employees.length * 2), // Larger circle for groups
                  fillColor: crewColors[index % crewColors.length],
                  fillOpacity: 0.8,
                  strokeWeight: 3,
                  strokeColor: 'white',
                }}
                onClick={() => {
                  // Show info window with employee names
                  const infoWindow = new google.maps.InfoWindow({
                    content: `
                      <div style="padding: 8px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 14px;">${crew.name} - ${group.employees.length} employees</h3>
                        <ul style="margin: 0; padding-left: 16px;">
                          ${group.employees.map(emp => `<li>${emp.name} (${emp.role})</li>`).join('')}
                        </ul>
                      </div>
                    `
                  })
                  infoWindow.setPosition(group.centerLocation)
                  infoWindow.open(mapRef.current)
                }}
              />
            )
          } else {
            // Render individual employee
            const employee = group.employees[0]
            return (
              <Marker
                key={`emp-${employee.id}`}
                position={group.centerLocation}
                title={`${employee.name} (${crew.name})`}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: crewColors[index % crewColors.length],
                  fillOpacity: 0.7,
                  strokeWeight: 2,
                  strokeColor: 'white',
                }}
              />
            )
          }
        })
      })}
    </GoogleMap>
  )
} 
 