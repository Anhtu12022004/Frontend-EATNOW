import { useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users, Plus, UtensilsCrossed, MessageSquare, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FeedbackManagement } from './FeedbackManagement';
import { Rating } from '../../types';

interface AdminDashboardProps {
  onNavigateToMenu?: () => void;
  onNavigateToStaff?: () => void;
  ratings?: Rating[];
  onApproveRating?: (ratingId: string) => void;
  onHideRating?: (ratingId: string) => void;
  onDeleteRating?: (ratingId: string) => void;
  onLogout?: () => void;
}

const salesData = [
  { day: 'T2', revenue: 4200000 },
  { day: 'T3', revenue: 3800000 },
  { day: 'T4', revenue: 5100000 },
  { day: 'T5', revenue: 4600000 },
  { day: 'T6', revenue: 6200000 },
  { day: 'T7', revenue: 7500000 },
  { day: 'CN', revenue: 8100000 }
];

const topItems = [
  { name: 'Phở Bò Đặc Biệt', sold: 156, revenue: 11700000 },
  { name: 'Cơm Gà Teriyaki', sold: 128, revenue: 10880000 },
  { name: 'Cơm Chiên Dương Châu', sold: 145, revenue: 9425000 },
  { name: 'Bít Tết Bò Úc', sold: 67, revenue: 13065000 }
];

export function AdminDashboard({ 
  onNavigateToMenu, 
  onNavigateToStaff,
  ratings = [],
  onApproveRating,
  onHideRating,
  onDeleteRating,
  onLogout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const branchId = '1'; // EATNOW - Nguyễn Huệ

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: '28px' }}>Dashboard Admin - Chi nhánh</h1>
            <p className="text-muted-foreground">EATNOW - Nguyễn Huệ, Quận 1</p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={onNavigateToMenu}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm món mới
            </Button>
            {onLogout && (
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Đánh giá & Phản hồi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Doanh thu hôm nay</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '28px', fontWeight: 700 }} className="text-primary">
                    8.1M ₫
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +12.5% so với hôm qua
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Đơn hàng</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '28px', fontWeight: 700 }}>
                    143
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +8.2% so với hôm qua
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Giá trị trung bình</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '28px', fontWeight: 700 }}>
                    56.6K ₫
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +3.1% so với hôm qua
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Khách hàng mới</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '28px', fontWeight: 700 }}>
                    24
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +5 so với hôm qua
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu 7 ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatPrice(value)}
                      />
                      <Bar dataKey="revenue" fill="#6B4226" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Xu hướng doanh thu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatPrice(value)}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#6B4226" 
                        strokeWidth={2}
                        dot={{ fill: '#6B4226', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Món bán chạy nhất</CardTitle>
                <Button variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center" style={{ fontWeight: 700 }}>
                          #{index + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.sold} đã bán
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary" style={{ fontWeight: 600 }}>
                          {formatPrice(item.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={onNavigateToMenu}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">Quản lý menu</h3>
                  <p className="text-sm text-muted-foreground">
                    Thêm, sửa, xóa món ăn
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={onNavigateToStaff}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">Quản lý nhân viên</h3>
                  <p className="text-sm text-muted-foreground">
                    Thêm và quản lý staff
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('feedback')}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">Đánh giá & Phản hồi</h3>
                  <p className="text-sm text-muted-foreground">
                    Quản lý đánh giá khách hàng
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackManagement 
              ratings={ratings}
              onApprove={onApproveRating}
              onHide={onHideRating}
              onDelete={onDeleteRating}
              branchId={branchId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
