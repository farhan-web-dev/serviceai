import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Navigation } from "lucide-react";

export interface Provider {
  _id: string;
  name: string;
  avatar: string;
  category: string;
  location: string;
  rating: number;
  availability: boolean;
  distance: string;
}

interface ProviderCardProps {
  provider: Provider;
  onBook: (id: string) => void;
}

export function ProviderCard({ provider, onBook }: ProviderCardProps) {
  return (
    <Card className="p-4 mb-4 bg-white shadow-sm rounded-xl border border-gray-100 flex flex-col">
      <div className="flex items-center mb-3">
        <img 
          src={provider.avatar} 
          alt={provider.name} 
          className="w-14 h-14 rounded-full border border-gray-200 object-cover"
        />
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-bold text-gray-900">{provider.name}</h3>
          <p className="text-sm text-gray-500">{provider.category}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center text-yellow-500 font-semibold">
            <Star className="w-4 h-4 mr-1 fill-current" />
            {provider.rating}
          </div>
          {provider.availability ? (
            <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100 border-none">Available</Badge>
          ) : (
            <Badge className="mt-1 bg-gray-100 text-gray-800 hover:bg-gray-100 border-none">Busy</Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
        {provider.location}
        <span className="mx-2 text-gray-300">|</span>
        <Navigation className="w-4 h-4 mr-1 text-gray-400" />
        {provider.distance}
      </div>

      <Button 
        onClick={() => onBook(provider._id)}
        disabled={!provider.availability}
        className="w-full rounded-lg h-10 font-medium"
      >
        {provider.availability ? 'Book Now' : 'Currently Unavailable'}
      </Button>
    </Card>
  );
}
