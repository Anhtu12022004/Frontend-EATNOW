import { Branch, MenuItem, Order, Staff, Customer, Rating, Table, Reservation } from '../types';

export const branches: Branch[] = [
  {
    id: '1',
    name: 'EATNOW - Nguyễn Huệ',
    address: '123 Nguyễn Huệ, Quận 1',
    district: 'Quận 1',
    hours: '10:00 - 22:00',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1669131196140-49591336b13e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzYwMzczOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    distance: 0.5
  },
  {
    id: '2',
    name: 'EATNOW - Phạm Ngọc Thạch',
    address: '456 Phạm Ngọc Thạch, Quận 3',
    district: 'Quận 3',
    hours: '10:00 - 22:00',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1669131196140-49591336b13e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzYwMzczOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    distance: 1.2
  },
  {
    id: '3',
    name: 'EATNOW - Lê Văn Sỹ',
    address: '789 Lê Văn Sỹ, Quận Phú Nhuận',
    district: 'Quận Phú Nhuận',
    hours: '10:00 - 23:00',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1669131196140-49591336b13e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzYwMzczOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    distance: 2.0
  },
  {
    id: '4',
    name: 'EATNOW - Trần Hưng Đạo',
    address: '321 Trần Hưng Đạo, Quận 5',
    district: 'Quận 5',
    hours: '10:00 - 22:00',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1669131196140-49591336b13e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzYwMzczOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    distance: 3.5
  }
];

export const menuItems: MenuItem[] = [
  {
    id: 'm1',
    name: 'Phở Bò Đặc Biệt',
    description: 'Phở truyền thống với thịt bò tươi, nước dùng ninh 12 giờ',
    price: 75000,
    category: 'Món chính',
    image: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwcGhvJTIwbm9vZGxlc3xlbnwxfHx8fDE3NjA0NDY5MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    bestSeller: true
  },
  {
    id: 'm2',
    name: 'Cơm Gà Teriyaki',
    description: 'Đùi gà nướng sốt teriyaki, cơm Nhật, rau củ tươi',
    price: 85000,
    category: 'Món chính',
    image: 'https://images.unsplash.com/photo-1698556410824-4059a7ba055d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMHJpY2V8ZW58MXx8fHwxNzYwNDQxOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    bestSeller: true
  },
  {
    id: 'm3',
    name: 'Bít Tết Bò Úc',
    description: 'Thăn bò Úc 200g, khoai tây nghiền, sốt tiêu đen',
    price: 195000,
    category: 'Món chính',
    image: 'https://images.unsplash.com/photo-1690983322475-29a61c585204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVhayUyMGJlZWYlMjBtZWFsfGVufDF8fHx8MTc2MDQ0NjkxOHww&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    isNew: false
  },
  {
    id: 'm4',
    name: 'Mì Ý Carbonara',
    description: 'Mì fettuccine, sốt kem, bacon giòn, phô mai Parmesan',
    price: 95000,
    category: 'Món chính',
    image: 'https://images.unsplash.com/photo-1749169337822-d875fd6f4c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGl0YWxpYW4lMjBkaXNofGVufDF8fHx8MTc2MDM0MjM1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    available: true
  },
  {
    id: 'm5',
    name: 'Cơm Chiên Dương Châu',
    description: 'Cơm chiên với tôm, xúc xích, trứng, rau củ hỗn hợp',
    price: 65000,
    category: 'Món chính',
    image: 'https://images.unsplash.com/photo-1646340916384-9845d7686e2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHJpY2UlMjBhc2lhbnxlbnwxfHx8fDE3NjAzNzEwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    bestSeller: true
  },
  {
    id: 'm6',
    name: 'Gỏi Cuốn Tôm Thịt',
    description: 'Tôm tươi, thịt heo luộc, bún, rau thơm, bánh tráng',
    price: 45000,
    category: 'Khai vị',
    image: 'https://images.unsplash.com/photo-1595238734477-ae7f8a79ce02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcHJpbmclMjByb2xscyUyMHZpZXRuYW1lc2V8ZW58MXx8fHwxNzYwNDQ2OTE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    isNew: false
  },
  {
    id: 'm7',
    name: 'Salad Rau Củ Hỗn Hợp',
    description: 'Rau xà lách, cà chua, dưa leo, sốt mayonnaise tự làm',
    price: 55000,
    category: 'Khai vị',
    image: 'https://images.unsplash.com/photo-1606757819934-d61a9f7279d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGZyZXNoJTIwaGVhbHRoeXxlbnwxfHx8fDE3NjA0NDY5MjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true
  },
  {
    id: 'm8',
    name: 'Tiramisu',
    description: 'Bánh ngọt Ý truyền thống với cà phê và mascarpone',
    price: 65000,
    category: 'Tráng miệng',
    image: 'https://images.unsplash.com/photo-1680090966795-06fdd0e7046b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNzZXJ0JTIwY2FrZXxlbnwxfHx8fDE3NjAzOTczNzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    bestSeller: true
  },
  {
    id: 'm9',
    name: 'Chocolate Lava Cake',
    description: 'Bánh chocolate nóng chảy, kem vanilla, sốt chocolate',
    price: 70000,
    category: 'Tráng miệng',
    image: 'https://images.unsplash.com/photo-1680090966795-06fdd0e7046b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNzZXJ0JTIwY2FrZXxlbnwxfHx8fDE3NjAzOTczNzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    isNew: true
  },
  {
    id: 'm10',
    name: 'Cà Phê Sữa Đá',
    description: 'Cà phê phin truyền thống Việt Nam, sữa đặc',
    price: 35000,
    category: 'Đồ uống',
    image: 'https://images.unsplash.com/photo-1636256290269-817753a83c4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwY29mZmVlJTIwZHJpbmt8ZW58MXx8fHwxNzYwNDQ2MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    bestSeller: true
  },
  {
    id: 'm11',
    name: 'Trà Đào Cam Sả',
    description: 'Trà xanh, đào tươi, cam vàng, sả thơm mát',
    price: 45000,
    category: 'Đồ uống',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwY29mZmVlfGVufDF8fHx8MTc2MDM2OTk1OXww&ixlib=rb-4.1.0&q=80&w=1080',
    available: true
  },
  {
    id: 'm12',
    name: 'Set Lẩu Thái',
    description: 'Lẩu Thái chua cay, hải sản tươi sống, rau nấm đa dạng (2-3 người)',
    price: 299000,
    category: 'Món đặc biệt',
    image: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwcGhvJTIwbm9vZGxlc3xlbnwxfHx8fDE3NjA0NDY5MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    available: true,
    isNew: true
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customerId: 'c1',
    customerName: 'Nguyễn Văn A',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    items: [
      { ...menuItems[0], quantity: 2 },
      { ...menuItems[5], quantity: 1 }
    ],
    total: 195000,
    status: 'preparing',
    paymentMethod: 'momo',
    createdAt: new Date(Date.now() - 15 * 60000),
    notes: 'Không hành'
  },
  {
    id: 'ORD002',
    customerId: 'c2',
    customerName: 'Trần Thị B',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    items: [
      { ...menuItems[1], quantity: 1 },
      { ...menuItems[9], quantity: 2 }
    ],
    total: 155000,
    status: 'pending',
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 5 * 60000)
  },
  {
    id: 'ORD003',
    customerId: 'c3',
    customerName: 'Lê Minh C',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    items: [
      { ...menuItems[2], quantity: 1 },
      { ...menuItems[7], quantity: 1 }
    ],
    total: 260000,
    status: 'ready',
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 25 * 60000)
  },
  {
    id: 'ORD004',
    customerId: 'c1',
    customerName: 'Nguyễn Văn A',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    items: [
      { ...menuItems[0], quantity: 1 },
      { ...menuItems[9], quantity: 1 }
    ],
    total: 110000,
    status: 'completed',
    paymentMethod: 'momo',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
    hasRated: true
  },
  {
    id: 'ORD005',
    customerId: 'c1',
    customerName: 'Nguyễn Văn A',
    branchId: '2',
    branchName: 'EATNOW - Phạm Ngọc Thạch',
    items: [
      { ...menuItems[1], quantity: 2 },
      { ...menuItems[6], quantity: 1 },
      { ...menuItems[10], quantity: 2 }
    ],
    total: 315000,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000),
    hasRated: false
  },
  {
    id: 'ORD006',
    customerId: 'c1',
    customerName: 'Nguyễn Văn A',
    branchId: '3',
    branchName: 'EATNOW - Lê Văn Sỹ',
    items: [
      { ...menuItems[2], quantity: 1 },
      { ...menuItems[7], quantity: 1 }
    ],
    total: 260000,
    status: 'completed',
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60000),
    hasRated: false
  },
  {
    id: 'ORD007',
    customerId: 'c2',
    customerName: 'Trần Thị B',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    items: [
      { ...menuItems[4], quantity: 2 }
    ],
    total: 130000,
    status: 'completed',
    paymentMethod: 'momo',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000),
    hasRated: true
  }
];

export const mockRatings: Rating[] = [
  {
    id: 'RAT001',
    orderId: 'ORD004',
    customerId: 'c1',
    customerName: 'Nguyễn Văn A',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    type: 'dish',
    dishId: 'm1',
    dishName: 'Phở Bò Đặc Biệt',
    stars: 5,
    comment: 'Phở rất ngon, nước dùng đậm đà, thịt bò tươi. Sẽ quay lại!',
    images: ['https://images.unsplash.com/photo-1631709497146-a239ef373cf1?w=400'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
    status: 'approved'
  },
  {
    id: 'RAT002',
    orderId: 'ORD004',
    customerId: 'c1',
    customerName: 'Nguyễn Văn A',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    type: 'branch',
    stars: 5,
    comment: 'Nhà hàng sạch sẽ, nhân viên thân thiện, phục vụ nhanh. Rất hài lòng!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
    status: 'approved'
  },
  {
    id: 'RAT003',
    orderId: 'ORD007',
    customerId: 'c2',
    customerName: 'Trần Thị B',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    type: 'dish',
    dishId: 'm5',
    dishName: 'Cơm Chiên Dương Châu',
    stars: 4,
    comment: 'Cơm chiên ngon, nhiều topping. Chỉ hơi mặn một chút.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000),
    status: 'approved'
  },
  {
    id: 'RAT004',
    orderId: 'ORD007',
    customerId: 'c2',
    customerName: 'Trần Thị B',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    type: 'branch',
    stars: 4,
    comment: 'Không gian thoáng mát, view đẹp. Giá hơi cao so với khu vực.',
    images: [
      'https://images.unsplash.com/photo-1669131196140-49591336b13e?w=400',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000),
    status: 'pending'
  },
  {
    id: 'RAT005',
    orderId: 'ORD008',
    customerId: 'c3',
    customerName: 'Lê Minh C',
    branchId: '2',
    branchName: 'EATNOW - Phạm Ngọc Thạch',
    type: 'branch',
    stars: 3,
    comment: 'Phục vụ hơi chậm vào giờ cao điểm. Món ăn bình thường.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60000),
    status: 'approved'
  }
];

export const mockStaff: Staff[] = [
  {
    id: 's1',
    name: 'Nguyễn Văn Hùng',
    email: 'hung.nguyen@eatnow.vn',
    phone: '0901234567',
    role: 'chef',
    status: 'active',
    joinedDate: new Date('2024-01-15'),
    branchId: '1'
  },
  {
    id: 's2',
    name: 'Trần Thị Mai',
    email: 'mai.tran@eatnow.vn',
    phone: '0912345678',
    role: 'waiter',
    status: 'active',
    joinedDate: new Date('2024-02-20'),
    branchId: '1'
  },
  {
    id: 's3',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@eatnow.vn',
    phone: '0923456789',
    role: 'cashier',
    status: 'active',
    joinedDate: new Date('2024-03-10'),
    branchId: '1'
  },
  {
    id: 's4',
    name: 'Phạm Thị Lan',
    email: 'lan.pham@eatnow.vn',
    phone: '0934567890',
    role: 'waiter',
    status: 'active',
    joinedDate: new Date('2024-04-05'),
    branchId: '1'
  },
  {
    id: 's5',
    name: 'Võ Minh Tuấn',
    email: 'tuan.vo@eatnow.vn',
    phone: '0945678901',
    role: 'chef',
    status: 'active',
    joinedDate: new Date('2023-11-20'),
    branchId: '1'
  },
  {
    id: 's6',
    name: 'Đặng Thị Hương',
    email: 'huong.dang@eatnow.vn',
    phone: '0956789012',
    role: 'manager',
    status: 'active',
    joinedDate: new Date('2023-08-01'),
    branchId: '1'
  },
  {
    id: 's7',
    name: 'Bùi Văn Đức',
    email: 'duc.bui@eatnow.vn',
    phone: '0967890123',
    role: 'barista',
    status: 'inactive',
    joinedDate: new Date('2024-01-10'),
    branchId: '1'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0908111222',
    address: '123 Lê Lợi, Quận 1, TP.HCM',
    joinedDate: new Date('2024-01-10')
  },
  {
    id: 'c2',
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0909222333',
    address: '456 Nguyễn Trãi, Quận 5, TP.HCM',
    joinedDate: new Date('2024-02-15')
  },
  {
    id: 'c3',
    name: 'Lê Minh C',
    email: 'leminhc@gmail.com',
    phone: '0910333444',
    address: '789 Điện Biên Phủ, Quận 3, TP.HCM',
    joinedDate: new Date('2024-03-20')
  },
  {
    id: 'c4',
    name: 'Phạm Thị D',
    email: 'phamthid@gmail.com',
    phone: '0911444555',
    address: '321 Hai Bà Trưng, Quận 1, TP.HCM',
    joinedDate: new Date('2024-04-05')
  },
  {
    id: 'c5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@gmail.com',
    phone: '0912555666',
    address: '654 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    joinedDate: new Date('2024-05-12')
  },
  {
    id: 'c6',
    name: 'Võ Thị F',
    email: 'vothif@gmail.com',
    phone: '0913666777',
    address: '987 Lý Thường Kiệt, Quận 11, TP.HCM',
    joinedDate: new Date('2024-06-18')
  },
  {
    id: 'c7',
    name: 'Đặng Minh G',
    email: 'dangminhg@gmail.com',
    phone: '0914777888',
    address: '159 Trần Hưng Đạo, Quận 5, TP.HCM',
    joinedDate: new Date('2024-07-22')
  },
  {
    id: 'c8',
    name: 'Bùi Thị H',
    email: 'buithih@gmail.com',
    phone: '0915888999',
    address: '753 Võ Văn Tần, Quận 3, TP.HCM',
    joinedDate: new Date('2024-08-30')
  }
];

export const mockTables: Table[] = [
  // Branch 1 - EATNOW - Nguyễn Huệ
  { id: 't1-1', number: 'A1', seats: 2, area: 'indoor', status: 'available', branchId: '1' },
  { id: 't1-2', number: 'A2', seats: 2, area: 'indoor', status: 'available', branchId: '1' },
  { id: 't1-3', number: 'A3', seats: 4, area: 'indoor', status: 'available', branchId: '1' },
  { id: 't1-4', number: 'A4', seats: 4, area: 'indoor', status: 'occupied', branchId: '1' },
  { id: 't1-5', number: 'B1', seats: 6, area: 'outdoor', status: 'available', branchId: '1' },
  { id: 't1-6', number: 'B2', seats: 6, area: 'outdoor', status: 'reserved', branchId: '1' },
  { id: 't1-7', number: 'V1', seats: 8, area: 'vip', status: 'available', branchId: '1' },
  { id: 't1-8', number: 'V2', seats: 10, area: 'vip', status: 'available', branchId: '1' },
  
  // Branch 2 - EATNOW - Phạm Ngọc Thạch
  { id: 't2-1', number: 'A1', seats: 2, area: 'indoor', status: 'available', branchId: '2' },
  { id: 't2-2', number: 'A2', seats: 2, area: 'indoor', status: 'available', branchId: '2' },
  { id: 't2-3', number: 'A3', seats: 4, area: 'indoor', status: 'available', branchId: '2' },
  { id: 't2-4', number: 'A4', seats: 4, area: 'indoor', status: 'available', branchId: '2' },
  { id: 't2-5', number: 'B1', seats: 6, area: 'outdoor', status: 'available', branchId: '2' },
  { id: 't2-6', number: 'V1', seats: 8, area: 'vip', status: 'available', branchId: '2' },
  
  // Branch 3 - EATNOW - Lê Văn Sỹ
  { id: 't3-1', number: 'A1', seats: 2, area: 'indoor', status: 'available', branchId: '3' },
  { id: 't3-2', number: 'A2', seats: 2, area: 'indoor', status: 'available', branchId: '3' },
  { id: 't3-3', number: 'A3', seats: 4, area: 'indoor', status: 'available', branchId: '3' },
  { id: 't3-4', number: 'A4', seats: 4, area: 'indoor', status: 'available', branchId: '3' },
  { id: 't3-5', number: 'B1', seats: 6, area: 'outdoor', status: 'available', branchId: '3' },
  { id: 't3-6', number: 'B2', seats: 6, area: 'outdoor', status: 'available', branchId: '3' },
  { id: 't3-7', number: 'V1', seats: 8, area: 'vip', status: 'available', branchId: '3' },
  { id: 't3-8', number: 'V2', seats: 10, area: 'vip', status: 'available', branchId: '3' },
  
  // Branch 4 - EATNOW - Trần Hưng Đạo
  { id: 't4-1', number: 'A1', seats: 2, area: 'indoor', status: 'available', branchId: '4' },
  { id: 't4-2', number: 'A2', seats: 2, area: 'indoor', status: 'available', branchId: '4' },
  { id: 't4-3', number: 'A3', seats: 4, area: 'indoor', status: 'available', branchId: '4' },
  { id: 't4-4', number: 'A4', seats: 4, area: 'indoor', status: 'available', branchId: '4' },
  { id: 't4-5', number: 'B1', seats: 6, area: 'outdoor', status: 'available', branchId: '4' },
  { id: 't4-6', number: 'V1', seats: 8, area: 'vip', status: 'available', branchId: '4' }
];

export const mockReservations: Reservation[] = [
  {
    id: 'RES001',
    reservationCode: 'EAT20241107001',
    customerId: 'c1',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'nguyenvana@gmail.com',
    customerPhone: '0908111222',
    branchId: '1',
    branchName: 'EATNOW - Nguyễn Huệ',
    tableId: 't1-6',
    tableNumber: 'B2',
    date: new Date(Date.now() + 2 * 24 * 60 * 60000),
    time: '19:00',
    seats: 6,
    status: 'confirmed',
    depositAmount: 150000,
    depositPaid: true,
    paymentMethod: 'momo',
    notes: 'Sinh nhật, cần trang trí bàn',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60000)
  }
];
