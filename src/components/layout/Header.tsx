import { Coffee, Search, ShoppingCart, User, Menu, LogOut, UserCircle, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Customer } from '../../types';

interface HeaderProps {
  cartCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  isLoggedIn?: boolean;
  customer?: Customer;
  onLogin?: () => void;
  onLogout?: () => void;
  onProfile?: () => void;
  onReservation?: () => void;
}

export function Header({ 
  cartCount = 0, 
  onMenuClick, 
  onCartClick,
  isLoggedIn = false,
  customer,
  onLogin,
  onLogout,
  onProfile,
  onReservation
}: HeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button className="lg:hidden" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Coffee className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <div className="tracking-tight" style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.2 }}>
                  EATNOW
                </div>
                <div className="text-[10px] text-muted-foreground" style={{ marginTop: '-2px' }}>
                  Order • Manage • Serve
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Tìm món hoặc quán..." 
                className="pl-10 rounded-lg"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn && customer ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={onReservation}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Đặt bàn
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={onCartClick}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full"
                      style={{ fontSize: '10px' }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <div className="text-sm">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">Khách hàng</div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onProfile}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Thông tin cá nhân</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onReservation}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Đặt bàn</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Đơn hàng của tôi</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden sm:inline-flex"
                  onClick={onLogin}
                >
                  Đăng nhập
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={onLogin}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Tìm món hoặc quán..." 
              className="pl-10 rounded-lg"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
