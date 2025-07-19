"use client"

import { useState } from "react"
import { PlacesAutocomplete } from "./places-autocomplete"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

export function PlacesAutocompleteDemo() {
  const [address, setAddress] = useState("")
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Address Autocomplete Demo</CardTitle>
        <CardDescription>
          Start typing an address to see Google Places suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PlacesAutocomplete
          value={address}
          onChange={setAddress}
          placeholder="Enter an address..."
          onPlaceSelect={(place) => {
            setSelectedPlace(place)
            console.log("Selected place:", place)
          }}
        />
        
        {selectedPlace && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Selected Place Details:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Address:</strong> {selectedPlace.formatted_address}</p>
              {selectedPlace.geometry?.location && (
                <>
                  <p><strong>Latitude:</strong> {selectedPlace.geometry.location.lat().toFixed(6)}</p>
                  <p><strong>Longitude:</strong> {selectedPlace.geometry.location.lng().toFixed(6)}</p>
                </>
              )}
              {selectedPlace.place_id && (
                <p><strong>Place ID:</strong> {selectedPlace.place_id}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 