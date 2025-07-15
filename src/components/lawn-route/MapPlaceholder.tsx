import Image from 'next/image';
import type { Customer } from '@/lib/types';

interface MapPlaceholderProps {
  customers: Customer[];
}

export function MapPlaceholder({ customers }: MapPlaceholderProps) {
  return (
    <div className="flex-grow bg-gray-200 relative w-full h-full">
      <Image
        src="https://placehold.co/1200x800.png"
        alt="Map of the day's route"
        layout="fill"
        objectFit="cover"
        className="opacity-70"
        data-ai-hint="map route"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800">Today's Route</h2>
          <p className="text-gray-600">{customers.length} stops planned</p>
        </div>
      </div>
    </div>
  );
}
