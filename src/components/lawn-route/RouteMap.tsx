"use client"

import * as React from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api'
import type { Customer } from '@/lib/types'
import { Loader2 } from 'lucide-react'

interface RouteMapProps {
  customers: Customer[]
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer) => void
}

const containerStyle = {
  width: '100%',
  height: '100%',
}

const center = {
  lat: 40.7128,
  lng: -74.006,
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

export function RouteMap({ customers, selectedCustomer, onSelectCustomer }: RouteMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const [directionsResponse, setDirectionsResponse] =
    React.useState<google.maps.DirectionsResult | null>(null)
  
  const mapRef = React.useRef<google.maps.Map | null>(null)

  React.useEffect(() => {
    if (customers.length < 2) {
      setDirectionsResponse(null)
      return
    }

    const directionsService = new google.maps.DirectionsService()
    const origin = { lat: customers[0].lat, lng: customers[0].lng }
    const destination = {
      lat: customers[customers.length - 1].lat,
      lng: customers[customers.length - 1].lng,
    }
    const waypoints = customers.slice(1, -1).map((customer) => ({
      location: { lat: customer.lat, lng: customer.lng },
      stopover: true,
    }))

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
          setDirectionsResponse(result)
        } else {
          console.error(`error fetching directions ${result}`)
        }
      }
    )
  }, [customers])

  React.useEffect(() => {
    if (mapRef.current && customers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        customers.forEach(({ lat, lng }) => {
            bounds.extend(new google.maps.LatLng(lat, lng));
        });
        mapRef.current.fitBounds(bounds, 100);
    }
  }, [customers, directionsResponse]);


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
      {directionsResponse ? (
        <DirectionsRenderer
          directions={directionsResponse}
          options={{
            suppressMarkers: true, 
            polylineOptions: {
              strokeColor: 'hsl(var(--accent))',
              strokeOpacity: 0.8,
              strokeWeight: 6,
            },
          }}
        />
      ) : null}

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
    </GoogleMap>
  )
}
