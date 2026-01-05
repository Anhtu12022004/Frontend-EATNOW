import { CheckCircle2, MapPin, Clock, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

interface OrderConfirmationPageProps {
  orderId: string;
  onViewOrders: () => void;
  onBackToHome: () => void;
}

export function OrderConfirmationPage({ orderId, onViewOrders, onBackToHome }: OrderConfirmationPageProps) {
  return (
    <div className="min-h-screen bg-muted/30 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardContent className="pt-12 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <h1 style={{ fontSize: '28px' }} className="mb-2">
              Đặt món thành công!
            </h1>
            <p className="text-muted-foreground mb-8">
              Cảm ơn bạn đã đặt hàng. Chúng tôi đang chuẩn bị món của bạn.
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-lg mb-8">
              <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
              <span className="text-primary" style={{ fontWeight: 700, fontSize: '20px' }}>
                {orderId}
              </span>
            </div>

            <div className="space-y-4 mb-8 text-left">
              <Separator />
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>Chi nhánh nhận hàng</div>
                  <div className="text-sm text-muted-foreground">
                    EATNOW - Nguyễn Huệ
                    <br />
                    123 Nguyễn Huệ, Quận 1
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>Thời gian dự kiến</div>
                  <div className="text-sm text-muted-foreground">
                    15-20 phút
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>Phương thức thanh toán</div>
                  <div className="text-sm text-muted-foreground">
                    Ví MoMo
                  </div>
                </div>
              </div>

              <Separator />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={onViewOrders}
              >
                Xem đơn hàng của tôi
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onBackToHome}
              >
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="mb-4">Tiến trình đơn hàng</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>Đơn hàng đã được xác nhận</div>
                  <div className="text-xs text-muted-foreground">Vừa xong</div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-50">
                <div className="h-10 w-10 rounded-full border-2 border-dashed flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>Đang chuẩn bị</div>
                  <div className="text-xs text-muted-foreground">Chờ xử lý</div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-50">
                <div className="h-10 w-10 rounded-full border-2 border-dashed flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>Sẵn sàng</div>
                  <div className="text-xs text-muted-foreground">Chờ xử lý</div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-50">
                <div className="h-10 w-10 rounded-full border-2 border-dashed flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>Hoàn thành</div>
                  <div className="text-xs text-muted-foreground">Chờ xử lý</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
