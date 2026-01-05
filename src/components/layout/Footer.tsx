import { Coffee, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Coffee className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="tracking-tight" style={{ fontSize: '20px', fontWeight: 700 }}>
                  EATNOW
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Hệ thống nhà hàng hiện đại với đa dạng món ăn, phục vụ nhanh chóng và chất lượng cao.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4">Liên hệ</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1900 xxxx</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@eatnow.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4">Liên kết</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div><a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a></div>
              <div><a href="#" className="hover:text-primary transition-colors">Thực đơn</a></div>
              <div><a href="#" className="hover:text-primary transition-colors">Chi nhánh</a></div>
              <div><a href="#" className="hover:text-primary transition-colors">Tuyển dụng</a></div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4">Mạng xã hội</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2025 EATNOW. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
