import { useState, useEffect } from 'react';
import { ArrowRight, Coffee, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { BranchCard } from '../cards/BranchCard';
import { MenuItemCard } from '../cards/MenuItemCard';
import { branches as mockBranches, menuItems as mockMenuItems } from '../../data/mockData';
import { MenuItem, Branch } from '../../types';
import { branchService } from '../../services/branch';
import { menuService } from '../../services/menu';

interface LandingPageProps {
  onViewMenu: (branchId: string) => void;
  onAddToCart: (item: MenuItem) => void;
  onViewBranches: () => void;
}

export function LandingPage({ onViewMenu, onAddToCart, onViewBranches }: LandingPageProps) {
  // State cho chi nhánh
  const [nearbyBranches, setNearbyBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState<string | null>(null);

  // State cho món nổi bật
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  // Gọi API lấy chi nhánh khi component mount
  useEffect(() => {
    const fetchNearbyBranches = async () => {
      try {
        setIsLoadingBranches(true);
        setBranchError(null);
        
        // Gọi API lấy chi nhánh gần nhất
        // const branches = await branchService.getNearbyBranches(3);

        const branches = await branchService.getAllBranches({ limit: 3 });
        setNearbyBranches(branches);
      } catch (error) {
        console.error('Error fetching nearby branches:', error);
        setBranchError('Không thể tải danh sách chi nhánh');
        
        // Fallback về mock data nếu API lỗi
        setNearbyBranches(mockBranches.slice(0, 3));
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchNearbyBranches();
  }, []);

  // Gọi API lấy món nổi bật khi component mount
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setIsLoadingMenu(true);
        setMenuError(null);
        
        // Gọi API lấy món best seller (backend đã trả về sẵn danh sách best seller)
        const bestSellers = await menuService.getBestSellerItems(4);
        setFeaturedItems(bestSellers);
      } catch (error) {
        console.error('Error fetching featured items:', error);
        setMenuError('Không thể tải món nổi bật');
        
        // Fallback về mock data nếu API lỗi
        const mockBestSellers = mockMenuItems.filter(item => item.bestSeller).slice(0, 4);
        setFeaturedItems(mockBestSellers);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-secondary/20 to-accent/30 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
                🎉 Khuyến mãi đặc biệt cho đơn hàng đầu tiên
              </div>
              
              <h1 style={{ fontSize: '48px', lineHeight: '1.1', fontWeight: 700 }}>
                Đặt món nhanh,
                <br />
                <span className="text-primary">Thưởng thức ngay</span>
              </h1>
              
              <p style={{ fontSize: '18px' }} className="text-muted-foreground">
                Hệ thống đặt món trực tuyến thông minh cho chuỗi nhà hàng EATNOW. 
                Đặt món dễ dàng, giao hàng nhanh chóng, đa dạng món ăn.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={onViewBranches}
                >
                  Khám phá menu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Tìm chi nhánh gần bạn
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coffee className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-sm">Món ngon</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-sm">Phục vụ nhanh</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-sm">An toàn vệ sinh</div>
                </div>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYwMzk3NTgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Coffee shop"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary rounded-2xl opacity-50"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 style={{ fontSize: '32px' }}>Chi nhánh gần bạn</h2>
              <p className="text-muted-foreground mt-2">
                Tìm nhà hàng gần nhất để thưởng thức món ngon
              </p>
            </div>
            <Button variant="ghost" onClick={onViewBranches}>
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Loading state */}
          {isLoadingBranches && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Đang tải chi nhánh...</span>
            </div>
          )}

          {/* Error state */}
          {branchError && !isLoadingBranches && (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">{branchError}</p>
              <p className="text-sm text-muted-foreground">Đang hiển thị dữ liệu mẫu</p>
            </div>
          )}

          {/* Branch list */}
          {!isLoadingBranches && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyBranches.map((branch) => (
                <BranchCard 
                  key={branch.id} 
                  branch={branch}
                  onViewMenu={onViewMenu}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '32px' }}>Món nổi bật hôm nay</h2>
            <p className="text-muted-foreground mt-2">
              Những món ăn được yêu thích nhất
            </p>
          </div>

          {/* Loading state */}
          {isLoadingMenu && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Đang tải món nổi bật...</span>
            </div>
          )}

          {/* Error state */}
          {menuError && !isLoadingMenu && (
            <div className="text-center py-4 mb-4">
              <p className="text-destructive mb-2">{menuError}</p>
              <p className="text-sm text-muted-foreground">Đang hiển thị dữ liệu mẫu</p>
            </div>
          )}

          {/* Menu items list */}
          {!isLoadingMenu && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredItems.map((item) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 style={{ fontSize: '36px' }} className="mb-4">
            Sẵn sàng đặt món?
          </h2>
          <p style={{ fontSize: '18px' }} className="mb-8 opacity-90">
            Trở thành thành viên để nhận ưu đãi đặc biệt
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            Đăng ký ngay
          </Button>
        </div>
      </section>
    </div>
  );
}
