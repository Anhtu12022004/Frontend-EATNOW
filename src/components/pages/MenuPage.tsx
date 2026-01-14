import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { MenuItemCard } from '../cards/MenuItemCard';
import { menuItems as mockMenuItems } from '../../data/mockData';
import { MenuItem, Branch } from '../../types';
import { menuService } from '../../services/menu';
import { branchService } from '../../services/branch';

interface MenuPageProps {
  branchId: string;
  onBack: () => void;
}

export function MenuPage({ branchId, onBack }: MenuPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['all', 'Món chính', 'Khai vị', 'Tráng miệng', 'Đồ uống', 'Món đặc biệt'];

  // Gọi API lấy menu và thông tin chi nhánh
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gọi API lấy menu của chi nhánh và thông tin chi nhánh song song
        const [items, branchInfo] = await Promise.all([
          menuService.getMenuItemsByBranch(branchId),
          branchService.getBranchById(branchId)
        ]);
        
        setMenuItems(items);
        setBranch(branchInfo);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải menu');
        
        // Fallback về mock data
        setMenuItems(mockMenuItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [branchId]);

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>

          <div>
            <h1 style={{ fontSize: '28px' }}>Menu - {branch?.name || 'Đang tải...'}</h1>
            <p className="text-sm text-muted-foreground">
              {branch?.address || ''} {branch?.hours ? `• Mở cửa: ${branch.hours}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Đang tải menu...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-destructive mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">Đang hiển thị dữ liệu mẫu</p>
          </div>
        )}

        {/* Category Tabs */}
        {!isLoading && (
          <>
            <div className="mb-8">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="flex-shrink-0"
                    >
                      {category === 'all' ? 'Tất cả' : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  branchDishId={item.id} // item.id is branchDishId when fetched from branch menu
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Không có món nào trong danh mục này
                </p>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
