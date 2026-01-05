import { useState } from 'react';
import { Clock, Package, CheckCircle, XCircle, Bell, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

interface StaffDashboardProps {
  onLogout?: () => void;
}

export function StaffDashboard({ onLogout }: StaffDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const getTimeSince = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    return `${hours} giờ trước`;
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      preparing: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      ready: 'bg-green-100 text-green-800 hover:bg-green-200',
      completed: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-200'
    };

    const labels = {
      pending: 'Chờ xử lý',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };

    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready'),
    completed: orders.filter(o => o.status === 'completed')
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="mb-1">Đơn hàng #{order.id}</h4>
            <p className="text-sm text-muted-foreground">{order.customerName}</p>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="text-sm flex justify-between">
              <span className="text-muted-foreground">
                {item.quantity}x {item.name}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="text-sm text-muted-foreground mb-4 p-2 bg-muted rounded">
            📝 {order.notes}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {getTimeSince(order.createdAt)}
          </div>
          <div style={{ fontWeight: 600 }}>
            {formatPrice(order.total)}
          </div>
        </div>

        <div className="flex gap-2">
          {order.status === 'pending' && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => updateOrderStatus(order.id, 'preparing')}
              >
                Bắt đầu chuẩn bị
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
              >
                Hủy
              </Button>
            </>
          )}
          {order.status === 'preparing' && (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => updateOrderStatus(order.id, 'ready')}
            >
              Đánh dấu sẵn sàng
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => updateOrderStatus(order.id, 'completed')}
            >
              Hoàn thành
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: '28px' }}>Dashboard nhân viên</h1>
            <p className="text-muted-foreground">Quản lý đơn hàng tại chi nhánh</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90">
              <Bell className="h-4 w-4 mr-2" />
              Thông báo
            </Button>
            {onLogout && (
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Chờ xử lý</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>
                    {ordersByStatus.pending.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Đang làm</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>
                    {ordersByStatus.preparing.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Sẵn sàng</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>
                    {ordersByStatus.ready.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Hoàn thành</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>
                    {ordersByStatus.completed.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Chờ xử lý ({ordersByStatus.pending.length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Đang làm ({ordersByStatus.preparing.length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Sẵn sàng ({ordersByStatus.ready.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Hoàn thành ({ordersByStatus.completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.pending.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {ordersByStatus.pending.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Không có đơn hàng chờ xử lý</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preparing" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.preparing.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {ordersByStatus.preparing.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Không có đơn hàng đang chuẩn bị</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.ready.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {ordersByStatus.ready.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Không có đơn hàng sẵn sàng</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.completed.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {ordersByStatus.completed.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Chưa có đơn hàng hoàn thành</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
