import { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { OrderItemInfo } from '../../services/customer';

interface DishRatingDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  dish: OrderItemInfo | null;
  onSubmit: (data: { rating: number; comment: string; orderId: string; branchDishId: string }) => void;
}

export function DishRatingDialog({ open, onClose, orderId, dish, onSubmit }: DishRatingDialogProps) {
  const [stars, setStars] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (star: number) => {
    setStars(star);
  };

  const handleSubmit = async () => {
    if (!dish) {
      toast.error('Thông tin món ăn không hợp lệ');
      return;
    }

    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét của bạn');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating: stars,
        comment: comment.trim(),
        orderId: orderId,
        branchDishId: dish.branchDishId
      });
      handleClose();
    } catch (error) {
      // Error is handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStars(5);
    setHoveredStar(null);
    setComment('');
    onClose();
  };

  const getStarText = (star: number) => {
    const texts = ['Rất tệ', 'Tệ', 'Trung bình', 'Tốt', 'Xuất sắc'];
    return texts[star - 1];
  };

  if (!dish) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Đánh giá món: {dish.name}
          </DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn về món ăn này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label>Đánh giá của bạn</Label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredStar ?? stars)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {getStarText(hoveredStar ?? stars)}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét chi tiết</Label>
            <Textarea
              id="comment"
              placeholder="Món ăn như thế nào? Hương vị, phần ăn, cách trình bày..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
