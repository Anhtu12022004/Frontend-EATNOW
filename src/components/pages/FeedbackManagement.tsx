import { useState } from 'react';
import { Star, Check, X, Eye, EyeOff, Trash2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Rating } from '../../types';
import { toast } from 'sonner';

interface FeedbackManagementProps {
  ratings?: Rating[];
  onApprove?: (ratingId: string) => void;
  onHide?: (ratingId: string) => void;
  onDelete?: (ratingId: string) => void;
  branchId?: string; // For branch admin filtering
}

export function FeedbackManagement({ 
  ratings = [], 
  onApprove,
  onHide,
  onDelete,
  branchId 
}: FeedbackManagementProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [filterType, setFilterType] = useState<'all' | 'dish' | 'branch'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ratingId: string | null }>({
    open: false,
    ratingId: null
  });

  // Filter ratings based on branch (for branch admin) and filters
  const filteredRatings = ratings.filter(rating => {
    if (branchId && rating.branchId !== branchId) return false;
    if (filterStatus !== 'all' && rating.status !== filterStatus) return false;
    if (filterType !== 'all' && rating.type !== filterType) return false;
    return true;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: Rating['status']) => {
    const variants: Record<Rating['status'], { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: 'Chờ duyệt' },
      approved: { variant: 'default', label: 'Đã duyệt' },
      hidden: { variant: 'destructive', label: 'Đã ẩn' }
    };

    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeBadge = (type: Rating['type']) => {
    return type === 'dish' ? (
      <Badge variant="outline">Món ăn</Badge>
    ) : (
      <Badge variant="outline">Chi nhánh</Badge>
    );
  };

  const handleApprove = (ratingId: string) => {
    if (onApprove) {
      onApprove(ratingId);
      toast.success('Đã duyệt đánh giá');
    }
  };

  const handleHide = (ratingId: string) => {
    if (onHide) {
      onHide(ratingId);
      toast.success('Đã ẩn đánh giá');
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.ratingId && onDelete) {
      onDelete(deleteDialog.ratingId);
      toast.success('Đã xóa đánh giá');
      setDeleteDialog({ open: false, ratingId: null });
    }
  };

  const stats = {
    total: filteredRatings.length,
    pending: filteredRatings.filter(r => r.status === 'pending').length,
    approved: filteredRatings.filter(r => r.status === 'approved').length,
    hidden: filteredRatings.filter(r => r.status === 'hidden').length,
    avgRating: filteredRatings.length > 0 
      ? (filteredRatings.reduce((sum, r) => sum + r.stars, 0) / filteredRatings.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
              <p className="text-2xl mt-2">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              <p className="text-2xl mt-2 text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Đã duyệt</p>
              <p className="text-2xl mt-2 text-green-600">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Đã ẩn</p>
              <p className="text-2xl mt-2 text-red-600">{stats.hidden}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Đánh giá TB</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <p className="text-2xl">{stats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý đánh giá & phản hồi</CardTitle>
              <CardDescription>
                Duyệt, ẩn hoặc xóa các đánh giá từ khách hàng
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="dish">Món ăn</SelectItem>
                  <SelectItem value="branch">Chi nhánh</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="hidden">Đã ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRatings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có đánh giá nào</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Đối tượng</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRatings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell>
                        <div>
                          <p>{rating.customerName}</p>
                          <p className="text-xs text-muted-foreground">#{rating.orderId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(rating.type)}</TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          <p className="text-sm truncate">
                            {rating.type === 'dish' ? rating.dishName : rating.branchName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: rating.stars }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-1 text-sm">{rating.stars}/5</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="text-sm line-clamp-2">{rating.comment}</p>
                          {rating.images && rating.images.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {rating.images.length} hình ảnh
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(rating.createdAt)}
                      </TableCell>
                      <TableCell>{getStatusBadge(rating.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {rating.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(rating.id)}
                              title="Duyệt"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {rating.status === 'approved' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleHide(rating.id)}
                              title="Ẩn"
                            >
                              <EyeOff className="h-4 w-4 text-yellow-600" />
                            </Button>
                          )}
                          {rating.status === 'hidden' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(rating.id)}
                              title="Hiện"
                            >
                              <Eye className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, ratingId: rating.id })}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
