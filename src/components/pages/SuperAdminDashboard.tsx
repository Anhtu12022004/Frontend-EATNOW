import { useState } from 'react';
import { Building2, DollarSign, ShoppingBag, Users, MapPin, TrendingUp, LayoutDashboard, BarChart3, MessageSquare, Brain, LogOut, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { branches } from '../../data/mockData';
import { BranchManagement } from './BranchManagement';
import { UserManagement } from './UserManagement';
import { RevenueAnalytics } from './RevenueAnalytics';
import { FeedbackManagement } from './FeedbackManagement';
import { AIInsightsPage } from './AIInsightsPage';
import { SystemMenuManagement } from './SystemMenuManagement';
import { Rating, Order } from '../../types';

const systemStats = {
  totalRevenue: 45600000,
  totalOrders: 567,
  activeBranches: 4,
  totalUsers: 1234,
  revenueGrowth: 15.3,
  ordersGrowth: 12.8
};

const branchPerformance = [
  { id: '1', name: 'Nguyễn Huệ', revenue: 15200000, orders: 189, rating: 4.8, status: 'active' },
  { id: '2', name: 'Phạm Ngọc Thạch', revenue: 12400000, orders: 156, rating: 4.7, status: 'active' },
  { id: '3', name: 'Lê Văn Sỹ', revenue: 10800000, orders: 134, rating: 4.9, status: 'active' },
  { id: '4', name: 'Trần Hưng Đạo', revenue: 7200000, orders: 88, rating: 4.6, status: 'active' }
];

interface SuperAdminDashboardProps {
  ratings?: Rating[];
  orders?: Order[];
  onApproveRating?: (ratingId: string) => void;
  onHideRating?: (ratingId: string) => void;
  onDeleteRating?: (ratingId: string) => void;
  onLogout?: () => void;
}

export function SuperAdminDashboard({ 
  ratings = [],
  orders = [],
  onApproveRating,
  onHideRating,
  onDeleteRating,
  onLogout
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(price) + ' ₫';
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 style={{ fontSize: '28px' }}>Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Tổng quan toàn hệ thống EATNOW</p>
          </div>
          {onLogout && (
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="ai-insights">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <BarChart3 className="h-4 w-4 mr-2" />
              Doanh thu
            </TabsTrigger>
            <TabsTrigger value="branches">
              <Building2 className="h-4 w-4 mr-2" />
              Quản lý chi nhánh
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Quản lý người dùng
            </TabsTrigger>
            <TabsTrigger value="menu">
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Quản lý menu
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Đánh giá & Phản hồi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Dashboard content */}

            {/* System-wide KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Tổng doanh thu (30 ngày)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '24px', fontWeight: 700 }} className="text-primary">
                {formatPrice(systemStats.totalRevenue)}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +{systemStats.revenueGrowth}% so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Tổng đơn hàng</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {systemStats.totalOrders}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +{systemStats.ordersGrowth}% so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Chi nhánh hoạt động</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {systemStats.activeBranches}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tất cả đang hoạt động tốt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Tổng người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {systemStats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Khách hàng và nhân viên
              </p>
            </CardContent>
          </Card>
            </div>

            {/* Branch Performance Table */}
            <Card>
          <CardHeader>
            <CardTitle>Hiệu suất chi nhánh</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="text-right">Đơn hàng</TableHead>
                  <TableHead className="text-center">Đánh giá</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchPerformance.map((branch) => {
                  const branchData = branches.find(b => b.id === branch.id);
                  return (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>
                          EATNOW - {branch.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {branchData?.address}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div style={{ fontWeight: 600 }}>
                          {formatPrice(branch.revenue)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {branch.orders}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-amber-500">★</span>
                          <span>{branch.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Hoạt động
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('ai-insights')}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">AI Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Phân tích thông minh từ AI
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('branches')}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">Quản lý chi nhánh</h3>
                  <p className="text-sm text-muted-foreground">
                    Thêm, sửa thông tin chi nhánh
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('users')}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">Quản lý người dùng</h3>
                  <p className="text-sm text-muted-foreground">
                    Phân quyền và quản lý tài khoản
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
                    Quản lý đánh giá từ khách hàng
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights">
            <AIInsightsPage 
              orders={orders}
              ratings={ratings}
              branches={branches}
              onBack={() => setActiveTab('dashboard')}
            />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueAnalytics />
          </TabsContent>

          <TabsContent value="branches">
            <BranchManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="menu">
            <SystemMenuManagement />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackManagement 
              ratings={ratings}
              onApprove={onApproveRating}
              onHide={onHideRating}
              onDelete={onDeleteRating}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}