import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { CartItem } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Separator } from '../ui/separator';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function CartSheet({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartSheetProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Giỏ hàng ({items.length})
          </SheetTitle>
          <SheetDescription>
            Xem lại và quản lý các món ăn trong giỏ hàng của bạn
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="mb-2">Giỏ hàng trống</h3>
            <p className="text-sm text-muted-foreground">
              Thêm món vào giỏ hàng để tiếp tục
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-sm text-primary" style={{ fontWeight: 600 }}>
                      {formatPrice(item.price)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-8 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 ml-auto text-destructive"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span style={{ fontWeight: 600 }}>Tổng cộng</span>
                  <span className="text-primary" style={{ fontWeight: 700, fontSize: '18px' }}>
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={onCheckout}
              >
                Thanh toán
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
