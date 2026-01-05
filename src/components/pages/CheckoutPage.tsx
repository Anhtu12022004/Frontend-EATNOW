import { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Banknote, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { CartItem } from '../../types';
import { branches } from '../../data/mockData';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CheckoutPageProps {
  items: CartItem[];
  onBack: () => void;
  onConfirm: (data: { branchId: string; paymentMethod: string; notes: string }) => void;
}

export function CheckoutPage({ items, onBack, onConfirm }: CheckoutPageProps) {
  const [branchId, setBranchId] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [notes, setNotes] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      onConfirm({ branchId, paymentMethod, notes });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <h1 style={{ fontSize: '28px' }} className="mb-8">Thanh toán</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Branch Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Chọn chi nhánh nhận hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} - {branch.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="momo" id="momo" />
                    <Label htmlFor="momo" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <div>Ví MoMo</div>
                        <div className="text-sm text-muted-foreground">Thanh toán qua ví điện tử</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div>Thẻ tín dụng/ghi nợ</div>
                        <div className="text-sm text-muted-foreground">Visa, Mastercard, JCB</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div>Tiền mặt</div>
                        <div className="text-sm text-muted-foreground">Thanh toán khi nhận hàng</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ghi chú đặc biệt cho đơn hàng (ví dụ: ít đá, nhiều đường...)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm line-clamp-1">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} x {formatPrice(item.price)}
                        </div>
                        <div className="text-sm" style={{ fontWeight: 600 }}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí dịch vụ</span>
                    <span>0 ₫</span>
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
                  onClick={handleConfirm}
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2 animate-pulse" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận đặt món'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
