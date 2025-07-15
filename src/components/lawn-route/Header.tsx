import { Leaf } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center p-4 border-b bg-background z-10 shadow-sm">
      <Leaf className="text-primary w-6 h-6 mr-2" />
      <h1 className="text-xl font-bold text-gray-800 font-headline">
        LawnRoute
      </h1>
    </header>
  );
}
