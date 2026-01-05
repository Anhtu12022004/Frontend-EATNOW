import { useState } from 'react';
import { Star, Upload, X } from 'lucide-react';
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
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { Rating, Order, MenuItem } from '../../types';

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  type: 'dish' | 'branch';
  dish?: MenuItem;
  onSubmit: (rating: Omit<Rating, 'id' | 'createdAt' | 'status'>) => void;
}

export function RatingDialog({ open, onClose, order, type, dish, onSubmit }: RatingDialogProps) {
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleStarClick = (star: 1 | 2 | 3 | 4 | 5) => {
    setStars(star);
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      if (images.length >= 3) {
        toast.error('Tối đa 3 hình ảnh');
        return;
      }
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!order) {
      toast.error('Thông tin đơn hàng không hợp lệ');
      return;
    }

    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét của bạn');
      return;
    }

    const rating: Omit<Rating, 'id' | 'createdAt' | 'status'> = {
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      branchId: order.branchId,
      branchName: order.branchName,
      type,
      stars,
      comment: comment.trim(),
      images: images.length > 0 ? images : undefined,
      ...(type === 'dish' && dish && {
        dishId: dish.id,
        dishName: dish.name,
      }),
    };

    onSubmit(rating);
    handleClose();
  };

  const handleClose = () => {
    setStars(5);
    setHoveredStar(null);
    setComment('');
    setImageUrl('');
    setImages([]);
    onClose();
  };

  const getStarText = (star: number) => {
    const texts = ['Rất tệ', 'Tệ', 'Trung bình', 'Tốt', 'Xuất sắc'];
    return texts[star - 1];
  };

  if (!order) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'dish' ? `Đánh giá món: ${dish?.name}` : `Đánh giá chi nhánh: ${order.branchName}`}
          </DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện chất lượng dịch vụ
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
                    onClick={() => handleStarClick(star as 1 | 2 | 3 | 4 | 5)}
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
              placeholder={
                type === 'dish'
                  ? 'Món ăn như thế nào? Hương vị, phần ăn, cách trình bày...'
                  : 'Dịch vụ, không gian, thái độ nhân viên...'
              }
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Thêm hình ảnh (tùy chọn)</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                placeholder="Nhập URL hình ảnh"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddImage}
                disabled={!imageUrl.trim() || images.length >= 3}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tối đa 3 hình ảnh. Nhập URL và nhấn Enter hoặc nút Upload.
            </p>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            Gửi đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
