import { Home, Scissors, Upload, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "الرئيسية", icon: Home, path: "/" },
  { title: "منشئ الفيديوهات القصيرة", icon: Scissors, path: "/creators" },
  { title: "رفع البيانات", icon: Upload, path: "/dashboard" },
  { title: "إدارة النصوص", icon: Settings, path: "/manage" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <nav className="sticky top-8 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
