# Tính năng Rating and Feedback - EATNOW

## Tổng quan
Đã thêm tính năng đánh giá và phản hồi cho phép khách hàng đánh giá món ăn và chi nhánh sau khi hoàn tất đơn hàng.

## Các thành phần đã thêm/cập nhật

### 1. Types mới (types/index.ts)
- **Rating interface**: Định nghĩa cấu trúc dữ liệu đánh giá
  - Hỗ trợ đánh giá món ăn hoặc chi nhánh
  - Sao (1-5), nhận xét, hình ảnh (tùy chọn)
  - Trạng thái: pending, approved, hidden
- **Order.hasRated**: Flag đánh dấu đơn hàng đã được đánh giá

### 2. Components mới

#### RatingDialog.tsx
Dialog cho phép khách hàng đánh giá:
- Chọn số sao (1-5) với animation hover
- Nhập nhận xét chi tiết
- Upload tối đa 3 hình ảnh (URL)
- Validation input trước khi submit

#### FeedbackManagement.tsx  
Component quản lý phản hồi cho Admin/Super Admin:
- Thống kê: Tổng đánh giá, chờ duyệt, đã duyệt, đã ẩn, rating trung bình
- Bộ lọc theo loại (món ăn/chi nhánh) và trạng thái
- Bảng danh sách đánh giá với đầy đủ thông tin
- Actions: Approve, Hide, Delete
- Xác nhận trước khi xóa

### 3. Components đã cập nhật

#### ProfilePage.tsx
- Thêm tab "Đơn hàng" hiển thị lịch sử đơn hàng
- Hiển thị chi tiết từng đơn hàng
- Nút đánh giá chi nhánh/món ăn (chỉ với đơn hoàn tất)
- Tích hợp RatingDialog
- Ngăn đánh giá trùng lặp

#### AdminDashboard.tsx
- Thêm tab "Đánh giá & Phản hồi"
- Tích hợp FeedbackManagement với filter theo chi nhánh
- Quick action card để truy cập feedback

#### SuperAdminDashboard.tsx
- Thêm tab "Đánh giá & Phản hồi"
- Xem tất cả đánh giá từ mọi chi nhánh
- Quick action card

#### App.tsx
- State management cho orders và ratings
- Handlers: handleRatingSubmit, handleApproveRating, handleHideRating, handleDeleteRating
- Pass data và handlers đến các components
- Auto-login user demo để test

### 4. Mock Data (mockData.ts)
- Thêm 4 đơn hàng hoàn tất (ORD004-ORD007)
- Thêm 5 đánh giá mẫu (RAT001-RAT005)
- Mix của đánh giá món ăn và chi nhánh
- Các trạng thái khác nhau (pending, approved)

## Flow sử dụng

### Customer Flow
1. Khách hàng hoàn tất đơn hàng
2. Vào Profile → Tab "Đơn hàng"
3. Chọn đơn hàng đã hoàn tất
4. Click "Đánh giá chi nhánh" hoặc "Đánh giá món ăn"
5. Nhập sao, nhận xét, upload ảnh (optional)
6. Submit đánh giá
7. Đánh giá được lưu với status "pending"
8. Đơn hàng được đánh dấu "hasRated = true"

### Admin Flow (Branch)
1. Vào Admin Dashboard → Tab "Đánh giá & Phản hồi"
2. Xem các đánh giá của chi nhánh mình quản lý
3. Lọc theo loại/trạng thái
4. Approve đánh giá tốt → status = "approved"
5. Hide đánh giá không phù hợp → status = "hidden"
6. Delete đánh giá vi phạm → xóa khỏi hệ thống

### Super Admin Flow
1. Vào Super Admin Dashboard → Tab "Đánh giá & Phản hồi"
2. Xem tất cả đánh giá từ mọi chi nhánh
3. Quản lý toàn bộ feedback trong hệ thống

## Tính năng chính

✅ **Đánh giá đa dạng**: Cả món ăn và chi nhánh
✅ **Rating 1-5 sao**: Với text mô tả (Rất tệ → Xuất sắc)
✅ **Upload hình ảnh**: Tối đa 3 ảnh, preview trước khi submit
✅ **Validation**: Chỉ đơn hoàn tất, mỗi đơn 1 lần
✅ **Moderation**: Admin approve/hide/delete
✅ **Statistics**: Thống kê tổng quan và rating trung bình
✅ **Filtering**: Lọc theo loại, trạng thái, chi nhánh
✅ **Responsive**: Hoạt động tốt trên mọi thiết bị

## Quy tắc nghiệp vụ

1. Chỉ đơn hàng "completed" mới có thể đánh giá
2. Mỗi đơn hàng chỉ được đánh giá 1 lần
3. Customer không thể sửa/xóa đánh giá sau khi gửi
4. Đánh giá mới có status "pending" mặc định
5. Admin có thể approve (hiện), hide (ẩn), hoặc delete
6. Super Admin quản lý tất cả đánh giá
7. Branch Admin chỉ thấy đánh giá của chi nhánh mình

## Testing

Demo user đã được auto-login:
- ID: c1
- Name: Nguyễn Văn A
- Email: nguyenvana@gmail.com

Có 3 đơn hàng hoàn tất để test:
- ORD004: Đã đánh giá ✓
- ORD005: Chưa đánh giá (có thể test)
- ORD006: Chưa đánh giá (có thể test)

## Cải tiến tương lai (Optional)

- [ ] Reply to feedback từ Admin
- [ ] Helpful votes cho đánh giá
- [ ] Report inappropriate feedback
- [ ] Email notification khi có đánh giá mới
- [ ] Export feedback reports
- [ ] Sentiment analysis
- [ ] Public review page
- [ ] Rating badges cho món ăn/chi nhánh
