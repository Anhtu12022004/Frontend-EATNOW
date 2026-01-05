import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BranchCard } from '../cards/BranchCard';
import { branches as mockBranches } from '../../data/mockData';
import { Branch } from '../../types';
import { branchService } from '../../services/branch';

interface BranchListPageProps {
  onViewMenu: (branchId: string) => void;
}

export function BranchListPage({ onViewMenu }: BranchListPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  
  // State cho branches từ API
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API lấy tất cả chi nhánh
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gọi API lấy tất cả branches
        const allBranches = await branchService.getAllBranches();
        setBranches(allBranches);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Không thể tải danh sách chi nhánh');
        
        // Fallback về mock data
        setBranches(mockBranches);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Lấy danh sách quận từ branches
  const districts = ['all', ...Array.from(new Set(branches.map(b => b.district).filter(Boolean)))];

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === 'all' || branch.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontSize: '32px' }}>Danh sách chi nhánh</h1>
          <p className="text-muted-foreground mt-2">
            Tìm chi nhánh gần bạn nhất
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Đang tải chi nhánh...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-4 mb-4">
            <p className="text-destructive mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">Đang hiển thị dữ liệu mẫu</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {/* Filters */}
            <div className="bg-card rounded-xl border p-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên hoặc địa chỉ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quận" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả quận</SelectItem>
                      {districts.filter(d => d !== 'all').map((district) => (
                        <SelectItem key={district} value={district as string}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Tìm thấy {filteredBranches.length} chi nhánh
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBranches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onViewMenu={onViewMenu}
                />
              ))}
            </div>

            {filteredBranches.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Không tìm thấy chi nhánh phù hợp
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
