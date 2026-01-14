import { useState, useEffect } from 'react';
import { Star, Loader2, User, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { MenuItem, Feedback } from '../../types';
import { API_BASE_URL } from '../../services/api';

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

interface DishDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem | null;
  branchDishId?: string; // ID món tại chi nhánh (nếu có)
}

// Helper function to calculate average rating
export function calculateAverageRating(feedbacks: DishFeedback[] | Feedback[]): number {
  const visibleFeedbacks = feedbacks.filter((f: any) => f.isVisible ?? f.is_visible);
  if (visibleFeedbacks.length === 0) return 0;
  
  const sum = visibleFeedbacks.reduce((acc: number, f: any) => acc + f.rating, 0);
  return Math.round((sum / visibleFeedbacks.length) * 10) / 10;
}

// Render stars component
export function RatingStars({ 
  rating, 
  size = 'md',
  showEmpty = true 
}: { 
  rating: number; 
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
}) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const starSize = sizeClasses[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  if (rating === 0 && !showEmpty) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${starSize} fill-yellow-400 text-yellow-400`} />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${starSize} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSize} text-gray-300`} />
      ))}
    </div>
  );
}

export function DishDetailDialog({ 
  open, 
  onOpenChange, 
  item, 
  branchDishId 
}: DishDetailDialogProps) {
  const [feedbacks, setFeedbacks] = useState<DishFeedback[]>([]);
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch feedbacks when dialog opens
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!open || !branchDishId) {
        setFeedbacks([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/eatnow/feedbacks/dish/${branchDishId}`,
          {
            headers: { 'accept': '*/*' }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setFeedbacks(data);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        console.error('Error fetching dish feedback:', error);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [open, branchDishId]);

  if (!item) return null;

  const visibleFeedbacks = feedbacks.filter(f => f.isVisible);
  const averageRating = calculateAverageRating(feedbacks);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-h-[80vh] my-8" style={{ maxWidth: '350px' }}>
        <ScrollArea className="max-h-[80vh]">
          {/* Fixed size image container with object-fit cover for proper cropping */}
          <div 
            className="relative w-full overflow-hidden bg-gray-100 flex-shrink-0"
            style={{ height: '200px', minHeight: '200px', maxHeight: '200px' }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
              }}
            />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {item.bestSeller && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">Best Seller</Badge>
              )}
              {item.isNew && (
                <Badge className="bg-green-500 hover:bg-green-600 text-xs">Mới</Badge>
              )}
            </div>
          </div>

          <div className="p-4">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-lg font-bold pr-6">{item.name}</DialogTitle>
            </DialogHeader>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>

          {/* Price and Rating row */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-primary">
              {formatPrice(item.price)}
            </span>
            
            {branchDishId && (
              <div className="flex items-center gap-1.5">
                <RatingStars rating={averageRating} size="sm" />
                {averageRating > 0 && (
                  <span className="text-xs font-medium text-gray-600">
                    {averageRating} ({visibleFeedbacks.length})
                  </span>
                )}
                {averageRating === 0 && (
                  <span className="text-xs text-gray-400">Chưa có đánh giá</span>
                )}
              </div>
            )}
          </div>

          {/* Category badge */}
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">{item.category}</Badge>
          </div>

          <Separator className="my-3" />

          {/* Reviews section - only show if branchDishId exists */}
          {branchDishId && (
            <div className="px-1">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                Đánh giá từ khách hàng
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : visibleFeedbacks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Star className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Món này chưa có đánh giá nào</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {visibleFeedbacks.map((feedback) => (
                    <div 
                      key={feedback.id} 
                      className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <RatingStars rating={feedback.rating} size="sm" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(feedback.createdAt)}
                        </div>
                      </div>
                      {feedback.comment && (
                        <p className="text-xs text-gray-700 ml-8">
                          {feedback.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Note for dishes without branchDishId */}
          {!branchDishId && (
            <p className="text-xs text-center text-muted-foreground py-3">
              Đánh giá chỉ hiển thị cho các món trong menu chi nhánh cụ thể
            </p>
          )}
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
