"use client"

import type { Customer } from "@/lib/types"
import { CrewCard } from "./CrewCard"

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
  role: 'driver' | 'operator' | 'helper' | 'supervisor';
  location?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  status: 'active' | 'inactive';
}

interface CrewListProps {
  crews: Crew[]
  onSelectCrew: (crew: Crew) => void
  onAddCustomer: () => void
  onEditCrew?: (crew: Crew) => void
  calculateProgress?: (crew: Crew) => number
}

export function CrewList({
  crews,
  onSelectCrew,
  onAddCustomer,
  onEditCrew,
  calculateProgress,
}: CrewListProps) {
  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm border-t h-full overflow-y-auto">
      <div className="grid grid-cols-1 gap-4">
        {crews.map((crew) => (
          <CrewCard
            key={crew.id}
            crew={crew}
            onClick={() => onSelectCrew(crew)}
            onEdit={onEditCrew}
            calculateProgress={calculateProgress}
          />
        ))}
        <CrewCard isAddCard onClick={onAddCustomer} />
      </div>
    </div>
  )
} 
 