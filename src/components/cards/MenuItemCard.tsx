import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MenuItem } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { DishDetailDialog, RatingStars, calculateAverageRating } from '../pages/DishDetailDialog';

interface DishFeedback {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  userId: string;
  orderId: string;
  branchDishId: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  branchDishId?: string; // ID món tại chi nhánh (nếu có)
  onClick?: () => void;
}

export function MenuItemCard({ item, branchDishId, onClick }: MenuItemCardProps) {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [showDetail, setShowDetail] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  // Fetch rating when component mounts (only for branch dishes)
  useEffect(() => {
    const fetchRating = async () => {
      if (!branchDishId) return;

      try {
        const response = await fetch(
          `http://localhost:5214/api/eatnow/feedbacks/dish/${branchDishId}`,
          {
            headers: { 'accept': '*/*' }
          }
        );
        
        if (response.ok) {
          const data: DishFeedback[] = await response.json();
          const rating = calculateAverageRating(data);
          setAverageRating(rating);
        }
      } catch (error) {
        console.error('Error fetching dish rating:', error);
      }
    };

    fetchRating();
  }, [branchDishId]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetail(true);
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        {/* Fixed aspect ratio image container */}
        <div className="aspect-square overflow-hidden relative bg-gray-100">
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
          
          <div className="flex items-center justify-between">
            <span className="text-primary" style={{ fontWeight: 600 }}>
              {formatPrice(item.price)}
            </span>
            
            {/* Rating display - only for branch dishes */}
            {branchDishId && (
              <div className="flex items-center gap-1">
                {averageRating > 0 ? (
                  <>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-600">
                      {averageRating}
                    </span>
                  </>
                ) : (
                  <Star className="h-3.5 w-3.5 text-gray-300" />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dish Detail Dialog */}
      <DishDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        item={item}
        branchDishId={branchDishId}
      />
    </>
  );
}
