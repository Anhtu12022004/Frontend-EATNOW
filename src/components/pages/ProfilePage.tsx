import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Camera, Save, Package, Star, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Customer } from '../../types';
import { toast } from 'sonner';
import { DishRatingDialog } from './DishRatingDialog';
import { customerService, CustomerOrderResponse, OrderItemInfo } from '../../services/customer';

interface ProfilePageProps {
  customer: Customer;
  onBack: () => void;
  onUpdate: (updatedCustomer: Customer) => void;
  onLogout: () => void;
}

export function ProfilePage({ customer, onBack, onUpdate, onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address || '',
    avatar: customer.avatar || ''
  });
  
  // Order history state
  const [orders, setOrders] = useState<CustomerOrderResponse[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  
  // Rating dialog state
  const [ratingDialog, setRatingDialog] = useState<{
    open: boolean;
    orderId: string;
    dish: OrderItemInfo | null;
  }>({
    open: false,
    orderId: '',
    dish: null
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string) => {
    // Handle both Date object and string (from JSON.parse of localStorage)
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Fetch order history
  const fetchOrderHistory = async () => {
    if (!customer.id) return;
    
    setIsLoadingOrders(true);
    setOrdersError(null);
    
    try {
      const data = await customerService.getOrderHistory(customer.id);
      // Sort orders by date (newest first)
      const sortedOrders = data.sort((a, b) => 
        new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải lịch sử đơn hàng';
      setOrdersError(errorMessage);
      console.error('Error fetching order history:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [customer.id]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Email không hợp lệ');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    setIsSaving(true);
    try {
      await customerService.updateProfile({
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address || undefined
      });

      const updatedCustomer: Customer = {
        ...customer,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        avatar: formData.avatar || undefined
      };

      onUpdate(updatedCustomer);
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật thông tin';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      avatar: customer.avatar || ''
    });
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      NEW: { variant: 'secondary', label: 'Mới' },
      PREPARING: { variant: 'default', label: 'Đang chuẩn bị' },
      PAID: { variant: 'default', label: 'Đã thanh toán' },
      CANCELLED: { variant: 'destructive', label: 'Đã hủy' }
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleRateDish = (orderId: string, dish: OrderItemInfo) => {
    if (dish.isCommented) {
      toast.info('Bạn đã đánh giá món này rồi');
      return;
    }
    setRatingDialog({
      open: true,
      orderId,
      dish
    });
  };

  const handleRatingSubmit = async (data: { rating: number; comment: string; orderId: string; branchDishId: string }) => {
    try {
      await customerService.submitFeedback(data);
      toast.success('Cảm ơn bạn đã đánh giá!');
      
      // Update local state to mark the item as commented
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === data.orderId) {
            return {
              ...order,
              orderItemInfos: order.orderItemInfos.map(item => 
                item.branchDishId === data.branchDishId 
                  ? { ...item, isCommented: true }
                  : item
              )
            };
          }
          return order;
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể gửi đánh giá';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={customer.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <h2 className="mt-4">{customer.name}</h2>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>

                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Tham gia từ {formatDate(customer.joinedDate)}</span>
                  </div>

                  <Separator className="my-6" />

                  <div className="w-full space-y-2">
                    <Button
                      variant={isEditing ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Lưu thay đổi
                        </>
                      ) : (
                        'Chỉnh sửa thông tin'
                      )}
                    </Button>

                    {isEditing && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Hủy
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={onLogout}
                    >
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="info" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">
                  <User className="h-4 w-4 mr-2" />
                  Thông tin
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  Đơn hàng
                </TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                    <CardDescription>
                      {isEditing 
                        ? 'Cập nhật thông tin của bạn'
                        : 'Xem và quản lý thông tin tài khoản'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      {isEditing ? (
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="Họ và tên"
                            className="pl-10"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-foreground p-3 rounded-lg bg-muted/50">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-foreground p-3 rounded-lg bg-muted/50">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      {isEditing ? (
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="0901234567"
                            className="pl-10"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-foreground p-3 rounded-lg bg-muted/50">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      {isEditing ? (
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="address"
                            placeholder="Địa chỉ giao hàng"
                            className="pl-10"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-foreground p-3 rounded-lg bg-muted/50">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>{customer.address || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử đơn hàng</CardTitle>
                    <CardDescription>
                      Xem và quản lý các đơn hàng của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Đang tải...</span>
                      </div>
                    ) : ordersError ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-destructive">{ordersError}</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={fetchOrderHistory}
                        >
                          Thử lại
                        </Button>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Bạn chưa có đơn hàng nào</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">Đơn #{order.id.slice(0, 8)}</CardTitle>
                                  <CardDescription>{order.branchName}</CardDescription>
                                </div>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <span>{formatDateTime(order.orderTime)}</span>
                                <span>•</span>
                                <span>Bàn {order.tableNumber}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-2">
                                {order.orderItemInfos.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              
                              <Separator />
                              
                              <div className="flex justify-between font-medium">
                                <span>Tổng cộng</span>
                                <span>{formatCurrency(order.totalPrice)}</span>
                              </div>

                              {/* Rating Section */}
                              {order.status === 'PAID' && (
                                <>
                                  <Separator />
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Đánh giá món ăn</p>
                                    <div className="flex flex-wrap gap-2">
                                      {order.orderItemInfos.map((item) => (
                                        <Button
                                          key={item.id}
                                          variant={item.isCommented ? 'ghost' : 'outline'}
                                          size="sm"
                                          className={item.isCommented ? 'cursor-default' : ''}
                                          onClick={() => handleRateDish(order.id, item)}
                                        >
                                          <Star 
                                            className={`h-4 w-4 mr-2 ${
                                              item.isCommented 
                                                ? 'fill-yellow-400 text-yellow-400' 
                                                : 'text-gray-400'
                                            }`} 
                                          />
                                          <span className={item.isCommented ? 'text-muted-foreground' : ''}>
                                            {item.name}
                                          </span>
                                          {item.isCommented && (
                                            <span className="ml-1 text-xs text-muted-foreground">(Đã đánh giá)</span>
                                          )}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      <DishRatingDialog
        open={ratingDialog.open}
        onClose={() => setRatingDialog({ ...ratingDialog, open: false })}
        orderId={ratingDialog.orderId}
        dish={ratingDialog.dish}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}
