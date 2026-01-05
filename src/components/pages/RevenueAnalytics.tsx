import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { branches } from '../../data/mockData';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type TimeRange = 'day' | 'week' | 'month' | 'year';

interface BranchRevenue {
  branchId: string;
  branchName: string;
  revenue: number;
  orders: number;
  growth: number;
  avgOrderValue: number;
}

interface RevenueByDate {
  date: string;
  total: number;
  [key: string]: string | number;
}

export function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Mock data - Doanh thu theo chi nhánh
  const branchRevenueData: BranchRevenue[] = [
    {
      branchId: '1',
      branchName: 'EATNOW - Nguyễn Huệ',
      revenue: 15200000,
      orders: 189,
      growth: 12.5,
      avgOrderValue: 80423
    },
    {
      branchId: '2',
      branchName: 'EATNOW - Phạm Ngọc Thạch',
      revenue: 12400000,
      orders: 156,
      growth: 8.3,
      avgOrderValue: 79487
    },
    {
      branchId: '3',
      branchName: 'EATNOW - Lê Văn Sỹ',
      revenue: 10800000,
      orders: 134,
      growth: 15.7,
      avgOrderValue: 80597
    },
    {
      branchId: '4',
      branchName: 'EATNOW - Trần Hưng Đạo',
      revenue: 7200000,
      orders: 88,
      growth: -3.2,
      avgOrderValue: 81818
    }
  ];

  // Mock data - Doanh thu theo ngày (30 ngày gần nhất)
  const generateDailyRevenue = (): RevenueByDate[] => {
    const data: RevenueByDate[] = [];
    const days = 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
      
      const item: RevenueByDate = {
        date: dateStr,
        total: 0,
        'Chi nhánh 1': Math.floor(Math.random() * 1000000) + 300000,
        'Chi nhánh 2': Math.floor(Math.random() * 800000) + 250000,
        'Chi nhánh 3': Math.floor(Math.random() * 700000) + 200000,
        'Chi nhánh 4': Math.floor(Math.random() * 500000) + 150000
      };
      
      item.total = (item['Chi nhánh 1'] as number) + 
                   (item['Chi nhánh 2'] as number) + 
                   (item['Chi nhánh 3'] as number) + 
                   (item['Chi nhánh 4'] as number);
      
      data.push(item);
    }
    
    return data;
  };

  const dailyRevenueData = generateDailyRevenue();

  // Tính tổng doanh thu
  const totalRevenue = branchRevenueData.reduce((sum, branch) => sum + branch.revenue, 0);
  const totalOrders = branchRevenueData.reduce((sum, branch) => sum + branch.orders, 0);
  const avgGrowth = branchRevenueData.reduce((sum, branch) => sum + branch.growth, 0) / branchRevenueData.length;

  // Data cho biểu đồ tròn
  const pieChartData = branchRevenueData.map(branch => ({
    name: branch.branchName.replace('EATNOW - ', ''),
    value: branch.revenue
  }));

  const COLORS = ['#6B4226', '#D9C8B6', '#F4EAE0', '#8B5A3C'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(price) + ' ₫';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleExport = () => {
    // Mock export functionality
    alert('Đang xuất báo cáo doanh thu...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '24px' }}>Phân tích doanh thu</h2>
          <p className="text-muted-foreground">Theo dõi doanh thu theo chi nhánh và thời gian</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hôm nay</SelectItem>
              <SelectItem value="week">7 ngày</SelectItem>
              <SelectItem value="month">30 ngày</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }} className="text-primary mt-1">
                  {formatPrice(totalRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+{avgGrowth.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }} className="mt-1">
                  {formatNumber(totalOrders)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Từ {branches.length} chi nhánh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Giá trị đơn TB</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }} className="mt-1">
                  {formatPrice(totalRevenue / totalOrders)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Trung bình mỗi đơn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chi nhánh tốt nhất</p>
                <p style={{ fontSize: '20px', fontWeight: 700 }} className="mt-1">
                  {branchRevenueData[0].branchName.replace('EATNOW - ', '')}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatPrice(branchRevenueData[0].revenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng doanh thu (30 ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatPrice(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6B4226" 
                  strokeWidth={2}
                  name="Tổng doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>So sánh doanh thu chi nhánh</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="branchName" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.replace('EATNOW - ', '')}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatPrice(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#6B4226" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Branch Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu chi tiết theo chi nhánh</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatPrice(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Chi nhánh 1" 
                stroke="#6B4226" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="Chi nhánh 2" 
                stroke="#D9C8B6" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="Chi nhánh 3" 
                stroke="#8B5A3C" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="Chi nhánh 4" 
                stroke="#A67C52" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Share Pie Chart & Detailed Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tỷ trọng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatPrice(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bảng doanh thu chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="text-right">Đơn hàng</TableHead>
                  <TableHead className="text-right">Đơn TB</TableHead>
                  <TableHead className="text-center">Tăng trưởng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchRevenueData.map((branch) => (
                  <TableRow key={branch.branchId}>
                    <TableCell>
                      <div style={{ fontWeight: 600 }}>{branch.branchName}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div style={{ fontWeight: 600 }} className="text-primary">
                        {formatPrice(branch.revenue)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(branch.orders)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(branch.avgOrderValue)}
                    </TableCell>
                    <TableCell className="text-center">
                      {branch.growth >= 0 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{branch.growth}%
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {branch.growth}%
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <div style={{ fontWeight: 700 }}>TỔNG CỘNG</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div style={{ fontWeight: 700 }} className="text-primary">
                      {formatPrice(totalRevenue)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div style={{ fontWeight: 700 }}>
                      {formatNumber(totalOrders)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div style={{ fontWeight: 700 }}>
                      {formatPrice(totalRevenue / totalOrders)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-primary/10 text-primary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{avgGrowth.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
