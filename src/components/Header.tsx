import { Link } from "react-router-dom";
import { Search, Home, LayoutDashboard } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Search className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              بحث في نصوص
            </span>
          </Link>
          
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <Home className="h-4 w-4" />
              <span>الرئيسية</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>لوحة التحكم</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
