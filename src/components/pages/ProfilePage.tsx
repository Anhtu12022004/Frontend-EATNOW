import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Camera, Save, Package, Star, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Customer, Order, Rating, MenuItem } from '../../types';
import { toast } from 'sonner';
import { RatingDialog } from './RatingDialog';

interface ProfilePageProps {
  customer: Customer;
  onBack: () => void;
  onUpdate: (updatedCustomer: Customer) => void;
  onLogout: () => void;
  orders?: Order[];
  onRatingSubmit?: (rating: Omit<Rating, 'id' | 'createdAt' | 'status'>) => void;
}

export function ProfilePage({ customer, onBack, onUpdate, onLogout, orders = [], onRatingSubmit }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address || '',
    avatar: customer.avatar || ''
  });
  const [ratingDialog, setRatingDialog] = useState<{
    open: boolean;
    order: Order | null;
    type: 'dish' | 'branch';
    dish?: MenuItem;
  }>({
    open: false,
    order: null,
    type: 'branch'
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
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

  const handleSave = () => {
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

  const getStatusBadge = (status: Order['status']) => {
    const variants: Record<Order['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Chờ xác nhận' },
      preparing: { variant: 'default', label: 'Đang chuẩn bị' },
      ready: { variant: 'outline', label: 'Sẵn sàng' },
      completed: { variant: 'default', label: 'Hoàn tất' },
      cancelled: { variant: 'destructive', label: 'Đã hủy' }
    };

    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleRateDish = (order: Order, dish: MenuItem) => {
    if (order.hasRated) {
      toast.error('Bạn đã đánh giá đơn hàng này rồi');
      return;
    }
    setRatingDialog({
      open: true,
      order,
      type: 'dish',
      dish
    });
  };

  const handleRateBranch = (order: Order) => {
    if (order.hasRated) {
      toast.error('Bạn đã đánh giá đơn hàng này rồi');
      return;
    }
    setRatingDialog({
      open: true,
      order,
      type: 'branch'
    });
  };

  const handleRatingSubmit = (rating: Omit<Rating, 'id' | 'createdAt' | 'status'>) => {
    if (onRatingSubmit) {
      onRatingSubmit(rating);
      toast.success('Cảm ơn bạn đã đánh giá!');
    }
  };

  // Filter orders for this customer
  const customerOrders = orders.filter(order => order.customerId === customer.id);
  const completedOrders = customerOrders.filter(order => order.status === 'completed');

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
                    >
                      {isEditing ? (
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                  <User className="h-4 w-4 mr-2" />
                  Thông tin
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  Đơn hàng
                </TabsTrigger>
                <TabsTrigger value="security">
                  Bảo mật
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

                    {isEditing && (
                      <div className="space-y-2">
                        <Label htmlFor="avatar">URL ảnh đại diện (tùy chọn)</Label>
                        <Input
                          id="avatar"
                          placeholder="https://..."
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Nhập URL hình ảnh hoặc để trống để sử dụng avatar mặc định
                        </p>
                      </div>
                    )}
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
                    {customerOrders.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Bạn chưa có đơn hàng nào</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customerOrders.map((order) => (
                          <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">{order.id}</CardTitle>
                                  <CardDescription>{order.branchName}</CardDescription>
                                </div>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDateTime(order.createdAt)}
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              
                              <Separator />
                              
                              <div className="flex justify-between">
                                <span>Tổng cộng</span>
                                <span>{formatCurrency(order.total)}</span>
                              </div>

                              {order.status === 'completed' && (
                                <div className="pt-2 space-y-2">
                                  <Separator />
                                  {order.hasRated ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span>Bạn đã đánh giá đơn hàng này</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRateBranch(order)}
                                      >
                                        <Star className="h-4 w-4 mr-2" />
                                        Đánh giá chi nhánh
                                      </Button>
                                      {order.items.length === 1 && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleRateDish(order, order.items[0])}
                                        >
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          Đánh giá món ăn
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {order.status === 'completed' && !order.hasRated && order.items.length > 1 && (
                                <details className="text-sm">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    Đánh giá từng món ăn
                                  </summary>
                                  <div className="mt-2 space-y-1 pl-4">
                                    {order.items.map((item, idx) => (
                                      <Button
                                        key={idx}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => handleRateDish(order, item)}
                                      >
                                        <Star className="h-4 w-4 mr-2" />
                                        {item.name}
                                      </Button>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Bảo mật</CardTitle>
                    <CardDescription>
                      Quản lý mật khẩu và bảo mật tài khoản
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline">
                      Đổi mật khẩu
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      <RatingDialog
        open={ratingDialog.open}
        onClose={() => setRatingDialog({ ...ratingDialog, open: false })}
        order={ratingDialog.order}
        type={ratingDialog.type}
        dish={ratingDialog.dish}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}
