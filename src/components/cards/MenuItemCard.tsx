import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MenuItem } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden relative">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.bestSeller && (
          <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600">
            Best Seller
          </Badge>
        )}
        {item.isNew && (
          <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
            New
          </Badge>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Hết hàng</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <h4 className="line-clamp-1">{item.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {item.description}
          </p>
        </div>
        
        <div>
          <span className="text-primary" style={{ fontWeight: 600 }}>
            {formatPrice(item.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
