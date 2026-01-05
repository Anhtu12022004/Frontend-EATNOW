import { MapPin, Clock, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Branch } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface BranchCardProps {
  branch: Branch;
  onViewMenu?: (branchId: string) => void;
}

export function BranchCard({ branch, onViewMenu }: BranchCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[16/9] overflow-hidden">
        <ImageWithFallback
          src={branch.image}
          alt={branch.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2">{branch.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{branch.address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{branch.hours}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm">{branch.rating}</span>
            </div>
            {branch.distance && (
              <span className="text-sm text-muted-foreground">
                {branch.distance} km
              </span>
            )}
          </div>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={() => onViewMenu?.(branch.id)}
        >
          Xem menu
        </Button>
      </CardContent>
    </Card>
  );
}
