import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Star,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Download,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Calendar,
  Award,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Order, Rating, Branch } from '../../types';
import { toast } from 'sonner';

interface AIInsightsPageProps {
  orders: Order[];
  ratings: Rating[];
  branches: Branch[];
  onBack: () => void;
}

interface AIInsight {
  id: string;
  category: 'revenue' | 'customer' | 'menu' | 'operation' | 'sentiment';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
  value?: string;
  recommendation: string;
}

interface DishPerformance {
  name: string;
  orders: number;
  revenue: number;
  rating: number;
  sentiment: number;
  recommendation: 'keep' | 'improve' | 'remove' | 'promote';
}

interface PeakHourData {
  hour: string;
  orders: number;
  revenue: number;
}

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

const COLORS = ['#6B4226', '#D9C8B6', '#F4EAE0', '#8B5A3C', '#A67C52'];

export function AIInsightsPage({ orders, ratings, branches, onBack }: AIInsightsPageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [dishPerformance, setDishPerformance] = useState<DishPerformance[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate AI processing
    const analyzeData = async () => {
      setIsAnalyzing(true);
      
      // Simulate processing time (5-10 seconds)
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Generate AI insights
      const generatedInsights = generateInsights(orders, ratings, branches);
      const dishAnalysis = analyzeDishPerformance(orders, ratings);
      const peakHourAnalysis = analyzePeakHours(orders);
      const sentiment = analyzeSentiment(ratings);

      setInsights(generatedInsights);
      setDishPerformance(dishAnalysis);
      setPeakHours(peakHourAnalysis);
      setSentimentData(sentiment);
      setIsAnalyzing(false);

      toast.success('Phân tích AI hoàn tất', {
        description: 'Dữ liệu đã được xử lý và phân tích thành công'
      });
    };

    analyzeData();
  }, [orders, ratings, branches]);

  const generateInsights = (orders: Order[], ratings: Rating[], branches: Branch[]): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Revenue insight
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalRevenue / orders.length;
    
    insights.push({
      id: 'rev-1',
      category: 'revenue',
      title: 'Doanh thu trung bình đơn hàng',
      description: `Giá trị đơn hàng trung bình là ${avgOrderValue.toLocaleString('vi-VN')}đ. Cao hơn 12% so với tháng trước.`,
      impact: 'high',
      trend: 'up',
      value: `${avgOrderValue.toLocaleString('vi-VN')}đ`,
      recommendation: 'Tăng cường combo và upselling để duy trì xu hướng tăng trưởng này.'
    });

    // Customer behavior insight
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const completionRate = (completedOrders / orders.length) * 100;

    insights.push({
      id: 'cust-1',
      category: 'customer',
      title: 'Tỷ lệ hoàn thành đơn hàng',
      description: `${completionRate.toFixed(1)}% đơn hàng được hoàn thành thành công. Cần cải thiện quy trình xử lý.`,
      impact: completionRate > 85 ? 'low' : 'high',
      trend: completionRate > 85 ? 'stable' : 'down',
      value: `${completionRate.toFixed(1)}%`,
      recommendation: completionRate > 85 
        ? 'Duy trì chất lượng dịch vụ hiện tại và training nhân viên thường xuyên.'
        : 'Cần điều tra nguyên nhân hủy đơn và cải thiện quy trình xác nhận đơn hàng.'
    });

    // Sentiment insight
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    insights.push({
      id: 'sent-1',
      category: 'sentiment',
      title: 'Đánh giá khách hàng',
      description: `Điểm đánh giá trung bình là ${avgRating.toFixed(1)}/5. Khách hàng hài lòng với chất lượng món ăn.`,
      impact: avgRating >= 4.5 ? 'low' : avgRating >= 4.0 ? 'medium' : 'high',
      trend: avgRating >= 4.5 ? 'up' : avgRating >= 4.0 ? 'stable' : 'down',
      value: `${avgRating.toFixed(1)}/5`,
      recommendation: avgRating >= 4.5
        ? 'Xuất sắc! Chia sẻ những đánh giá tích cực này trên các kênh marketing.'
        : 'Tập trung cải thiện các món có đánh giá thấp và training đội ngũ phục vụ.'
    });

    // Peak hours insight
    insights.push({
      id: 'op-1',
      category: 'operation',
      title: 'Giờ cao điểm',
      description: 'Phân tích cho thấy 12:00-13:00 và 18:00-20:00 là khung giờ đặt hàng cao nhất.',
      impact: 'high',
      trend: 'stable',
      recommendation: 'Tăng nhân sự và chuẩn bị nguyên liệu tại các giờ cao điểm. Có thể áp dụng giá ưu đãi vào giờ thấp điểm.'
    });

    // Menu optimization insight
    insights.push({
      id: 'menu-1',
      category: 'menu',
      title: 'Tối ưu thực đơn',
      description: 'AI phát hiện 3 món ăn có doanh thu thấp nhưng tốn nhiều nguyên liệu.',
      impact: 'medium',
      trend: 'down',
      recommendation: 'Xem xét loại bỏ hoặc cải tiến công thức các món: Salad Cá Hồi, Súp Bí Đỏ, Smoothie Bơ.'
    });

    // Branch performance
    const branchOrders = branches.map(b => ({
      branch: b.name,
      orders: orders.filter(o => o.branchId === b.id).length
    }));
    const topBranch = branchOrders.sort((a, b) => b.orders - a.orders)[0];

    insights.push({
      id: 'op-2',
      category: 'operation',
      title: 'Hiệu suất chi nhánh',
      description: `${topBranch.branch} dẫn đầu với ${topBranch.orders} đơn hàng. Nên chia sẻ best practices.`,
      impact: 'medium',
      trend: 'up',
      recommendation: 'Tổ chức training chéo giữa các chi nhánh để chia sẻ kinh nghiệm từ chi nhánh tốt nhất.'
    });

    return insights;
  };

  const analyzeDishPerformance = (orders: Order[], ratings: Rating[]): DishPerformance[] => {
    const dishMap = new Map<string, { orders: number; revenue: number; ratings: number[] }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = dishMap.get(item.name) || { orders: 0, revenue: 0, ratings: [] };
        dishMap.set(item.name, {
          orders: existing.orders + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity),
          ratings: existing.ratings
        });
      });
    });

    // Mock ratings for dishes
    const dishes: DishPerformance[] = [];
    dishMap.forEach((data, name) => {
      const avgRating = 4.0 + Math.random() * 1.0; // Mock rating 4.0-5.0
      const sentiment = 0.6 + Math.random() * 0.3; // Mock sentiment 0.6-0.9
      
      let recommendation: 'keep' | 'improve' | 'remove' | 'promote' = 'keep';
      if (avgRating >= 4.5 && data.orders > 15) recommendation = 'promote';
      else if (avgRating < 4.0) recommendation = 'improve';
      else if (data.orders < 5) recommendation = 'remove';

      dishes.push({
        name,
        orders: data.orders,
        revenue: data.revenue,
        rating: avgRating,
        sentiment,
        recommendation
      });
    });

    return dishes.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  };

  const analyzePeakHours = (orders: Order[]): PeakHourData[] => {
    const hourMap = new Map<number, { orders: number; revenue: number }>();

    orders.forEach(order => {
      const hour = new Date(order.orderDate).getHours();
      const existing = hourMap.get(hour) || { orders: 0, revenue: 0 };
      hourMap.set(hour, {
        orders: existing.orders + 1,
        revenue: existing.revenue + order.totalAmount
      });
    });

    const peakData: PeakHourData[] = [];
    for (let hour = 10; hour <= 22; hour++) {
      const data = hourMap.get(hour) || { orders: 0, revenue: 0 };
      peakData.push({
        hour: `${hour}:00`,
        orders: data.orders,
        revenue: data.revenue
      });
    }

    return peakData;
  };

  const analyzeSentiment = (ratings: Rating[]): SentimentData => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    ratings.forEach(rating => {
      // Simulate sentiment analysis based on rating and comment
      if (rating.rating >= 4.5) {
        positive++;
      } else if (rating.rating >= 3.5) {
        neutral++;
      } else {
        negative++;
      }

      // Additional sentiment from comments (mock NLP)
      if (rating.comment) {
        const positiveWords = ['tuyệt', 'ngon', 'tốt', 'xuất sắc', 'thích', 'hài lòng'];
        const negativeWords = ['tệ', 'kém', 'chậm', 'lạnh', 'không ngon', 'thất vọng'];
        
        const comment = rating.comment.toLowerCase();
        const hasPositive = positiveWords.some(word => comment.includes(word));
        const hasNegative = negativeWords.some(word => comment.includes(word));

        if (hasPositive && !hasNegative) positive++;
        if (hasNegative && !hasPositive) negative++;
      }
    });

    const total = positive + neutral + negative;
    return {
      positive: (positive / total) * 100,
      neutral: (neutral / total) * 100,
      negative: (negative / total) * 100
    };
  };

  const handleExportPDF = () => {
    toast.success('Đang xuất báo cáo PDF...', {
      description: 'Báo cáo sẽ được tải xuống trong giây lát'
    });
    // In production, generate and download PDF
  };

  const handleExportExcel = () => {
    toast.success('Đang xuất báo cáo Excel...', {
      description: 'File Excel sẽ được tải xuống trong giây lát'
    });
    // In production, generate and download Excel
  };

  const handleRefresh = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      toast.success('Dữ liệu đã được làm mới');
      setIsAnalyzing(false);
    }, 3000);
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Brain className="h-16 w-16 text-primary animate-pulse" />
                <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium">AI đang phân tích dữ liệu...</h3>
                <p className="text-sm text-muted-foreground">
                  Đang xử lý dữ liệu đơn hàng, đánh giá và hành vi khách hàng
                </p>
              </div>
              <Progress value={66} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Ước tính: 5-10 giây
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sentimentChartData = sentimentData ? [
    { name: 'Tích cực', value: sentimentData.positive, color: '#10b981' },
    { name: 'Trung tính', value: sentimentData.neutral, color: '#6B4226' },
    { name: 'Tiêu cực', value: sentimentData.negative, color: '#ef4444' }
  ] : [];

  const branchPerformanceData = branches.map(branch => {
    const branchOrders = orders.filter(o => o.branchId === branch.id);
    const branchRatings = ratings.filter(r => 
      branchOrders.some(o => o.id === r.orderId)
    );
    
    return {
      branch: branch.name.replace('EATNOW - ', ''),
      orders: branchOrders.length,
      revenue: branchOrders.reduce((sum, o) => sum + o.totalAmount, 0) / 1000,
      rating: branchRatings.length > 0 
        ? branchRatings.reduce((sum, r) => sum + r.rating, 0) / branchRatings.length 
        : 0,
      satisfaction: Math.random() * 20 + 80 // Mock satisfaction score 80-100
    };
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                ← Quay lại
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl">AI Insights & Recommendations</h1>
                  <p className="text-sm text-muted-foreground">
                    Phân tích thông minh và khuyến nghị từ AI
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
            <TabsTrigger value="menu">Thực đơn</TabsTrigger>
            <TabsTrigger value="sentiment">Cảm xúc KH</TabsTrigger>
            <TabsTrigger value="operations">Vận hành</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.slice(0, 6).map(insight => (
                <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {insight.category === 'revenue' && <DollarSign className="h-4 w-4 text-primary" />}
                          {insight.category === 'customer' && <Users className="h-4 w-4 text-primary" />}
                          {insight.category === 'menu' && <ShoppingBag className="h-4 w-4 text-primary" />}
                          {insight.category === 'operation' && <Clock className="h-4 w-4 text-primary" />}
                          {insight.category === 'sentiment' && <Star className="h-4 w-4 text-primary" />}
                          <Badge variant={
                            insight.impact === 'high' ? 'destructive' : 
                            insight.impact === 'medium' ? 'default' : 
                            'secondary'
                          } className="text-xs">
                            {insight.impact === 'high' ? 'Cao' : insight.impact === 'medium' ? 'TB' : 'Thấp'}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                      </div>
                      {insight.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                      {insight.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {insight.value && (
                      <div className="text-2xl font-bold text-primary">{insight.value}</div>
                    )}
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-primary">{insight.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Branch Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  So sánh hiệu suất chi nhánh
                </CardTitle>
                <CardDescription>
                  Đánh giá tổng hợp các chỉ số quan trọng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={branchPerformanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="branch" />
                    <PolarRadiusAxis />
                    <Radar name="Đơn hàng" dataKey="orders" stroke="#6B4226" fill="#6B4226" fillOpacity={0.6} />
                    <Radar name="Đánh giá" dataKey="rating" stroke="#D9C8B6" fill="#D9C8B6" fillOpacity={0.6} />
                    <Radar name="Hài lòng (%)" dataKey="satisfaction" stroke="#8B5A3C" fill="#8B5A3C" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Peak Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Phân tích giờ cao điểm
                  </CardTitle>
                  <CardDescription>
                    Doanh thu và số đơn hàng theo giờ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" fill="#6B4226" name="Số đơn" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#D9C8B6" name="Doanh thu (k)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Branch Revenue Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Doanh thu theo chi nhánh
                  </CardTitle>
                  <CardDescription>
                    So sánh hiệu suất doanh thu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={branchPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="branch" type="category" />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#6B4226" name="Doanh thu (triệu đ)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.filter(i => i.category === 'revenue').map(insight => (
                <Card key={insight.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-primary flex items-start gap-2">
                        <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {insight.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Hiệu suất món ăn
                </CardTitle>
                <CardDescription>
                  Top 10 món ăn theo doanh thu và đánh giá
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dishPerformance.map((dish, index) => (
                    <div key={dish.name} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{dish.name}</span>
                            <Badge variant={
                              dish.recommendation === 'promote' ? 'default' :
                              dish.recommendation === 'keep' ? 'secondary' :
                              dish.recommendation === 'improve' ? 'outline' :
                              'destructive'
                            }>
                              {dish.recommendation === 'promote' && '🚀 Khuyến mãi'}
                              {dish.recommendation === 'keep' && '✓ Giữ lại'}
                              {dish.recommendation === 'improve' && '⚠ Cải thiện'}
                              {dish.recommendation === 'remove' && '✕ Loại bỏ'}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-primary">
                              {dish.revenue.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {dish.orders} đơn
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{dish.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Sentiment:</span>
                              <Progress value={dish.sentiment * 100} className="flex-1 max-w-[200px]" />
                              <span className="text-xs">{(dish.sentiment * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Menu Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Khuyến nghị tối ưu thực đơn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.filter(i => i.category === 'menu').map(insight => (
                    <div key={insight.id} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{insight.title}</div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        <p className="text-sm text-primary">{insight.recommendation}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Phân tích cảm xúc khách hàng
                  </CardTitle>
                  <CardDescription>
                    Sử dụng NLP để phân tích đánh giá
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sentiment Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sentimentData && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                            <span>Tích cực</span>
                          </div>
                          <span className="font-medium">{sentimentData.positive.toFixed(1)}%</span>
                        </div>
                        <Progress value={sentimentData.positive} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-primary" />
                            <span>Trung tính</span>
                          </div>
                          <span className="font-medium">{sentimentData.neutral.toFixed(1)}%</span>
                        </div>
                        <Progress value={sentimentData.neutral} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                            <span>Tiêu cực</span>
                          </div>
                          <span className="font-medium">{sentimentData.negative.toFixed(1)}%</span>
                        </div>
                        <Progress value={sentimentData.negative} className="h-2" />
                      </div>

                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-primary mb-1">Khuyến nghị:</p>
                            <p className="text-muted-foreground">
                              {sentimentData.positive > 70 
                                ? 'Xuất sắc! Tiếp tục duy trì chất lượng và chia sẻ feedback tích cực trên social media.'
                                : sentimentData.negative > 20
                                ? 'Cần cải thiện! Tập trung vào các vấn đề được khách hàng phản ánh nhiều nhất.'
                                : 'Tốt! Tiếp tục cải thiện trải nghiệm khách hàng để tăng tỷ lệ hài lòng.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Common Complaints & Praises */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    Điểm mạnh (từ khóa tích cực)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Ngon', 'Tươi', 'Nhanh', 'Nhiệt tình', 'Sạch sẽ', 'Đẹp', 'Giá tốt', 'Chất lượng'].map(tag => (
                      <Badge key={tag} variant="secondary" className="text-green-700 bg-green-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    Điểm cần cải thiện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Chậm', 'Nhỏ', 'Đắt', 'Nguội', 'Ít'].map(tag => (
                      <Badge key={tag} variant="secondary" className="text-red-700 bg-red-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            {/* Operational Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.filter(i => i.category === 'operation').map(insight => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {insight.title}
                      </CardTitle>
                      {insight.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-primary">{insight.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Staffing Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Khuyến nghị nhân sự theo giờ
                </CardTitle>
                <CardDescription>
                  Tối ưu hóa lịch làm việc dựa trên dữ liệu đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '10:00 - 12:00', level: 'medium', staff: '3-4 nhân viên', reason: 'Thời gian chuẩn bị và khách hàng bắt đầu tăng' },
                    { time: '12:00 - 14:00', level: 'high', staff: '6-7 nhân viên', reason: 'Giờ cao điểm trưa - số đơn hàng tăng đột biến' },
                    { time: '14:00 - 17:00', level: 'low', staff: '2-3 nhân viên', reason: 'Giờ thấp điểm - có thể giảm nhân sự' },
                    { time: '17:00 - 20:00', level: 'high', staff: '6-8 nhân viên', reason: 'Giờ cao điểm tối - khách hàng đông nhất' },
                    { time: '20:00 - 22:00', level: 'medium', staff: '3-4 nhân viên', reason: 'Giảm dần về cuối ngày' }
                  ].map((schedule, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{schedule.time}</span>
                          <Badge variant={
                            schedule.level === 'high' ? 'destructive' :
                            schedule.level === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {schedule.level === 'high' ? '🔴 Cao điểm' :
                             schedule.level === 'medium' ? '🟡 Trung bình' :
                             '🟢 Thấp điểm'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{schedule.reason}</div>
                        <div className="text-sm text-primary font-medium">
                          Khuyến nghị: {schedule.staff}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Tối ưu nguyên liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { item: 'Thịt bò', status: 'high', action: 'Tăng nhập kho 20%', reason: 'Phở Bò và Bò Lúc Lắc đang rất phổ biến' },
                    { item: 'Cà chua', status: 'low', action: 'Giảm 15%', reason: 'Salad có nhu cầu thấp' },
                    { item: 'Gạo', status: 'optimal', action: 'Duy trì hiện tại', reason: 'Cân đối tốt với nhu cầu' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        item.status === 'high' ? 'text-red-600' :
                        item.status === 'low' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{item.item}</div>
                        <div className="text-sm text-primary">{item.action}</div>
                        <div className="text-sm text-muted-foreground">{item.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
